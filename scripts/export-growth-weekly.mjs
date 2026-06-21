#!/usr/bin/env node
/**
 * Export growth / activation metrics for weekly spreadsheet review.
 *
 * Usage:
 *   node scripts/export-growth-weekly.mjs > growth-export.csv
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

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
  "growth_till_opened_at",
  "growth_first_sale_at",
  "growth_first_report_at",
  "growth_activated_at",
  "trial_ends_at",
].join(",");

function csvEscape(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const { data: orgs, error } = await supabase
  .from("organisations")
  .select(
    "id,name,created_at,acquisition_source,acquisition_campaign,acquisition_content,growth_till_opened_at,growth_first_sale_at,growth_first_report_at,growth_activated_at,trial_ends_at",
  )
  .order("created_at", { ascending: false })
  .limit(500);

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(HEADER);
for (const org of orgs ?? []) {
  console.log(
    [
      org.id,
      org.name,
      org.created_at,
      org.acquisition_source,
      org.acquisition_campaign,
      org.acquisition_content,
      org.growth_till_opened_at,
      org.growth_first_sale_at,
      org.growth_first_report_at,
      org.growth_activated_at,
      org.trial_ends_at,
    ]
      .map(csvEscape)
      .join(","),
  );
}
