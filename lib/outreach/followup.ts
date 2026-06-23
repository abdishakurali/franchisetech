import { createServiceClient } from "@/lib/supabase/server";

const CAMPAIGN = "v2-franchisetech";

/** Days after step N-1 send before step N is due (outreach cadence). */
export const FOLLOWUP_DAYS_AFTER_PREV: Record<"customer" | "partner", Record<number, number>> = {
  customer: { 2: 4, 3: 10 },
  partner: { 2: 3, 3: 7, 4: 14 },
};

export type FollowupRow = {
  email: string;
  company: string | null;
  type: "customer" | "partner";
  step: number;
  prev_sent_at: string;
};

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/** Rows due for follow-up step (step 1 must be sent; step N not yet planned/sent). */
export async function loadFollowupDue(
  type: "customer" | "partner",
  step: number,
  limit: number,
): Promise<FollowupRow[]> {
  if (step < 2) return [];

  const prevStep = step - 1;
  const minDays = FOLLOWUP_DAYS_AFTER_PREV[type][step];
  if (!minDays) return [];

  const supabase = await createServiceClient();
  const cutoff = daysAgoIso(minDays);

  const { data: sentPrev, error } = await supabase
    .from("outreach_log")
    .select("email, company, sent_at")
    .eq("campaign", CAMPAIGN)
    .eq("type", type)
    .eq("step", prevStep)
    .eq("status", "sent")
    .lte("sent_at", cutoff)
    .order("sent_at", { ascending: true })
    .limit(limit * 3);

  if (error) throw new Error(error.message);

  const candidates = sentPrev ?? [];
  if (candidates.length === 0) return [];

  const emails = [...new Set(candidates.map((r) => String(r.email).trim().toLowerCase()))];

  const { data: blocked } = await supabase
    .from("outreach_log")
    .select("email")
    .eq("campaign", CAMPAIGN)
    .eq("type", type)
    .eq("step", step)
    .in("status", ["planned", "sent"])
    .in("email", emails);

  const blockedSet = new Set((blocked ?? []).map((r) => String(r.email).trim().toLowerCase()));

  const out: FollowupRow[] = [];
  for (const row of candidates) {
    const email = String(row.email).trim().toLowerCase();
    if (blockedSet.has(email)) continue;
    out.push({
      email,
      company: row.company,
      type,
      step,
      prev_sent_at: row.sent_at,
    });
    blockedSet.add(email);
    if (out.length >= limit) break;
  }

  return out;
}
