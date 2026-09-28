import type { SupabaseClient } from "@supabase/supabase-js";

export const ACCOUNTANT_PERMISSIONS = ["sales", "cash", "stock", "purchases", "documents"] as const;
export type AccountantPermission = (typeof ACCOUNTANT_PERMISSIONS)[number];
export type PackageSection = "sales" | "payments" | "cash" | "stock" | "purchases" | "documents";

export function normalizeAccountantPermissions(value: unknown): AccountantPermission[] {
  if (value === undefined || value === null) return [...ACCOUNTANT_PERMISSIONS];
  if (!Array.isArray(value)) return [];
  return ACCOUNTANT_PERMISSIONS.filter((permission) => value.includes(permission));
}

export function packageSections(value: unknown): PackageSection[] {
  const permissions = normalizeAccountantPermissions(value);
  const sections: PackageSection[] = [];
  if (permissions.includes("sales")) sections.push("sales", "payments");
  if (permissions.includes("cash")) sections.push("cash");
  if (permissions.includes("stock")) sections.push("stock");
  if (permissions.includes("purchases")) sections.push("purchases");
  // Source documents stay hidden until every exported row can be linked to
  // an actual stored file. An empty category would mislead the accountant.
  return sections;
}

/**
 * True if the caller is an accountant partner (lib/accountant/partner-access.ts)
 * with an active referral for this specific org — used to bypass the
 * reports.accountant_pack plan gate ONLY for that org, since the partner
 * program promises free portal access regardless of the referred org's own
 * plan. Relies entirely on partner_referrals' RLS policy (scoped to
 * auth.uid() via accountant_partners.user_id) rather than an explicit
 * user-id filter here — pass a client bound to the caller's own session, not
 * a service-role client, or this always returns false.
 */
export async function hasAccountantPartnerAccess(supabase: SupabaseClient, orgId: string): Promise<boolean> {
  const { data } = await supabase
    .from("partner_referrals")
    .select("id")
    .eq("organisation_id", orgId)
    .neq("status", "churned")
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
