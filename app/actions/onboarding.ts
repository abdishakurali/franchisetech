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
import { demoProductsForCountry } from "@/lib/onboarding/demo-products";
import { saveOrgModuleFlags } from "@/lib/org-module-flags";
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

  if (existingMembership?.organisation_id) {
    revalidatePath("/app");
    redirect("/app");
  }

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
  const orgId = created?.organisation_id as string | undefined;
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

  // Explicit trial timestamps are not set here. Subscription status falls back
  // to a 15-day trial from organisation creation for new accounts.
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
    referred_by_code: input.referralCode?.trim() || null,
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
    recipe_costing_enabled: modules.recipe_costing_enabled,
    team_advanced_enabled: modules.team_advanced_enabled,
    multi_site_ops_enabled: modules.multi_site_ops_enabled,
  }).then(() => null, () => null);

  await ensureReferralCode(orgId);

  // ── CRITICAL: payment methods ──────────────────────────────────────────
  const { error: pmError } = await supabase.from("payment_methods").insert([
    { organisation_id: orgId, name: "Cash", type: "cash" },
    { organisation_id: orgId, name: "Card", type: "card" },
  ]);
  if (pmError) {
    console.error("onboarding_payment_methods_seed_failed", pmError.message);
    return { error: "Could not create payment methods. Please try again." };
  }

  // ── WARN-ONLY: product category ──────────────────────────────────────
  const { data: category, error: categoryError } = await supabase
    .from("product_categories")
    .insert({
      organisation_id: orgId,
      name: "Menu",
      color: "#2563eb",
      sort_order: 1,
      category_type: "pos",
    })
    .select("id")
    .single();

  if (categoryError) {
    console.warn("onboarding_category_seed_failed", categoryError.message);
  }

  // ── WARN-ONLY: VAT rates ───────────────────────────────────────────────
  const vatSeedError = await seedOrgVatRatesIfEmpty(supabase, orgId, input.countryCode).then(
    () => null,
    (e: unknown) => e,
  );
  if (vatSeedError) {
    console.warn("onboarding_vat_seed_failed", vatSeedError);
  }

  const { data: defaultVat } = await supabase
    .from("vat_rates")
    .select("rate")
    .eq("organisation_id", orgId)
    .eq("is_default", true)
    .limit(1)
    .maybeSingle();
  const vatRate = defaultVat?.rate != null ? Number(defaultVat.rate) : input.countryCode === "RO" ? 21 : 23;

  if (category?.id) {
    const demos = demoProductsForCountry(input.countryCode, input.businessType);
    const { error: productsError } = await supabase.from("products").insert(
      demos.map((item) => ({
        organisation_id: orgId,
        category_id: category.id,
        name: item.name,
        sale_price: item.sale_price,
        vat_rate: vatRate,
        available_in_pos: true,
        active: true,
        pos_sort_order: item.sort_order,
      })),
    );
    if (productsError) {
      console.warn("onboarding_products_seed_failed", productsError.message);
    }
  }

  // ── CRITICAL: guarantee at least one sellable product ─────────────────
  const { count: productCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("active", true);

  if (!productCount || productCount === 0) {
    const fallbackPrice = input.countryCode === "RO" ? 12 : 2.5;
    const { error: fallbackError } = await supabase.from("products").insert({
      organisation_id: orgId,
      name: "Espresso",
      sale_price: fallbackPrice,
      vat_rate: vatRate,
      available_in_pos: true,
      active: true,
      pos_sort_order: 1,
    });
    if (fallbackError) {
      console.error("onboarding_product_fallback_failed", fallbackError.message);
      return { error: "Could not create your product list. Please try again." };
    }
  }

  // ── CRITICAL: POS session ─────────────────────────────────────────────
  const siteId = created?.site_id as string | undefined;
  if (!siteId) {
    console.error("onboarding_no_site_id", { orgId });
    return { error: "Workspace created but no till location was found. Please contact support." };
  }

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

  // ── Growth milestone: till opened ──────────────────────────────────────
  await recordGrowthMilestone(supabase, orgId, "till_opened", user.id);
  await supabase.from("organisations").update({ onboarding_completed: true }).eq("id", orgId).then(
    () => null,
    (e: unknown) => console.error("onboarding_completed_update_failed", e),
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
  // The card-verification flow records its own milestone when used; ordinary
  // new accounts receive the soft trial through subscription status fallback.
  if (user.email) {
    void upsertLoopsContact(user.email, {
      firstName: input.userName?.trim(),
      plan: input.preferredPlan ?? "starter",
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
      plan: input.preferredPlan ?? "starter",
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
  redirect("/app/setup-checklist?welcome=1");
}
