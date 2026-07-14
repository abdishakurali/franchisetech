import type { SupabaseClient } from "@supabase/supabase-js";

export type LoyaltyRoiReward = {
  reward_label: string;
  redemption_count: number;
  stamps_used_total: number;
};

export type LoyaltyRoiReportData = {
  avgSpendLoyalty: number;
  avgSpendNonLoyalty: number;
  loyaltyVisitCount: number;
  nonLoyaltyVisitCount: number;
  customersVisited: number;
  customersRetained: number;
  retentionRate: number;
  topRewards: LoyaltyRoiReward[];
};

/** Shared Loyalty ROI aggregation, used by both the page and the PDF export. */
export async function computeLoyaltyRoiReport(
  supabase: SupabaseClient,
  orgId: string,
  periodStart: string,
  periodEnd: string,
): Promise<LoyaltyRoiReportData> {
  const { data, error } = await supabase.rpc("get_loyalty_roi_summary", {
    p_org_id: orgId,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  });

  if (error) {
    console.error("loyalty_roi_summary_failed", error.message);
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    avg_spend_loyalty: number | null;
    avg_spend_non_loyalty: number | null;
    loyalty_visit_count: number | null;
    non_loyalty_visit_count: number | null;
    customers_visited: number | null;
    customers_retained: number | null;
    retention_rate: number | null;
    top_rewards: LoyaltyRoiReward[] | null;
  } | undefined;

  return {
    avgSpendLoyalty: Number(row?.avg_spend_loyalty ?? 0),
    avgSpendNonLoyalty: Number(row?.avg_spend_non_loyalty ?? 0),
    loyaltyVisitCount: Number(row?.loyalty_visit_count ?? 0),
    nonLoyaltyVisitCount: Number(row?.non_loyalty_visit_count ?? 0),
    customersVisited: Number(row?.customers_visited ?? 0),
    customersRetained: Number(row?.customers_retained ?? 0),
    retentionRate: Number(row?.retention_rate ?? 0),
    topRewards: row?.top_rewards ?? [],
  };
}
