import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { creditReferralOnFirstPayment } from "@/lib/referrals";
import { trackLoopsEvent } from "@/lib/loops";
import { syncStripeSubscription } from "@/lib/billing/stripe-sync";

export const dynamic = "force-dynamic";

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

type EventRecordStatus = "new" | "retry" | "processed";

/** Write a billing_events row. Processed duplicates are skipped; failed/unprocessed duplicates retry. */
async function checkAndRecordEvent(
  stripeEventId: string,
  eventType: string,
  organisationId: string | null,
  summary: Record<string, unknown>
): Promise<EventRecordStatus> {
  const supabase = await createServiceClient();

  const { data: existing } = await supabase
    .from("billing_events")
    .select("processed")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();

  if (existing?.processed) return "processed";
  if (existing) return "retry";

  const { error } = await supabase.from("billing_events").insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
    organisation_id: organisationId ?? null,
    processed: false,
    summary,
  });

  if (error) {
    if (error.code === "23505") return "retry";
    // Other errors: table may not exist yet (migration pending) — log and continue
    console.error("[billing_events] insert error:", error.code, error.message);
  }
  return "new";
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

  const eventRecordStatus = await checkAndRecordEvent(event.id, event.type, orgId, {
    livemode: event.livemode,
  });

  if (eventRecordStatus === "processed") {
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
        const sync = await syncStripeSubscription(subscription, {
          fallbackOrganisationId: session.metadata?.organisation_id ?? session.client_reference_id,
          fallbackPlan: session.metadata?.plan,
          clearGracePeriod: true,
        });
        if (!sync.synced) throw new Error(`checkout_subscription_sync_failed:${sync.reason ?? "unknown"}`);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const sync = await syncStripeSubscription(subscription);
      if (!sync.synced) throw new Error(`subscription_sync_failed:${sync.reason ?? "unknown"}`);

      if (event.type === "customer.subscription.created") {
        let customerEmail: string | null = null;
        const customerId = subscription.customer;
        if (customerId) {
          const customer = await stripe.customers.retrieve(String(customerId));
          if (!customer.deleted && customer.email) {
            customerEmail = customer.email;
          }
        }
        if (customerEmail) {
          void trackLoopsEvent(customerEmail, "subscription_created", {
            organisationId: subscription.metadata?.organisation_id ?? "",
            plan: subscription.metadata?.plan ?? "",
            status: subscription.status,
          });
        }
      }
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
        const sync = await syncStripeSubscription(subscription, {
          setGracePeriod: isFailure && subscription.status === "past_due",
          clearGracePeriod: isSuccess,
        });
        if (!sync.synced) throw new Error(`invoice_subscription_sync_failed:${sync.reason ?? "unknown"}`);

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

  if (processingError) {
    return NextResponse.json({ received: false, error: processingError }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
