// Handler for the daily first-receipt watch (route: /api/cron/first-receipt-watch).
// Requires: Authorization: Bearer <CRON_SECRET>, same as the other cron routes.
//
// 1. Reports, per org created in the last 30 days, signup time and the time of
//    the first LIVE fiscal receipt (see ./first-receipt.ts).
// 2. Emails the founder (sales inbox) once per org that is 24h+ past signup
//    without a live receipt. Idempotency: a sent alert writes an audit_log row
//    (action founder_alert.no_live_receipt_24h); orgs with that row are skipped.
//    A failed send writes nothing, so the next run retries it.

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sendPlainAlert } from "@/lib/email/plain-alert";
import {
  NO_LIVE_RECEIPT_ALERT_ACTION,
  buildNoLiveReceiptAlert,
  fetchReceiptTimelines,
  selectOrgsToAlert,
} from "./first-receipt";

const REPORT_DAYS = 30;

type Deps = {
  supabase?: SupabaseClient;
  send?: (subject: string, body: string) => Promise<boolean>;
  now?: Date;
};

export async function runFirstReceiptWatch(req: Request, deps: Deps = {}) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${cronSecret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let supabase = deps.supabase;
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!supabaseUrl || !serviceKey)
      return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
    supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  }
  const send = deps.send ?? sendPlainAlert;
  const now = deps.now ?? new Date();

  const timelines = await fetchReceiptTimelines(
    supabase,
    new Date(now.getTime() - REPORT_DAYS * 86_400_000).toISOString(),
  );

  const alreadyAlerted = new Set<string>();
  if (timelines.length > 0) {
    const { data: alertedRows, error } = await supabase
      .from("audit_log")
      .select("organisation_id")
      .eq("action", NO_LIVE_RECEIPT_ALERT_ACTION)
      .in("organisation_id", timelines.map((t) => t.orgId));
    // Without the idempotency read we could alert twice: stop instead.
    if (error) return NextResponse.json({ error: "audit_log read failed" }, { status: 500 });
    for (const r of alertedRows ?? []) alreadyAlerted.add(r.organisation_id as string);
  }

  let sent = 0, failed = 0;
  for (const t of selectOrgsToAlert(timelines, alreadyAlerted, now)) {
    const { subject, body } = buildNoLiveReceiptAlert(t, now);
    if (!(await send(subject, body))) {
      failed++;
      console.error("[first-receipt-watch] alert send failed", { orgId: t.orgId });
      continue;
    }
    sent++;
    const { error } = await supabase.from("audit_log").insert({
      organisation_id: t.orgId,
      action: NO_LIVE_RECEIPT_ALERT_ACTION,
      entity_type: "organisation",
      entity_id: t.orgId,
      metadata: { signup_at: t.signupAt, alerted_at: now.toISOString() },
    });
    if (error) console.error("[first-receipt-watch] audit_log insert failed; org may be alerted again", { orgId: t.orgId, error });
  }

  const live = timelines.filter((t) => t.firstLiveReceiptAt);
  return NextResponse.json({
    ok: true,
    orgs: timelines.length,
    withLiveReceipt: live.length,
    within48h: live.filter((t) => (t.hoursToFirstLiveReceipt ?? Infinity) <= 48).length,
    sent,
    failed,
    timelines: timelines.map(({ orgId, name, signupAt, firstLiveReceiptAt, hoursToFirstLiveReceipt }) => ({
      orgId, name, signupAt, firstLiveReceiptAt, hoursToFirstLiveReceipt,
    })),
  });
}
