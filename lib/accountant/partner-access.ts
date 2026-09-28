import { createServiceClient } from "@/lib/supabase/server";
import { ACCOUNTANT_PERMISSIONS } from "@/lib/accountant/permissions";

/**
 * Grants an accountant partner read-only portal access to a referred org,
 * once their referral becomes active (first real payment). System-initiated:
 * deliberately does NOT go through /api/team's invite endpoint, which
 * assumes a human owner/manager is doing the inviting and requires their
 * auth session — this runs from the billing webhook, with no owner involved.
 *
 * Call this AFTER credit_accountant_referral has run (it owns making the
 * referral row 'active'); this function only owns the organisation_members
 * side effect. Safe to call more than once — upserts on the existing
 * (organisation_id, user_id) unique constraint.
 */
export async function grantAccountantPartnerAccess(orgId: string, partnerUserId: string): Promise<void> {
  const service = await createServiceClient();

  const { data: existing } = await service
    .from("organisation_members")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("user_id", partnerUserId)
    .maybeSingle();

  const payload = {
    role: "accountant",
    status: "active",
    accountant_permissions: [...ACCOUNTANT_PERMISSIONS],
  };

  if (existing) {
    await service.from("organisation_members").update(payload).eq("id", existing.id);
  } else {
    await service.from("organisation_members").insert({
      organisation_id: orgId,
      user_id: partnerUserId,
      ...payload,
    });
  }
}
