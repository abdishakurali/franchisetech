import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { CARD_VERIFICATION_AMOUNT_CENTS, getCardVerificationPriceId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

// Creates the one-time €1 card verification Checkout Session. Trial retired
// 2026-09 — this no longer gates anything (every org is permanently on Free
// until it subscribes), but the card is still saved for later off-session use
// so an eventual subscription checkout reuses the same Stripe customer.
export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const service = await createServiceClient();

  const { data: membership } = await service
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Organisation membership required" }, { status: 403 });
  }

  const orgId = membership.organisation_id;

  const { data: org } = await service
    .from("organisations")
    .select("name, trial_started_at, card_verified_at")
    .eq("id", orgId)
    .maybeSingle();

  if (org?.trial_started_at || org?.card_verified_at) {
    return NextResponse.json({ alreadyVerified: true, url: null });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const priceId = getCardVerificationPriceId();

  // Same guard as the subscription checkout: never charge an unexpected amount.
  const stripePrice = await stripe.prices.retrieve(priceId);
  if (stripePrice.unit_amount !== CARD_VERIFICATION_AMOUNT_CENTS) {
    const mismatch = { priceId, stripeAmount: stripePrice.unit_amount, expectedAmount: CARD_VERIFICATION_AMOUNT_CENTS };
    if (process.env.NODE_ENV === "production") {
      console.error("[billing] card verification price mismatch — blocked", mismatch);
      return NextResponse.json(
        { error: "Verification price mismatch. Contact support." },
        { status: 503 }
      );
    }
    console.warn("[billing] card verification price mismatch — allowed in dev", mismatch);
  }

  // Reuse the org's Stripe customer if one exists so the saved card and the
  // future subscription live on the same customer.
  const { data: existingSub } = await service
    .from("billing_subscriptions")
    .select("stripe_customer_id")
    .eq("organisation_id", orgId)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id ?? null;
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) customerId = null;
    } catch (error) {
      if ((error as { code?: string }).code === "resource_missing") {
        customerId = null;
      } else {
        throw error;
      }
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: org?.name ?? undefined,
      metadata: { organisation_id: orgId, app: "franchisetech" },
    });
    customerId = customer.id;

    // Persist immediately so concurrent requests and the later subscription
    // checkout reuse the same customer (same pattern as /api/billing/checkout).
    const pendingPayload = {
      organisation_id: orgId,
      stripe_customer_id: customerId,
      plan: "starter",
      status: "incomplete",
      updated_at: new Date().toISOString(),
    };
    const { data: pendingSub } = await service
      .from("billing_subscriptions")
      .select("id")
      .eq("organisation_id", orgId)
      .eq("status", "incomplete")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error: pendingError } = pendingSub?.id
      ? await service.from("billing_subscriptions").update(pendingPayload).eq("id", pendingSub.id)
      : await service.from("billing_subscriptions").insert(pendingPayload);
    if (pendingError) {
      console.error("[billing] failed to persist verification customer", pendingError);
      return NextResponse.json({ error: "Could not prepare billing account. Try again." }, { status: 500 });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    payment_intent_data: {
      setup_future_usage: "off_session",
      metadata: { organisation_id: orgId, purpose: "card_verification", app: "franchisetech" },
    },
    metadata: {
      organisation_id: orgId,
      user_id: user.id,
      purpose: "card_verification",
      app: "franchisetech",
    },
    client_reference_id: orgId,
    success_url: `${appUrl}/onboarding/verify-card/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/onboarding/verify-card?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
