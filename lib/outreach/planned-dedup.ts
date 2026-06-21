import { createServiceClient } from "@/lib/supabase/server";

const CAMPAIGN = "v2-franchisetech";

function startOfTodayUtc(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Emails already marked planned today for step 1 outreach campaign. */
export async function emailsPlannedToday(step = 1): Promise<Set<string>> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("outreach_log")
    .select("email")
    .eq("status", "planned")
    .eq("campaign", CAMPAIGN)
    .eq("step", step)
    .gte("sent_at", startOfTodayUtc());

  if (error) throw new Error(error.message);

  return new Set((data ?? []).map((row) => String(row.email).trim().toLowerCase()));
}

export function filterNotPlannedToday<T extends { email: string }>(
  rows: T[],
  plannedToday: Set<string>,
): T[] {
  return rows.filter((row) => !plannedToday.has(row.email.trim().toLowerCase()));
}
