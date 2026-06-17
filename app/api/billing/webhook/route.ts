import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { creditReferralOnFirstPayment } from "@/lib/referrals";
import type { BillingPlan } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

const VALID_PLANS: BillingPlan[] = ["starter", "pro", "multi_location", "connected" as BillingPlan];

function toDate(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

type SubscriptionWithPeriods = Stripe.Subscription & {
  trial_start?: number | null;
  trial_end?: number | null;
  current_period_end?: number | null;
};

async function upsertSubscription(
  subscription: Stripe.Subscription,
  opts?: { setGracePeriod?: boolean; clearGracePeriod?: boolean }
) {
  const supabase = await createServiceClient();
  const item = subscription.items.data[0];
  const metadata = subscription.metadata || {};
  const organisationId = metadata.organisation_id;
  const plan = metadata.plan as BillingPlan | undefined;

  if (!organisationId || !plan || !VALID_PLANS.includes(plan)) return;

  const sub = subscription as SubscriptionWithPeriods;

  // Grace period: 3 days from current_period_end when payment fails.
  // Cleared when payment succeeds or subscription recovers.
  let gracePeriodEndsAt: string | null | undefined = undefined;
  if (opts?.setGracePeriod && sub.current_period_end) {
    gracePeriodEndsAt = new Date(sub.current_period_end * 1000 + 3 * 86_400_000).toISOString();
    console.info("[billing] grace period set", { organisationId, gracePeriodEndsAt });
  } else if (opts?.clearGracePeriod) {
    gracePeriodEndsAt = null;
    console.info("[billing] grace period cleared", { organisationId });
  }

  const payload: Record<string, unknown> = {
    organisation_id: organisationId,
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    stripe_price_id: item?.price.id ?? null,
    plan,
    status: subscription.status,
    trial_start: toDate(sub.trial_start),
    trial_end: toDate(sub.trial_end),
    current_period_end: toDate(sub.current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (gracePeriodEndsAt !== undefined) {
    payload.grace_period_ends_at = gracePeriodEndsAt;
  }

  await supabase.from("billing_subscriptions").upsert(payload, { onConflict: "stripe_subscription_id" });
}

async function applyReferralCreditToStripe(
  stripe: Stripe,
  _customerId: string,
  subscriptionId: string,
  creditMonths: number
) {
  if (creditMonths <= 0) return;
  try {
    const freeDays = creditMonths * 30;
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (sub.status !== "active") return;
    const newTrialEnd = Math.floor(Date.now() / 1000) + freeDays * 86400;
    await stripe.subscriptions.update(subscriptionId, {
      trial_end: newTrialEnd,
      proration_behavior: "none",
    });
  } catch {
    // Non-fatal — DB credit record still exists for manual resolution
  }
}

/** Write a billing_events row. Returns true if this event was already processed. */
async function checkAndRecordEvent(
  stripeEventId: string,
  eventType: string,
  organisationId: string | null,
  summary: Record<string, unknown>
): Promise<boolean> {
  const supabase = await createServiceClient();

  // Try to insert — unique constraint on stripe_event_id makes this idempotent
  const { error } = await supabase.from("billing_events").insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
    organisation_id: organisationId ?? null,
    processed: false,
    summary,
  });

  if (error) {
    // 23505 = unique_violation — already processed
    if (error.code === "23505") return true;
    // Other errors: table may not exist yet (migration pending) — log and continue
    console.error("[billing_events] insert error:", error.code, error.message);
  }
  return false;
}

async function markEventProcessed(
  stripeEventId: string,
  success: boolean,
  errorMsg?: string
) {
  const supabase = await createServiceClient();
  await supabase
    .from("billing_events")
    .update({ processed: success, error: errorMsg ?? null })
    .eq("stripe_event_id", stripeEventId)
    .eq("processed", false);
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Billing webhook is not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Idempotency check ──────────────────────────────────────────────────────
  let orgId: string | null = null;
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    orgId = (event.data.object as Stripe.Subscription).metadata?.organisation_id ?? null;
  } else if (event.type === "checkout.session.completed") {
    orgId = (event.data.object as Stripe.Checkout.Session).metadata?.organisation_id ?? null;
  }
  // invoice.* events: org ID resolved after subscription lookup below

  const alreadyProcessed = await checkAndRecordEvent(event.id, event.type, orgId, {
    livemode: event.livemode,
  });

  if (alreadyProcessed) {
    // Stripe retries on non-2xx; returning 200 tells Stripe the event was handled.
    return NextResponse.json({ received: true, duplicate: true });
  }

  // ── Event handling ─────────────────────────────────────────────────────────
  let processingError: string | undefined;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
        await upsertSubscription(subscription);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await upsertSubscription(event.data.object as Stripe.Subscription);
    }

    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | null;
        billing_reason?: string | null;
        amount_paid?: number;
      };

      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(String(invoice.subscription));
        const isFailure = event.type === "invoice.payment_failed";
        const isSuccess = event.type === "invoice.paid" || event.type === "invoice.payment_succeeded";

        // Grace period: set on first failure, clear on any success
        await upsertSubscription(subscription, {
          setGracePeriod: isFailure && subscription.status === "past_due",
          clearGracePeriod: isSuccess,
        });

        // Referral credit on first real payment
        const isRealPayment =
          isSuccess &&
          (invoice.amount_paid ?? 0) > 0 &&
          (invoice.billing_reason === "subscription_create" ||
            invoice.billing_reason === "subscription_cycle");

        if (isRealPayment) {
          const subOrgId = subscription.metadata?.organisation_id;
          if (subOrgId) {
            const supabase = await createServiceClient();

            const { data: org } = await supabase
              .from("organisations")
              .select("referred_by_code, referral_credit_months")
              .eq("id", subOrgId)
              .maybeSingle();

            if (org?.referred_by_code) {
              await creditReferralOnFirstPayment(subOrgId).catch(() => null);
            }

            const creditMonths = Number(org?.referral_credit_months ?? 0);
            if (creditMonths > 0 && invoice.customer) {
              const { data: claimed } = await supabase
                .from("organisations")
                .update({ referral_credit_months: 0 })
                .eq("id", subOrgId)
                .eq("referral_credit_months", creditMonths)
                .select("id")
                .maybeSingle();

              if (claimed) {
                await applyReferralCreditToStripe(
                  stripe,
                  String(invoice.customer),
                  subscription.id,
                  creditMonths
                );
              }
            }
          }
        }
      }
    }
  } catch (err) {
    processingError = err instanceof Error ? err.message : String(err);
    console.error("[billing webhook] error processing event", event.id, processingError);
  } finally {
    await markEventProcessed(event.id, !processingError, processingError);
  }

  // Always return 200 to Stripe to prevent infinite retries on transient errors.
  // The error is logged in billing_events for manual inspection.
  return NextResponse.json({ received: true });
}
