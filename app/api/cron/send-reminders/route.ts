import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendReminderEmail, buildReminderSubject } from "@/lib/email/resend";

// POST /api/cron/send-reminders
// Requires: Authorization: Bearer <CRON_SECRET>
// Uses anon key + SECURITY DEFINER RPCs — no service role needed.
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
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
  }

  // Use anon key — DB-level SECURITY DEFINER functions bypass RLS safely
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

  const now = new Date();

  // Fetch all enabled schedules via SECURITY DEFINER RPC
  const { data: schedules, error: fetchError } = await supabase.rpc(
    "get_due_reminder_schedules",
    { p_now: now.toISOString() }
  );

  if (fetchError) {
    console.error("cron_fetch_schedules_error", fetchError);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }

  let checked = 0;
  let sent = 0;
  let failed = 0;

  for (const schedule of (schedules as Array<Record<string, unknown>>) ?? []) {
    checked++;

    try {
      const tz = schedule.timezone as string;

      // Convert now to schedule's timezone
      const tzNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));

      // ISO weekday: 1=Mon..7=Sun
      const dowJs = tzNow.getDay();
      const isoDay = dowJs === 0 ? 7 : dowJs;
      if (!(schedule.days_of_week as number[]).includes(isoDay)) continue;

      // Only fire in 5-min window at/after scheduled time
      const [schHour, schMin] = (schedule.time_of_day as string).split(":").map(Number);
      const nowMins = tzNow.getHours() * 60 + tzNow.getMinutes();
      const schMins = schHour * 60 + schMin;
      if (nowMins < schMins || nowMins >= schMins + 60) continue;

      // Once-per-day guard
      if (schedule.last_sent_at) {
        const lastTz = new Date(
          new Date(schedule.last_sent_at as string).toLocaleString("en-US", { timeZone: tz })
        );
        if (
          lastTz.getFullYear() === tzNow.getFullYear() &&
          lastTz.getMonth() === tzNow.getMonth() &&
          lastTz.getDate() === tzNow.getDate()
        ) continue;
      }

      const recipients = schedule.recipients as string[];
      if (!recipients?.length) continue;

      const orgName = (schedule.org_name as string) ?? "Your business";
      const assetName = (schedule.asset_name as string) ?? null;
      const dueTime = (schedule.time_of_day as string).slice(0, 5);
      const subject = buildReminderSubject(schedule.label as string);

      const BASE_URL =
        process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";
      const actionUrls: Record<string, string> = {
        temperature_check: `${BASE_URL}/app/checks/new${schedule.asset_id ? `?assetId=${schedule.asset_id}` : ""}`,
        hot_holding_check: `${BASE_URL}/app/checks/new?category=hot_holding`,
        cleaning_check: `${BASE_URL}/app/cleaning`,
        manager_review: `${BASE_URL}/app/manager-review`,
      };

      const result = await sendReminderEmail({
        to: recipients,
        subject,
        businessName: orgName,
        reminderLabel: schedule.label as string,
        reminderType: schedule.reminder_type as string,
        dueTime,
        actionUrl: actionUrls[schedule.reminder_type as string],
        assetName,
      });

      // Log each recipient via SECURITY DEFINER RPC
      for (const recipient of recipients) {
        await supabase.rpc("log_reminder_send", {
          p_organisation_id: schedule.organisation_id,
          p_schedule_id: schedule.id,
          p_recipient: recipient,
          p_subject: subject,
          p_status: result.success ? "sent" : "failed",
          p_provider_message_id: result.messageId ?? null,
          p_error: result.error ?? null,
        });
      }

      if (result.success) {
        // Update last_sent_at via SECURITY DEFINER RPC
        await supabase.rpc("mark_reminder_sent", {
          p_schedule_id: schedule.id,
          p_sent_at: now.toISOString(),
        });
        sent++;
      } else {
        console.error("cron_send_failed", { scheduleId: schedule.id, error: result.error });
        failed++;
      }
    } catch (err) {
      console.error("cron_schedule_exception", { scheduleId: schedule.id, err });
      failed++;
    }
  }

  return NextResponse.json({ checked, sent, failed });
}
