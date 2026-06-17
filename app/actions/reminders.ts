"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReminderType =
  | "temperature_check"
  | "hot_holding_check"
  | "cleaning_check"
  | "manager_review";

export interface ReminderScheduleInput {
  reminder_type: ReminderType;
  label: string;
  time_of_day: string; // HH:MM
  days_of_week: number[]; // 1=Mon..7=Sun
  recipients: string[];
  enabled: boolean;
  site_id?: string | null;
  asset_id?: string | null;
  timezone?: string;
}

export async function saveReminderSchedules(
  schedules: ReminderScheduleInput[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    return { error: "Only owners and managers can manage reminders" };
  }

  const rows = schedules
    .filter((s) => s.recipients.length > 0)
    .map((s) => ({
      organisation_id: membership.organisation_id,
      reminder_type: s.reminder_type,
      label: s.label,
      time_of_day: s.time_of_day,
      days_of_week: s.days_of_week,
      recipients: s.recipients,
      enabled: s.enabled,
      site_id: s.site_id ?? null,
      asset_id: s.asset_id ?? null,
      timezone: s.timezone ?? "Europe/Dublin",
      created_by: user.id,
    }));

  if (!rows.length) return {};

  const { error } = await supabase.from("reminder_schedules").insert(rows);
  if (error) {
    console.error("save_reminder_schedules_error", error);
    return { error: "Could not save reminder schedules. Please try again." };
  }

  revalidatePath("/app/reminders");
  return {};
}

export async function updateReminderSchedule(
  id: string,
  patch: Partial<ReminderScheduleInput>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const update: Record<string, unknown> = {};
  if (patch.label !== undefined) update.label = patch.label;
  if (patch.reminder_type !== undefined) update.reminder_type = patch.reminder_type;
  if (patch.time_of_day !== undefined) update.time_of_day = patch.time_of_day;
  if (patch.days_of_week !== undefined) update.days_of_week = patch.days_of_week;
  if (patch.recipients !== undefined) update.recipients = patch.recipients;
  if (patch.enabled !== undefined) update.enabled = patch.enabled;
  if (patch.site_id !== undefined) update.site_id = patch.site_id;
  if (patch.asset_id !== undefined) update.asset_id = patch.asset_id;

  const { error } = await supabase
    .from("reminder_schedules")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("update_reminder_schedule_error", error);
    return { error: error.message };
  }

  revalidatePath("/app/reminders");
  return {};
}

export async function deleteReminderSchedule(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reminder_schedules")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("delete_reminder_schedule_error", error);
    return { error: error.message };
  }

  revalidatePath("/app/reminders");
  return {};
}

export async function toggleReminderSchedule(
  id: string,
  enabled: boolean
): Promise<{ error?: string }> {
  return updateReminderSchedule(id, { enabled });
}
