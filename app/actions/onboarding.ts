"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureReferralCode } from "@/lib/referrals";
import {
  deriveBusinessProfile,
  defaultModulesForProfile,
  type BusinessProfile,
  type IngredientTrackingIntent,
  type LocationBand,
} from "@/lib/business-profile";
import { seedOrgVatRatesIfEmpty } from "@/lib/vat-rates-server";
import { saveOrgModuleFlags } from "@/lib/org-module-flags";
import { onboardingStepRoute, type OnboardingStep } from "@/lib/onboarding/steps";
import type { BillingPlan } from "@/lib/billing/plans";
import { upsertLoopsContact } from "@/lib/loops";
import { recordGrowthMilestone } from "@/lib/growth/activation";
import { captureServerEvent, flushPostHog } from "@/lib/posthog-server";

const COUNTRY_LABELS: Record<string, string> = {
  RO: "Romania",
  IE: "Ireland",
  UK: "United Kingdom",
  OTHER: "Other",
};

function currencyForCountry(countryCode: string): { code: string; symbol: string } {
  if (countryCode === "RO") return { code: "RON", symbol: "lei" };
  if (countryCode === "UK" || countryCode === "GB" || countryCode === "GBR") return { code: "GBP", symbol: "£" };
  return { code: "EUR", symbol: "€" };
}

export async function completePosOnboarding(input: {
  orgName: string;
  businessType?: string;
  userName?: string;
  countryCode: string;
  anafCif?: string;
  anafVatRegistered?: boolean;
  anafAddress?: string;
  locationBand: LocationBand;
  ingredientTracking: IngredientTrackingIntent;
  preferredPlan?: BillingPlan;
  referralCode?: string | null;
  connectEfactura?: boolean;
  acquisition?: {
    utm_source?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_medium?: string;
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    ga_client_id?: string;
    fbclid?: string;
  } | null;
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in. Please sign in and try again." };
  }

  if (!input.orgName.trim()) {
    return { error: "Brand/shop name is required." };
  }

  if (input.userName?.trim()) {
    await supabase
      .from("profiles")
      .update({ full_name: input.userName.trim() })
      .eq("id", user.id)
      .then(() => null, () => null);
  }

  const { data: existingMembership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .limit(1)
    .maybeSingle();

  let orgId: string | undefined;
  let siteId: string | undefined;

  if (existingMembership?.organisation_id) {
    // A prior attempt already created the org/membership for this user (the
    // RPC below is not re-run — it would create a second organisation).
    // If that attempt also finished this step, send them to wherever they
    // actually are instead of back through account creation. If it's still
    // unset, a prior attempt got the org created but failed before finishing
    // the critical setup below (payment methods / till session) — resume on
    // the SAME org rather than dead-ending them in a redirect loop back to
    // this form, which always hit this branch and bounced to /app.
    orgId = existingMembership.organisation_id;
    const { data: orgRow } = await supabase
      .from("organisations")
      .select("onboarding_step")
      .eq("id", orgId)
      .maybeSingle();
    const step = (orgRow?.onboarding_step ?? null) as OnboardingStep | null;
    if (step && step !== "location_type" && step !== "business_cui") {
      redirect(onboardingStepRoute(step, input.countryCode === "RO"));
    }
    const { data: existingSite } = await supabase
      .from("sites")
      .select("id")
      .eq("organisation_id", orgId)
      .limit(1)
      .maybeSingle();
    siteId = existingSite?.id;
  } else {
    const { data, error } = await supabase.rpc("create_organisation_with_owner", {
      p_org_name: input.orgName.trim(),
      p_business_type: input.businessType || null,
      p_asset_name: null,
      p_asset_type: "fridge",
    });

    if (error) {
      console.error("onboarding_rpc_failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return { error: "Could not create your workspace. Please try again." };
    }

    const created = Array.isArray(data) ? data[0] : data;
    orgId = created?.organisation_id as string | undefined;
    siteId = created?.site_id as string | undefined;
  }

  if (!orgId) {
    return { error: "Workspace was created but could not be loaded. Please refresh and try again." };
  }

  const profile: BusinessProfile = deriveBusinessProfile({
    locationBand: input.locationBand,
    ingredientTracking: input.ingredientTracking,
  });
  const modules = defaultModulesForProfile(profile);
  const countryLabel = COUNTRY_LABELS[input.countryCode] ?? COUNTRY_LABELS.OTHER;
  const { code: currencyCode, symbol: currencySymbol } = currencyForCountry(input.countryCode);

  // Trial retired 2026-09: no trial timestamps are set here or anywhere else
  // in onboarding. Every new org is permanently on the Free plan (see
  // lib/billing/entitlement-resolver.ts / lib/billing/subscription.ts) until
  // it subscribes.

  // ── Accountant-partner referral capture ─────────────────────────────────
  // Resolved BEFORE the consumer referral fallback below, and written to its
  // own accountant_partner_code column — never referred_by_code, so the two
  // referral systems can never collide on the same org. accountant_partners
  // has RLS restricting SELECT to auth.uid() = user_id, so this lookup (by
  // referral_code, on behalf of an org that isn't the partner's own) needs
  // the service role, same as ensureReferralCode's cross-org RPC calls.
  const rawReferralCode = input.referralCode?.trim() || null;
  let accountantPartnerCode: string | null = null;
  let consumerReferralCode: string | null = rawReferralCode;
  if (rawReferralCode?.startsWith("AP-")) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const service = await createServiceClient();
    const { data: partner } = await service
      .from("accountant_partners")
      .select("referral_code")
      .eq("referral_code", rawReferralCode)
      .eq("status", "active")
      .maybeSingle();
    if (partner) {
      accountantPartnerCode = partner.referral_code;
      consumerReferralCode = null;
    }
  }

  const { error: orgUpdateError } = await supabase.from("organisations").update({
    business_type: input.businessType || null,
    country: countryLabel,
    country_code: input.countryCode,
    location_band: input.locationBand,
    ingredient_tracking_intent: input.ingredientTracking,
    anaf_cif: input.countryCode === "RO" ? input.anafCif?.trim() || null : null,
    anaf_vat_registered: input.countryCode === "RO" ? Boolean(input.anafVatRegistered) : false,
    company_address: input.countryCode === "RO" ? input.anafAddress?.trim() || null : null,
    currency_code: currencyCode,
    currency_symbol: currencySymbol,
    referred_by_code: consumerReferralCode,
    accountant_partner_code: accountantPartnerCode,
    acquisition_source: input.acquisition?.utm_source || null,
    acquisition_campaign: input.acquisition?.utm_campaign || null,
    acquisition_content: input.acquisition?.utm_content || null,
    acquisition_medium: input.acquisition?.utm_medium || null,
    acquisition_gclid: input.acquisition?.gclid || null,
    acquisition_gbraid: input.acquisition?.gbraid || null,
    acquisition_wbraid: input.acquisition?.wbraid || null,
    acquisition_ga_client_id: input.acquisition?.ga_client_id || null,
    acquisition_fbclid: input.acquisition?.fbclid || null,
  }).eq("id", orgId);

  if (orgUpdateError) {
    console.error("onboarding_org_update_failed", orgUpdateError.message);
    // Non-critical — workspace exists; continue
  }

  await saveOrgModuleFlags(supabase, orgId, {
    business_profile: profile,
    inventory_enabled: modules.inventory_enabled,
    purchases_enabled: modules.purchases_enabled,
    recipe_costing_enabled: modules.recipe_costing_enabled,
    team_advanced_enabled: modules.team_advanced_enabled,
    multi_site_ops_enabled: modules.multi_site_ops_enabled,
  }).then(() => null, () => null);

  await ensureReferralCode(orgId);

  // ── CRITICAL: payment methods (idempotent — resuming a prior attempt
  // must not duplicate these, and must not fail if they already exist) ────
  const { data: existingPaymentMethods } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("organisation_id", orgId)
    .limit(1);
  if (!existingPaymentMethods?.length) {
    const { error: pmError } = await supabase.from("payment_methods").insert([
      { organisation_id: orgId, name: "Cash", type: "cash" },
      { organisation_id: orgId, name: "Card", type: "card" },
    ]);
    if (pmError) {
      console.error("onboarding_payment_methods_seed_failed", pmError.message);
      return { error: "Could not create payment methods. Please try again." };
    }
  }

  // ── WARN-ONLY: product category (idempotent, same reason) ─────────────
  const { data: existingCategory } = await supabase
    .from("product_categories")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("category_type", "pos")
    .limit(1)
    .maybeSingle();
  if (!existingCategory) {
    const { error: categoryError } = await supabase.from("product_categories").insert({
      organisation_id: orgId,
      name: "Menu",
      color: "#b4903f",
      sort_order: 1,
      category_type: "pos",
    });
    if (categoryError) {
      console.warn("onboarding_category_seed_failed", categoryError.message);
    }
  }

  // ── WARN-ONLY: VAT rates ───────────────────────────────────────────────
  // The organisation's ANAF VAT status is the source of truth for the
  // initial selling default. Purchase VAT remains independently selectable.
  const vatSeedError = await seedOrgVatRatesIfEmpty(
    supabase,
    orgId,
    input.countryCode,
    Boolean(input.anafVatRegistered),
  ).then(
    () => null,
    (e: unknown) => e,
  );
  if (vatSeedError) {
    console.warn("onboarding_vat_seed_failed", vatSeedError);
  }

  // ── CRITICAL: POS session (idempotent — never open a second one for the
  // same org; also the project rule "Do not create duplicate POS sessions") ─
  if (!siteId) {
    console.error("onboarding_no_site_id", { orgId });
    return { error: "Workspace created but no till location was found. Please contact support." };
  }

  const { data: existingSession } = await supabase
    .from("pos_sessions")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("status", "open")
    .limit(1)
    .maybeSingle();
  if (!existingSession) {
    const { error: sessionError } = await supabase.from("pos_sessions").insert({
      organisation_id: orgId,
      site_id: siteId,
      opened_by: user.id,
      opening_cash: 0,
      expected_cash: 0,
      status: "open",
    });
    if (sessionError) {
      console.error("onboarding_pos_session_failed", sessionError.message);
      return { error: "Could not open your till. Please try again." };
    }
  }

  // ── Growth milestone: till opened ──────────────────────────────────────
  await recordGrowthMilestone(supabase, orgId, "till_opened", user.id);
  // Onboarding is NOT complete yet — account creation is step 1 of the
  // guided journey (modules → menu → fiscal → first sale → result), not
  // the whole thing. onboarding_completed only flips true at the end, in
  // completeOnboardingJourney (app/actions/onboarding-steps.ts).
  await supabase.from("organisations").update({ onboarding_step: "modules" }).eq("id", orgId).then(
    () => null,
    (e: unknown) => console.error("onboarding_step_update_failed", e),
  );

  // ── Preferred plan cookie ──────────────────────────────────────────────
  if (input.preferredPlan) {
    const { cookies } = await import("next/headers");
    const { PREFERRED_PLAN_COOKIE } = await import("@/lib/billing/preferred-plan");
    (await cookies()).set(PREFERRED_PLAN_COOKIE, input.preferredPlan, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
  }

  // ── Loops: non-blocking ────────────────────────────────────────────────
  // Trial retired 2026-09 — every new org lands permanently on Free until it
  // subscribes; no card verification step exists anymore.
  if (user.email) {
    void upsertLoopsContact(user.email, {
      firstName: input.userName?.trim(),
      plan: input.preferredPlan ?? "free",
    }).catch((e: unknown) => console.error("onboarding_loops_contact_failed", e));
  }
  // Fire-and-forget capture; flush before the action's request scope ends.
  after(flushPostHog);
  captureServerEvent(
    user.id,
    "onboarding_completed",
    {
      organisation_id: orgId,
      country_code: input.countryCode,
      plan: input.preferredPlan ?? "free",
      business_type: input.businessType ?? null,
    },
    { organisation: orgId },
  );
  captureServerEvent(
    user.id,
    "location_created",
    {
      organisation_id: orgId,
      country_code: input.countryCode,
      business_type: input.businessType ?? null,
      location_band: input.locationBand,
    },
    { organisation: orgId },
  );

  const businessType = input.businessType?.toLocaleLowerCase("ro-RO") ?? "";
  const isQualifiedLead =
    input.countryCode === "RO" &&
    ["cafenea", "café", "takeaway", "patiserie", "brutărie", "bakery", "magazin mic", "small shop"]
      .some((target) => businessType.includes(target));
  if (isQualifiedLead) {
    captureServerEvent(
      user.id,
      "qualified_lead",
      {
        organisation_id: orgId,
        country_code: input.countryCode,
        business_type: input.businessType ?? null,
        location_band: input.locationBand,
      },
      { organisation: orgId },
    );
  }

  revalidatePath("/app");
  revalidatePath("/onboarding");

  // ── e-Factura connect redirect ─────────────────────────────────────────
  if (input.connectEfactura) {
    const anafClientId = process.env.ANAF_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://franchisetech.ro";
    if (anafClientId) {
      const anafOAuthUrl = `https://logincert.anaf.ro/anaf-oauth2/v1/authorize?response_type=code&client_id=${anafClientId}&redirect_uri=${encodeURIComponent(siteUrl + "/api/anaf/auth/callback")}&token_content_type=jwt&state=${orgId}`;
      redirect(anafOAuthUrl);
    }
  }

  // Card verification is no longer required to enter the app — new signups
  // can open the till and ring up sales first; app/app/layout.tsx only
  // redirects to /onboarding/verify-card once they've had a real preview
  // (Z-report view or a few sales).
  redirect("/onboarding/modules");
}
