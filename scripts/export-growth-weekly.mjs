#!/usr/bin/env node
/**
 * Export growth / activation metrics for weekly spreadsheet review.
 *
 * Usage:
 *   node scripts/export-growth-weekly.mjs > growth-export.csv
 *   node scripts/export-growth-weekly.mjs --partners-only > partner-commissions.csv
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const PARTNER_COMMISSION_PCT = 20;

const PLAN_MRR_EUR = {
  starter: 49,
  pro: 79,
  multi_location: 99,
  connected: 0,
};

const args = process.argv.slice(2);
const partnersOnly = args.includes("--partners-only");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const HEADER = [
  "org_id",
  "org_name",
  "signup_date",
  "acquisition_source",
  "acquisition_campaign",
  "acquisition_content",
  "referred_by_code",
  "growth_till_opened_at",
  "growth_first_sale_at",
  "growth_first_report_at",
  "growth_activated_at",
  "trial_ends_at",
  "billing_status",
  "plan",
  "mrr_eur",
  "commission_pct",
  "commission_due_eur",
].join(",");

function csvEscape(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function mrrForPlan(plan) {
  if (!plan) return 0;
  return PLAN_MRR_EUR[plan] ?? 0;
}

function isPayingStatus(status) {
  return status === "active" || status === "trialing";
}

let query = supabase
  .from("organisations")
  .select(
    "id,name,created_at,acquisition_source,acquisition_campaign,acquisition_content,referred_by_code,growth_till_opened_at,growth_first_sale_at,growth_first_report_at,growth_activated_at,trial_ends_at",
  )
  .order("created_at", { ascending: false })
  .limit(500);

if (partnersOnly) {
  query = query.like("acquisition_source", "partner_%");
}

const { data: orgs, error } = await query;

if (error) {
  console.error(error.message);
  process.exit(1);
}

const orgIds = (orgs ?? []).map((o) => o.id);
const billingByOrg = new Map();

if (orgIds.length > 0) {
  const { data: subs, error: subError } = await supabase
    .from("billing_subscriptions")
    .select("organisation_id,plan,status")
    .in("organisation_id", orgIds);

  if (subError) {
    console.error(subError.message);
    process.exit(1);
  }

  for (const sub of subs ?? []) {
    billingByOrg.set(sub.organisation_id, sub);
  }
}

console.log(HEADER);
for (const org of orgs ?? []) {
  const sub = billingByOrg.get(org.id);
  const plan = sub?.plan ?? "";
  const billingStatus = sub?.status ?? "";
  const mrr = isPayingStatus(billingStatus) ? mrrForPlan(plan) : 0;
  const commissionDue =
    org.acquisition_source?.startsWith("partner_") && mrr > 0
      ? Math.round((mrr * PARTNER_COMMISSION_PCT) / 100 * 100) / 100
      : 0;

  console.log(
    [
      org.id,
      org.name,
      org.created_at,
      org.acquisition_source,
      org.acquisition_campaign,
      org.acquisition_content,
      org.referred_by_code,
      org.growth_till_opened_at,
      org.growth_first_sale_at,
      org.growth_first_report_at,
      org.growth_activated_at,
      org.trial_ends_at,
      billingStatus,
      plan,
      mrr,
      org.acquisition_source?.startsWith("partner_") ? PARTNER_COMMISSION_PCT : "",
      commissionDue || "",
    ]
      .map(csvEscape)
      .join(","),
  );
}
