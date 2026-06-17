import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { type BillingPlan, getPriceId, isBillingConfigured } from "@/lib/billing/plans";
import { canManageBilling } from "@/lib/access-control";

export const dynamic = "force-dynamic";

const VALID_PLANS: BillingPlan[] = ["starter", "pro", "multi_location"];

export async function POST(request: Request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const plan = body?.plan as BillingPlan | undefined;

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan);
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

  // Role check — billing is owner-only by default.
  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role, status")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .limit(1)
    .maybeSingle();

  if (!membership || !canManageBilling(membership.role)) {
    return NextResponse.json(
      { error: "Only an owner can start checkout" },
      { status: 403 }
    );
  }

  const orgId = membership.organisation_id;
  const service = await createServiceClient();

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
    .limit(1)
    .maybeSingle();

  const { data: org } = await service
    .from("organisations")
    .select("name, referral_code, referral_credit_months")
    .eq("id", orgId)
    .maybeSingle();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Get or create Stripe customer
  let customerId = existingSub?.stripe_customer_id ?? null;
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
    // Persist it immediately so concurrent requests reuse the same customer
    await service
      .from("billing_subscriptions")
      .upsert(
        {
          organisation_id: orgId,
          stripe_customer_id: customerId,
          plan,
          status: "incomplete",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organisation_id" }
      );
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
