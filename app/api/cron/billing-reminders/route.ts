// POST /api/cron/billing-reminders
// Called by system cron every 15 minutes.
// Requires: Authorization: Bearer <CRON_SECRET>
//
// Sends payment reminders for:
//   1. trial_expired  — soft trial ended, no Stripe subscription
//   2. past_due_grace — Stripe past_due within 3-day grace period
//   3. past_due_final — grace period has elapsed
//
// Idempotency: unique index on (organisation_id, reminder_type, window_start)
// prevents duplicate sends within the same 15-minute window.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBillingReminderEmail } from "@/lib/email/billing";

export const dynamic = "force-dynamic";

const GRACE_PERIOD_DAYS = 3;
const REMINDER_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REMINDERS_PER_ORG_PER_DAY = 96; // safety cap (96 × 15 min = 24 h)

/** Floor timestamp to the nearest 15-minute boundary — used as the dedup key. */
function windowStart(now: Date): string {
  const ms = Math.floor(now.getTime() / REMINDER_WINDOW_MS) * REMINDER_WINDOW_MS;
  return new Date(ms).toISOString();
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret)
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cronSecret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey)
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });

  // Service role bypasses RLS so we can query across all orgs
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const now = new Date();
  const win = windowStart(now);
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();

  let sent = 0, skipped = 0, failed = 0;

  // ── 1. Trial-expired orgs ───────────────────────────────────────────────────
  // Orgs whose soft trial has ended and have no active/trialing Stripe subscription.
  const { data: trialExpiredOrgs } = await supabase
    .from("organisations")
    .select("id, name, trial_ends_at")
    .lt("trial_ends_at", now.toISOString())
    .not("trial_ends_at", "is", null);

  for (const org of trialExpiredOrgs ?? []) {
    try {
      // Check for any active Stripe subscription
      const { data: activeSub } = await supabase
        .from("billing_subscriptions")
        .select("id, status")
        .eq("organisation_id", org.id)
        .in("status", ["active", "trialing", "past_due"])
        .limit(1)
        .maybeSingle();

      if (activeSub) continue; // has a paid/trialing sub — skip

      // Safety cap: don't send if already sent too many today
      const { count: todayCount } = await supabase
        .from("payment_reminders")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", org.id)
        .eq("reminder_type", "trial_expired")
        .gt("sent_at", dayAgo);

      if ((todayCount ?? 0) >= MAX_REMINDERS_PER_ORG_PER_DAY) {
        console.warn("[billing-reminders] safety cap hit", { orgId: org.id, type: "trial_expired" });
        skipped++;
        continue;
      }

      // Dedup: already sent this window?
      const { error: insertErr } = await supabase.from("payment_reminders").insert({
        organisation_id: org.id,
        reminder_type: "trial_expired",
        window_start: win,
        status: "skipped",          // placeholder — updated below
        channel: "email",
      });

      if (insertErr?.code === "23505") { skipped++; continue; } // already sent this window
      if (insertErr) throw insertErr;

      // Fetch owner email
      const { data: owner } = await supabase
        .from("organisation_members")
        .select("profiles(email:id, ...profiles(email))")
        .eq("organisation_id", org.id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      const email = (owner as unknown as { profiles?: { email?: string } })?.profiles?.email;
      if (!email) { skipped++; continue; }

      const result = await sendBillingReminderEmail({
        to: [email],
        businessName: org.name ?? "Your business",
        reminderType: "trial_expired",
        billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?reason=trial_expired`,
      });

      await supabase
        .from("payment_reminders")
        .update({
          status: result.success ? "sent" : "failed",
          recipient: email,
          error_message: result.error ?? null,
          sent_at: now.toISOString(),
        })
        .eq("organisation_id", org.id)
        .eq("reminder_type", "trial_expired")
        .eq("window_start", win);

      console.info("[billing-reminders] trial_expired", { orgId: org.id, success: result.success });
      result.success ? sent++ : failed++;
    } catch (err) {
      console.error("[billing-reminders] error trial_expired", { orgId: org.id, err });
      failed++;
    }
  }

  // ── 2. Past-due orgs (within or past grace period) ──────────────────────────
  const { data: pastDueSubs } = await supabase
    .from("billing_subscriptions")
    .select("organisation_id, grace_period_ends_at, organisations(name)")
    .eq("status", "past_due")
    .not("grace_period_ends_at", "is", null);

  for (const sub of pastDueSubs ?? []) {
    const orgId = sub.organisation_id as string;
    const graceEnd = new Date(sub.grace_period_ends_at as string);
    const graceDaysLeft = Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / 86_400_000));
    const isExpired = graceEnd <= now;
    const reminderType: "past_due_grace" | "past_due_final" = isExpired ? "past_due_final" : "past_due_grace";
    const orgName = (sub as unknown as { organisations?: { name?: string } }).organisations?.name ?? "Your business";

    try {
      const { count: todayCount } = await supabase
        .from("payment_reminders")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .eq("reminder_type", reminderType)
        .gt("sent_at", dayAgo);

      if ((todayCount ?? 0) >= MAX_REMINDERS_PER_ORG_PER_DAY) {
        console.warn("[billing-reminders] safety cap hit", { orgId, type: reminderType });
        skipped++;
        continue;
      }

      const { error: insertErr } = await supabase.from("payment_reminders").insert({
        organisation_id: orgId,
        reminder_type: reminderType,
        window_start: win,
        status: "skipped",
        channel: "email",
      });

      if (insertErr?.code === "23505") { skipped++; continue; }
      if (insertErr) throw insertErr;

      const { data: owner } = await supabase
        .from("organisation_members")
        .select("profiles(email:id, ...profiles(email))")
        .eq("organisation_id", orgId)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      const email = (owner as unknown as { profiles?: { email?: string } })?.profiles?.email;
      if (!email) { skipped++; continue; }

      const result = await sendBillingReminderEmail({
        to: [email],
        businessName: orgName,
        reminderType,
        graceDaysLeft: isExpired ? 0 : graceDaysLeft,
        billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing`,
      });

      await supabase
        .from("payment_reminders")
        .update({
          status: result.success ? "sent" : "failed",
          recipient: email,
          error_message: result.error ?? null,
          sent_at: now.toISOString(),
        })
        .eq("organisation_id", orgId)
        .eq("reminder_type", reminderType)
        .eq("window_start", win);

      console.info("[billing-reminders]", reminderType, { orgId, success: result.success });
      result.success ? sent++ : failed++;
    } catch (err) {
      console.error("[billing-reminders] error", reminderType, { orgId, err });
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    window: win,
    trialExpiredCandidates: trialExpiredOrgs?.length ?? 0,
    pastDueCandidates: pastDueSubs?.length ?? 0,
    sent,
    skipped,
    failed,
  });
}
