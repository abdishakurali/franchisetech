// GET/POST /api/cron/owner-digest
// Requires: Authorization: Bearer <CRON_SECRET>
// Scheduled via Vercel Cron every 5 minutes (see vercel.json) — Vercel invokes
// crons with GET; POST is kept for manual/authenticated retries, same
// convention as the other routes in this directory. Previously triggered by
// an external n8n workflow (outreach/n8n-owner-digest-cron.workflow.ts) on
// the same 5-minute cadence; n8n was disabled, and nothing else was calling
// this route, so digests silently stopped sending. The 5-minute cadence
// itself isn't cosmetic: the route only sends within a 15-minute window after
// each org's own configured local time (OWNER_DIGEST_SEND_WINDOW_MINUTES in
// lib/owner-digest/schedule.ts), so a coarser schedule would miss most orgs.
// Uses SUPABASE_SERVICE_ROLE_KEY + SECURITY DEFINER RPCs.

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchOwnerDigestData } from "@/lib/owner-digest/fetch";
import { sendOwnerDigestEmail } from "@/lib/email/owner-digest";
import { isOwnerDigestDue, ownerDigestWindowStart } from "@/lib/owner-digest/schedule";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { buildReferralLink } from "@/lib/referrals";

export const dynamic = "force-dynamic";

type DigestOrgRow = {
  organisation_id: string;
  org_name: string;
  country_code: string | null;
  currency_code: string;
  inventory_enabled: boolean;
  owner_digest_frequency: string;
  owner_digest_day_of_week: number;
  owner_digest_time_of_day: string;
  owner_digest_timezone: string;
  owner_digest_recipients: string[];
  owner_digest_last_sent_at: string | null;
  business_day_cutoff_time: string | null;
};

async function ensureDigestReferralLink(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<string | null> {
  const { data: org } = await supabase
    .from("organisations")
    .select("referral_code")
    .eq("id", organisationId)
    .maybeSingle();

  let code = (org as { referral_code?: string | null } | null)?.referral_code ?? null;
  if (!code) {
    const { data: generatedCode } = await supabase.rpc("ensure_referral_code", { p_org_id: organisationId });
    code = typeof generatedCode === "string" ? generatedCode : null;
  }

  return code ? buildReferralLink(code) : null;
}

async function runOwnerDigest(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  // PG_CRON_SECRET is a second, separate secret used only by the Supabase
  // pg_cron job (see supabase/migrations for the schedule) — Vercel Hobby
  // blocks any cron more frequent than daily, and this route needs a 5-minute
  // cadence, so pg_cron calls it directly over HTTP from the database.
  // Deliberately not reusing CRON_SECRET here so rotating either one never
  // risks breaking the other trigger path.
  const pgCronSecret = process.env.PG_CRON_SECRET;
  if (!cronSecret && !pgCronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const authorized = (cronSecret && auth === `Bearer ${cronSecret}`) || (pgCronSecret && auth === `Bearer ${pgCronSecret}`);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const now = new Date();

  const { data: orgs, error: fetchError } = await supabase.rpc("get_owner_digest_orgs");
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let checked = 0;
  let due = 0;
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let locked = 0;
  let recipientsSent = 0;
  let recipientsFailed = 0;

  for (const row of (orgs as DigestOrgRow[]) ?? []) {
    checked++;

    const entitled = await hasEntitlement(row.organisation_id, "owner_digest.enabled", { write: false });
    if (!entitled) {
      skipped++;
      continue;
    }

    const recipients = row.owner_digest_recipients ?? [];
    if (!recipients.length) {
      skipped++;
      continue;
    }

    const frequency = row.owner_digest_frequency === "weekly" ? "weekly" : "daily";
    const schedule = {
      organisation_id: row.organisation_id,
      owner_digest_frequency: frequency,
      owner_digest_day_of_week: row.owner_digest_day_of_week,
      owner_digest_time_of_day: String(row.owner_digest_time_of_day),
      owner_digest_timezone: row.owner_digest_timezone || "Europe/Bucharest",
      owner_digest_last_sent_at: row.owner_digest_last_sent_at,
    };

    if (!isOwnerDigestDue(schedule, now)) {
      skipped++;
      continue;
    }
    due++;

    const tz = schedule.owner_digest_timezone;
    const windowStart = ownerDigestWindowStart(frequency, now, tz, row.business_day_cutoff_time);

    const { data: claimed, error: claimError } = await supabase.rpc("claim_owner_digest_window", {
      p_organisation_id: row.organisation_id,
      p_window_start: windowStart.toISOString(),
    });
    if (claimError) {
      failed++;
      continue;
    }
    if (!claimed) {
      locked++;
      skipped++;
      continue;
    }

    try {
      const digestData = await fetchOwnerDigestData(supabase, {
        orgId: row.organisation_id,
        orgName: row.org_name,
        countryCode: row.country_code,
        currency: row.currency_code || "EUR",
        frequency,
        timeZone: tz,
        businessDayCutoffTime: row.business_day_cutoff_time,
        referenceNow: now,
      });
      digestData.referralLink = await ensureDigestReferralLink(supabase, row.organisation_id);

      const result = await sendOwnerDigestEmail({ to: recipients, data: digestData });

      for (const recipient of recipients) {
        await supabase.rpc("log_owner_digest_send", {
          p_organisation_id: row.organisation_id,
          p_window_start: windowStart.toISOString(),
          p_recipient: recipient,
          p_subject: result.subject ?? "",
          p_status: result.success ? "sent" : "failed",
          p_provider_message_id: result.messageId ?? null,
          p_error_message: result.error ?? null,
        });
      }

      if (result.success) {
        await supabase.rpc("log_owner_digest_send", {
          p_organisation_id: row.organisation_id,
          p_window_start: windowStart.toISOString(),
          p_recipient: "__lock__",
          p_subject: result.subject ?? "",
          p_status: "sent",
          p_provider_message_id: result.messageId ?? null,
          p_error_message: null,
        });
        await supabase.rpc("mark_owner_digest_sent", {
          p_organisation_id: row.organisation_id,
          p_sent_at: now.toISOString(),
        });
        sent++;
        recipientsSent += recipients.length;
      } else {
        await supabase.rpc("log_owner_digest_send", {
          p_organisation_id: row.organisation_id,
          p_window_start: windowStart.toISOString(),
          p_recipient: "__lock__",
          p_subject: result.subject ?? "",
          p_status: "failed",
          p_provider_message_id: result.messageId ?? null,
          p_error_message: result.error ?? null,
        });
        failed++;
        recipientsFailed += recipients.length;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await supabase.rpc("log_owner_digest_send", {
        p_organisation_id: row.organisation_id,
        p_window_start: windowStart.toISOString(),
        p_recipient: "__lock__",
        p_subject: "",
        p_status: "failed",
        p_provider_message_id: null,
        p_error_message: message,
      });
      failed++;
      recipientsFailed += recipients.length;
    }
  }

  return NextResponse.json({ checked, due, sent, failed, skipped, locked, recipientsSent, recipientsFailed });
}

export async function GET(req: NextRequest) {
  return runOwnerDigest(req);
}

export async function POST(req: NextRequest) {
  return runOwnerDigest(req);
}
