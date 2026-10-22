import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { type BillingPlan, getPlan, getPriceId, isBillingConfigured } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

// "free" is deliberately excluded — it never has a Stripe subscription, so it
// never goes through checkout.
const VALID_PLANS: BillingPlan[] = ["starter", "core", "pro", "operations", "multi_location", "scale", "growth", "team"];

export async function POST(request: Request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const plan = body?.plan as BillingPlan | undefined;
  const interval: "month" | "year" = body?.interval === "year" ? "year" : "month";

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan, interval);
  if (!priceId) {
    return NextResponse.json(
      { error: `Plan '${plan}' is not available yet. Contact support.` },
      { status: 503 }
    );
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const service = await createServiceClient();

  // Any organisation member can start checkout. Payment should not be blocked by role.
  const { data: membership } = await service
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "Organisation membership required to start checkout" },
      { status: 403 }
    );
  }

  const orgId = membership.organisation_id;

  // Guard: prevent duplicate active subscriptions
  const { data: activeSub } = await service
    .from("billing_subscriptions")
    .select("id, status, plan")
    .eq("organisation_id", orgId)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();

  if (activeSub) {
    return NextResponse.json(
      { error: "You already have an active subscription. Use Manage billing to change your plan." },
      { status: 409 }
    );
  }

  // Look up existing Stripe customer ID
  const { data: existingSub } = await service
    .from("billing_subscriptions")
    .select("stripe_customer_id")
    .eq("organisation_id", orgId)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: org } = await service
    .from("organisations")
    .select("name, referral_code, referral_credit_months, stripe_customer_id")
    .eq("id", orgId)
    .maybeSingle();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const stripePrice = await stripe.prices.retrieve(priceId);
  const expected = getPlan(plan);
  const expectedCents = interval === "year" ? expected.annualAmountCents : expected.amountCents;
  if (stripePrice.unit_amount !== expectedCents) {
    const mismatch = {
      plan,
      interval,
      priceId,
      stripeAmount: stripePrice.unit_amount,
      expectedAmount: expectedCents,
    };
    if (process.env.NODE_ENV === "production") {
      console.error("[billing] Stripe price mismatch — blocked", mismatch);
      return NextResponse.json(
        { error: "Billing price mismatch. Contact support — checkout is temporarily unavailable." },
        { status: 503 }
      );
    }
    // In dev/test: log and proceed so the checkout flow can be tested end-to-end.
    console.warn("[billing] Stripe price mismatch — allowed in dev", mismatch);
  }

  // Get or create Stripe customer
  let customerId = org?.stripe_customer_id ?? existingSub?.stripe_customer_id ?? null;
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        customerId = null;
      }
    } catch (error) {
      const stripeError = error as { code?: string };
      if (stripeError.code === "resource_missing") {
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
      metadata: {
        organisation_id: orgId,
        app: "franchisetech",
      },
    });
    customerId = customer.id;
    const pendingPayload = {
      organisation_id: orgId,
      stripe_customer_id: customerId,
      plan,
      status: "incomplete",
      updated_at: new Date().toISOString(),
    };

    // One canonical row per organisation: update the existing snapshot or
    // create it atomically so customer recovery cannot violate the unique key.
    const { error: pendingError } = await service
      .from("billing_subscriptions")
      .upsert(pendingPayload, { onConflict: "organisation_id" });

    if (pendingError) {
      console.error("[billing] failed to persist checkout customer", pendingError);
      return NextResponse.json({ error: "Could not prepare billing account. Try again." }, { status: 500 });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        organisation_id: orgId,
        user_id: user.id,
        plan,
        app: "franchisetech",
        referral_code: org?.referral_code ?? "",
        referral_credit_months: String(org?.referral_credit_months ?? 0),
      },
    },
    metadata: {
      organisation_id: orgId,
      user_id: user.id,
      plan,
      app: "franchisetech",
      referral_code: org?.referral_code ?? "",
      referral_credit_months: String(org?.referral_credit_months ?? 0),
    },
    client_reference_id: orgId,
    success_url: `${appUrl}/app/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/app/billing/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
