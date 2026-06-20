import type { SupabaseClient } from "@supabase/supabase-js";
import { trackLoopsEvent } from "@/lib/loops";

export type GrowthMilestone = "till_opened" | "first_sale" | "first_report";

const FIELD: Record<GrowthMilestone, keyof GrowthOrgRow> = {
  till_opened: "growth_till_opened_at",
  first_sale: "growth_first_sale_at",
  first_report: "growth_first_report_at",
};

const LOOPS_EVENT: Record<GrowthMilestone, string> = {
  till_opened: "till_session_opened",
  first_sale: "first_sale_recorded",
  first_report: "z_report_viewed",
};

async function trackGrowthMilestoneLoops(
  orgId: string,
  milestone: GrowthMilestone,
): Promise<void> {
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const client = await createServiceClient();

    const { data: member } = await client
      .from("organisation_members")
      .select("user_id")
      .eq("organisation_id", orgId)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    if (!member?.user_id) return;

    const { data: profile } = await client
      .from("profiles")
      .select("email")
      .eq("id", member.user_id)
      .maybeSingle();

    const email = (profile as { email?: string | null } | null)?.email?.trim();
    if (!email) return;

    const { data: org } = await client
      .from("organisations")
      .select("name")
      .eq("id", orgId)
      .maybeSingle();

    await trackLoopsEvent(email, LOOPS_EVENT[milestone], {
      organisationId: orgId,
      businessName: org?.name ?? "",
    });
  } catch {
    // Non-fatal — Loops must never block milestone recording
  }
}

type GrowthOrgRow = {
  growth_till_opened_at: string | null;
  growth_first_sale_at: string | null;
  growth_first_report_at: string | null;
  growth_activated_at: string | null;
};

/** Idempotent: sets milestone timestamp once; sets growth_activated_at when all three exist. */
export async function recordGrowthMilestone(
  supabase: SupabaseClient,
  orgId: string,
  milestone: GrowthMilestone,
): Promise<void> {
  try {
    const { data: org, error } = await supabase
      .from("organisations")
      .select(
        "growth_till_opened_at,growth_first_sale_at,growth_first_report_at,growth_activated_at",
      )
      .eq("id", orgId)
      .maybeSingle();

    if (error || !org) return;
    const row = org as GrowthOrgRow;
    if (row[FIELD[milestone]]) return;

    const now = new Date().toISOString();
    const next: GrowthOrgRow = { ...row, [FIELD[milestone]]: now };
    const updates: Partial<GrowthOrgRow> = { [FIELD[milestone]]: now };

    if (
      next.growth_till_opened_at &&
      next.growth_first_sale_at &&
      next.growth_first_report_at &&
      !row.growth_activated_at
    ) {
      updates.growth_activated_at = now;
    }

    await supabase.from("organisations").update(updates).eq("id", orgId);
    void trackGrowthMilestoneLoops(orgId, milestone);
  } catch {
    // Non-fatal if migration 041 not yet applied
  }
}

export function isActivatedTrial(row: GrowthOrgRow): boolean {
  return Boolean(row.growth_activated_at);
}

export function activationProgress(row: GrowthOrgRow): {
  till: boolean;
  sale: boolean;
  report: boolean;
  activated: boolean;
} {
  return {
    till: Boolean(row.growth_till_opened_at),
    sale: Boolean(row.growth_first_sale_at),
    report: Boolean(row.growth_first_report_at),
    activated: Boolean(row.growth_activated_at),
  };
}
