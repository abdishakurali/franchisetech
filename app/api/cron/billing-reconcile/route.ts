// POST /api/cron/billing-reconcile
// Requires: Authorization: Bearer <CRON_SECRET>
// Repairs missed Stripe webhook/success-page subscription activation.

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { syncStripeSubscription } from "@/lib/billing/stripe-sync";

export const dynamic = "force-dynamic";

type BillingRow = {
  id: string;
  organisation_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
};

export async function POST(req: NextRequest) {
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
    .not("stripe_customer_id", "is", null)
    .or("status.eq.incomplete,stripe_subscription_id.is.null")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let checked = 0;
  let synced = 0;
  let skipped = 0;
  let failed = 0;
  const failures: Array<{ organisationId: string; reason: string }> = [];

  for (const row of (rows as BillingRow[]) ?? []) {
    if (!row.stripe_customer_id) {
      skipped++;
      continue;
    }

    checked++;
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: row.stripe_customer_id,
        status: "all",
        limit: 10,
      });

      const subscription = subscriptions.data.find((sub) =>
        ["active", "trialing", "past_due"].includes(sub.status)
      );

      if (!subscription) {
        skipped++;
        continue;
      }

      const result = await syncStripeSubscription(subscription, {
        fallbackOrganisationId: row.organisation_id,
        fallbackPlan: row.plan,
        clearGracePeriod: subscription.status !== "past_due",
      });

      if (result.synced) {
        synced++;
      } else {
        failed++;
        failures.push({ organisationId: row.organisation_id, reason: result.reason ?? "unknown" });
      }
    } catch (err) {
      failed++;
      failures.push({ organisationId: row.organisation_id, reason: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ checked, synced, skipped, failed, failures });
}
