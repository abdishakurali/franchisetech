"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { assertEntitlement, EntitlementDeniedError } from "@/lib/billing/entitlement-resolver";

function canManage(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

type LoyaltyOrgSettings = {
  loyalty_enabled: boolean;
  loyalty_stamps_required: number;
  loyalty_reward_type: "discount" | "free_item";
  loyalty_reward_discount_lei: number | null;
  loyalty_reward_free_product_id: string | null;
  loyalty_reward_description: string | null;
  loyalty_regulars_min_visits: number;
  loyalty_regulars_at_risk_days: number;
};

const LOYALTY_SETTINGS_COLUMNS =
  "loyalty_enabled,loyalty_stamps_required,loyalty_reward_type,loyalty_reward_discount_lei," +
  "loyalty_reward_free_product_id,loyalty_reward_description,loyalty_regulars_min_visits,loyalty_regulars_at_risk_days";

export type LoyaltyStampStatus =
  | { enabled: false }
  | {
      enabled: true;
      stamps: number;
      required: number;
      rewardReady: boolean;
      rewardType: "discount" | "free_item";
      rewardDiscountLei: number | null;
      rewardDescription: string | null;
    };

/** Own small query — deliberately not routed through lib/kitchenops/data.ts's big membership join. */
export async function getLoyaltyStampStatus(customerId: string): Promise<LoyaltyStampStatus> {
  const { supabase, orgId } = await getActiveOrg();

  const { data: org } = await supabase
    .from("organisations")
    .select(LOYALTY_SETTINGS_COLUMNS)
    .eq("id", orgId)
    .maybeSingle<LoyaltyOrgSettings>();

  if (!org?.loyalty_enabled) return { enabled: false };

  try {
    await assertEntitlement(orgId, "loyalty.enabled", { write: false });
  } catch (error) {
    if (error instanceof EntitlementDeniedError) return { enabled: false };
    throw error;
  }

  const { data: lastRedemption } = await supabase
    .from("loyalty_redemptions")
    .select("redeemed_at")
    .eq("organisation_id", orgId)
    .eq("customer_id", customerId)
    .order("redeemed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let stampQuery = supabase
    .from("pos_transactions")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("customer_id", customerId)
    .eq("status", "completed");

  if (lastRedemption?.redeemed_at) {
    stampQuery = stampQuery.gt("sold_at", lastRedemption.redeemed_at);
  }

  const { count } = await stampQuery;
  const stamps = count ?? 0;
  const required = org.loyalty_stamps_required;

  return {
    enabled: true,
    stamps,
    required,
    rewardReady: stamps >= required,
    rewardType: org.loyalty_reward_type,
    rewardDiscountLei: org.loyalty_reward_discount_lei,
    rewardDescription: org.loyalty_reward_description,
  };
}

/** Fire-and-forget after a sale completes with a redeemed reward — mirrors the
 * "best-effort after the fact" pattern completeSaleReturn already uses for
 * recordGrowthMilestone, just called from outside the protected file instead of inside it. */
export async function recordLoyaltyRedemption(input: {
  customerId: string;
  transactionId: string | null;
  stampsUsed: number;
  rewardDescription: string | null;
}): Promise<{ ok: boolean }> {
  const { supabase, user, orgId } = await getActiveOrg();

  const { error } = await supabase.from("loyalty_redemptions").insert({
    organisation_id: orgId,
    customer_id: input.customerId,
    transaction_id: input.transactionId,
    stamps_used: input.stampsUsed,
    reward_description: input.rewardDescription,
    redeemed_by: user.id,
  });

  if (error) {
    console.error("loyalty_redemption_failed", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export type RegularAtRisk = {
  customer_id: string;
  name: string;
  phone: string | null;
  visit_count: number;
  lifetime_spend: number;
  last_visit: string;
  days_since_last_visit: number;
};

export async function getRegularsAtRisk(): Promise<RegularAtRisk[]> {
  const { supabase, orgId } = await getActiveOrg();

  const { data: org } = await supabase
    .from("organisations")
    .select(LOYALTY_SETTINGS_COLUMNS)
    .eq("id", orgId)
    .maybeSingle<LoyaltyOrgSettings>();

  if (!org?.loyalty_enabled) return [];

  try {
    await assertEntitlement(orgId, "loyalty.enabled", { write: false });
  } catch (error) {
    if (error instanceof EntitlementDeniedError) return [];
    throw error;
  }

  const { data, error } = await supabase.rpc("get_loyalty_regulars_at_risk", {
    p_org_id: orgId,
    p_min_visits: org.loyalty_regulars_min_visits,
    p_at_risk_days: org.loyalty_regulars_at_risk_days,
    p_limit: 50,
  });

  if (error) {
    console.error("loyalty_regulars_at_risk_failed", error.message);
    return [];
  }
  return (data ?? []) as RegularAtRisk[];
}

export type SaveLoyaltyProgramSettingsResult = { error?: string };

export async function saveLoyaltyProgramSettings(formData: FormData): Promise<SaveLoyaltyProgramSettingsResult> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return { error: "Unauthorized" };

  const stampsRequired = Number(formData.get("stamps_required") ?? 8);
  if (!Number.isInteger(stampsRequired) || stampsRequired < 3 || stampsRequired > 20) {
    return { error: "Numărul de ștampile trebuie să fie între 3 și 20." };
  }

  const rewardType = String(formData.get("reward_type") ?? "discount");
  if (rewardType !== "discount" && rewardType !== "free_item") {
    return { error: "Tip de recompensă necunoscut." };
  }

  const rewardDiscountLeiRaw = String(formData.get("reward_discount_lei") ?? "").trim();
  const rewardDiscountLei = rewardDiscountLeiRaw ? Number(rewardDiscountLeiRaw) : null;
  if (rewardType === "discount" && (!rewardDiscountLei || rewardDiscountLei <= 0)) {
    return { error: "Introdu o valoare de discount mai mare decât 0." };
  }

  const rewardFreeProductId = rewardType === "free_item"
    ? (String(formData.get("reward_free_product_id") ?? "").trim() || null)
    : null;

  const rewardDescription = String(formData.get("reward_description") ?? "").trim() || null;

  const minVisits = Number(formData.get("regulars_min_visits") ?? 3);
  const atRiskDays = Number(formData.get("regulars_at_risk_days") ?? 21);
  if (!Number.isInteger(minVisits) || minVisits < 1) {
    return { error: "Numărul minim de vizite trebuie să fie cel puțin 1." };
  }
  if (!Number.isInteger(atRiskDays) || atRiskDays < 1) {
    return { error: "Perioada de inactivitate trebuie să fie de cel puțin 1 zi." };
  }

  const { error } = await supabase
    .from("organisations")
    .update({
      loyalty_stamps_required: stampsRequired,
      loyalty_reward_type: rewardType,
      loyalty_reward_discount_lei: rewardType === "discount" ? rewardDiscountLei : null,
      loyalty_reward_free_product_id: rewardFreeProductId,
      loyalty_reward_description: rewardDescription,
      loyalty_regulars_min_visits: minVisits,
      loyalty_regulars_at_risk_days: atRiskDays,
    })
    .eq("id", orgId);

  if (error) {
    console.error("loyalty_settings_save_failed", error.message);
    return { error: "Setările nu au putut fi salvate. Încearcă din nou." };
  }

  revalidatePath("/app/settings/loyalty");
  revalidatePath("/app/customers");
  return {};
}
