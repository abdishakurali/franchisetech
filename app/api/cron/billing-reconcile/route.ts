// POST /api/cron/billing-reconcile
// Requires: Authorization: Bearer <CRON_SECRET>
// Repairs missed Stripe webhook/success-page subscription activation.

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { syncStripeSubscription } from "@/lib/billing/stripe-sync";
import { selectCanonicalSubscription } from "@/lib/billing/reconciliation";

export const dynamic = "force-dynamic";

type BillingRow = {
  id: string;
  organisation_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
};

async function runBillingReconcile(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 });
  }

  const supabase = await createServiceClient();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { data: rows, error } = await supabase
    .from("billing_subscriptions")
    .select("id, organisation_id, stripe_customer_id, stripe_subscription_id, plan, status")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const billingRows = (rows as BillingRow[]) ?? [];
  const orgByCustomer = new Map(
    billingRows
      .filter((row) => row.stripe_customer_id)
      .map((row) => [row.stripe_customer_id as string, row.organisation_id]),
  );
  const subscriptionsByOrg = new Map<string, Stripe.Subscription[]>();

  // Walk customers, not only locally-known subscription ids. This recovers
  // subscriptions whose create/update webhook never reached Supabase.
  for await (const customer of stripe.customers.list({ limit: 100 })) {
    const organisationId = customer.metadata?.organisation_id ?? orgByCustomer.get(customer.id);
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 100,
    });
    for (const subscription of subscriptions.data) {
      const resolvedOrganisationId = subscription.metadata?.organisation_id ?? organisationId;
      if (!resolvedOrganisationId) continue;
      const candidates = subscriptionsByOrg.get(resolvedOrganisationId) ?? [];
      candidates.push(subscription);
      subscriptionsByOrg.set(resolvedOrganisationId, candidates);
    }
  }

  let checked = 0;
  let synced = 0;
  let skipped = 0;
  let failed = 0;
  const failures: Array<{ organisationId: string; reason: string }> = [];

  const rowsByOrg = new Map(billingRows.map((row) => [row.organisation_id, row]));
  const organisationIds = new Set([...rowsByOrg.keys(), ...subscriptionsByOrg.keys()]);
  for (const organisationId of organisationIds) {
    const row = rowsByOrg.get(organisationId);
    checked++;
    try {
      const subscription = selectCanonicalSubscription(subscriptionsByOrg.get(organisationId) ?? []);

      if (!subscription) {
        if (row && row.status !== "canceled") {
          const { error: closeError } = await supabase
            .from("billing_subscriptions")
            .update({ status: "canceled", grace_period_ends_at: null, updated_at: new Date().toISOString() })
            .eq("organisation_id", organisationId);
          if (closeError) throw closeError;
          synced++;
        } else {
          skipped++;
        }
        continue;
      }

      const result = await syncStripeSubscription(subscription, {
        fallbackOrganisationId: organisationId,
        fallbackPlan: row?.plan,
        clearGracePeriod: subscription.status !== "past_due",
      });

      if (result.synced) {
        synced++;
      } else {
        failed++;
        failures.push({ organisationId, reason: result.reason ?? "unknown" });
      }
    } catch (err) {
      failed++;
      failures.push({ organisationId, reason: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ checked, synced, skipped, failed, failures });
}

export const GET = runBillingReconcile;
export const POST = runBillingReconcile;
