// POST /api/cron/owner-digest
// Requires: Authorization: Bearer <CRON_SECRET>
// Schedule via n8n or server crontab every 5 minutes (sends within a tight window after configured time).
// Uses SUPABASE_SERVICE_ROLE_KEY + SECURITY DEFINER RPCs.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchOwnerDigestData } from "@/lib/owner-digest/fetch";
import { sendOwnerDigestEmail } from "@/lib/email/owner-digest";
import { isOwnerDigestDue, ownerDigestWindowStart } from "@/lib/owner-digest/schedule";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";

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

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cronSecret}`) {
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
