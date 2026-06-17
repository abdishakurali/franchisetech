import { createClient } from "@/lib/supabase/server";

export type ReferralInfo = {
  available: boolean;
  code: string | null;
  link: string | null;
  creditMonths: number;
  trialEndsAt: string | null;
  daysLeft: number | null;
  referrals: Array<{ id: string; referred_email: string | null; status: string | null; credit_months: number | null }>;
};

export function buildReferralLink(code: string) {
  return `https://franchisetech.ro/signup?ref=${encodeURIComponent(code)}`;
}

function daysLeft(date: string | null) {
  if (!date) return null;
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
}

export async function ensureReferralCode(orgId: string): Promise<ReferralInfo> {
  const client = await createClient();

  // Read current org data (RLS allows org members to SELECT their own org)
  const { data: org, error } = await client
    .from("organisations")
    .select("id,referral_code,referral_credit_months,trial_ends_at")
    .eq("id", orgId)
    .maybeSingle();

  if (error || !org) return { available: false, code: null, link: null, creditMonths: 0, trialEndsAt: null, daysLeft: null, referrals: [] };

  // Use SECURITY DEFINER function to generate code if missing (bypasses RLS for atomic write)
  let code = org.referral_code ?? null;
  if (!code) {
    const { data: generatedCode } = await client.rpc("ensure_referral_code", { p_org_id: orgId });
    code = generatedCode ?? null;
  }

  // Fetch this org's referrals (RLS allows members to see their own org's referrals)
  const { data: referrals } = code
    ? await client
        .from("referrals")
        .select("id,referred_email,status,credit_months")
        .eq("referrer_organisation_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return {
    available: true,
    code,
    link: code ? buildReferralLink(code) : null,
    creditMonths: Number(org.referral_credit_months ?? 0),
    trialEndsAt: org.trial_ends_at ?? null,
    daysLeft: daysLeft(org.trial_ends_at ?? null),
    referrals: referrals ?? [],
  };
}

export async function creditReferral(params: { newOrganisationId: string; referredEmail: string | null; referralCode?: string | null }) {
  const referralCode = params.referralCode?.trim();
  if (!referralCode) return;

  const client = await createClient();
  // SECURITY DEFINER function handles cross-org insert/update (bypasses RLS)
  await client.rpc("credit_referral", {
    p_new_org_id: params.newOrganisationId,
    p_referred_email: params.referredEmail ?? null,
    p_referral_code: referralCode,
  });
}

export async function creditReferralOnFirstPayment(organisationId: string): Promise<void> {
  const { createServiceClient } = await import("@/lib/supabase/server");
  const client = await createServiceClient();

  // Look up the referred_by_code for this org
  const { data: org } = await client
    .from("organisations")
    .select("referred_by_code")
    .eq("id", organisationId)
    .maybeSingle();

  const referralCode = org?.referred_by_code?.trim();
  if (!referralCode) return;

  // Get the referred email
  const { data: member } = await client
    .from("organisation_members")
    .select("user_id")
    .eq("organisation_id", organisationId)
    .eq("role", "owner")
    .maybeSingle();

  let referredEmail: string | null = null;
  if (member?.user_id) {
    const { data: profile } = await client
      .from("profiles")
      .select("email")
      .eq("id", member.user_id)
      .maybeSingle();
    referredEmail = (profile as { email?: string | null } | null)?.email ?? null;
  }

  // SECURITY DEFINER RPC — idempotent, safe to call multiple times
  await client.rpc("credit_referral", {
    p_new_org_id: organisationId,
    p_referred_email: referredEmail,
    p_referral_code: referralCode,
  });
}
