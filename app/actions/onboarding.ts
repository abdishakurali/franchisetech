"use server";

import { revalidatePath } from "next/cache";
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
import { getDefaultThresholds, type AssetType } from "@/lib/temperature";
import { demoProductsForCountry } from "@/lib/onboarding/demo-products";
import { saveOrgModuleFlags } from "@/lib/org-module-flags";
import type { BillingPlan } from "@/lib/billing/plans";
import { trackLoopsEvent, upsertLoopsContact } from "@/lib/loops";
import { assertEntitlement } from "@/lib/billing/entitlement-resolver";
import { recordGrowthMilestone } from "@/lib/growth/activation";

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
  const trialEndsAt = new Date(Date.now() + 15 * 86400000).toISOString();

  const { error: orgUpdateError } = await supabase.from("organisations").update({
    business_type: input.businessType || null,
    country: countryLabel,
    country_code: input.countryCode,
    location_band: input.locationBand,
    ingredient_tracking_intent: input.ingredientTracking,
    anaf_cif: input.countryCode === "RO" ? input.anafCif?.trim() || null : null,
    anaf_vat_registered: input.countryCode === "RO" ? Boolean(input.anafVatRegistered) : false,
    currency_code: currencyCode,
    currency_symbol: currencySymbol,
    trial_started_at: new Date().toISOString(),
    trial_ends_at: trialEndsAt,
    referred_by_code: input.referralCode?.trim() || null,
    acquisition_source: input.acquisition?.utm_source || null,
    acquisition_campaign: input.acquisition?.utm_campaign || null,
    acquisition_content: input.acquisition?.utm_content || null,
    acquisition_medium: input.acquisition?.utm_medium || null,
    acquisition_gclid: input.acquisition?.gclid || null,
    acquisition_gbraid: input.acquisition?.gbraid || null,
    acquisition_wbraid: input.acquisition?.wbraid || null,
    acquisition_ga_client_id: input.acquisition?.ga_client_id || null,
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
    const demos = demoProductsForCountry(input.countryCode);
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
  await recordGrowthMilestone(supabase, orgId, "till_opened");
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
  if (user.email) {
    const trialStartedAt = new Date().toISOString();
    void upsertLoopsContact(user.email, {
      firstName: input.userName?.trim(),
      plan: input.preferredPlan ?? "starter",
      trialStartedAt,
    }).catch((e: unknown) => console.error("onboarding_loops_contact_failed", e));
    void trackLoopsEvent(user.email, "trial_started", {
      businessName: input.orgName.trim(),
      countryCode: input.countryCode,
      plan: input.preferredPlan ?? "starter",
    }).catch((e: unknown) => console.error("onboarding_loops_event_failed", e));
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

  redirect("/app/pos?welcome=1");
}


type OnboardingAsset = {
  name: string;
  assetType: AssetType;
};

export async function createOrganisationWithOwner(params: {
  orgName: string;
  businessType?: string;
  userName?: string;
  assetName?: string;
  assetType?: AssetType;
  assets?: OnboardingAsset[];
  referralCode?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("onboarding_rpc_failed", { code: userError?.code, message: userError?.message });
    return { error: "You must be signed in. Please sign in and try again." };
  }

  if (params.userName?.trim()) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: params.userName.trim() })
      .eq("id", user.id);
    if (profileError) {
      console.error("onboarding_profile_update_failed", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });
    }
  }

  const assets = (params.assets?.length ? params.assets : [{
    name: params.assetName?.trim() || "Walk-in Cold Room",
    assetType: params.assetType || "fridge",
  }]).filter((asset) => asset.name.trim());
  const firstAsset = assets[0] ?? { name: "Walk-in Cold Room", assetType: "fridge" };

  const { data, error } = await supabase.rpc("create_organisation_with_owner", {
    p_org_name: params.orgName.trim(),
    p_business_type: params.businessType || null,
    p_asset_name: firstAsset.name.trim(),
    p_asset_type: firstAsset.assetType || "fridge",
  });

  if (error) {
    console.error("onboarding_rpc_failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      params: {
        hasOrgName: Boolean(params.orgName),
        businessType: params.businessType,
        hasAssetName: Boolean(params.assetName),
        assetType: params.assetType,
      },
    });
    return { error: "Could not create your workspace. Please try again." };
  }

  const created = Array.isArray(data) ? data[0] : data;
  if (created?.organisation_id) {
    const trialEndsAt = new Date(Date.now() + 15 * 86400000).toISOString();
    await supabase.from("organisations").update({
      trial_started_at: new Date().toISOString(),
      trial_ends_at: trialEndsAt,
      referred_by_code: params.referralCode?.trim() || null,
    }).eq("id", created.organisation_id).then(() => null, () => null);
    await ensureReferralCode(created.organisation_id);
  }
  const extraAssets = assets.slice(1);
  if (created?.organisation_id && created?.site_id && extraAssets.length) {
    const rows = extraAssets.map((asset) => {
      const defaults = getDefaultThresholds(asset.assetType);
      return {
        organisation_id: created.organisation_id,
        site_id: created.site_id,
        name: asset.name.trim(),
        asset_type: asset.assetType,
        qr_code: `FP-ASSET-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        min_temp: defaults.minTemp,
        max_temp: defaults.maxTemp,
        active: true,
      };
    });
    const { error: extraAssetsError } = await supabase.from("assets").insert(rows);
    if (extraAssetsError) {
      console.error("onboarding_extra_assets_failed", {
        code: extraAssetsError.code,
        message: extraAssetsError.message,
        details: extraAssetsError.details,
        hint: extraAssetsError.hint,
        count: rows.length,
      });
      return { error: "Workspace was created, but extra units could not be added. Add them from Equipment." };
    }
  }
  revalidatePath("/app");
  revalidatePath("/onboarding");
  return {
    organisationId: created?.organisation_id ?? null,
    siteId: created?.site_id ?? null,
    assetId: created?.asset_id ?? null,
  };
}

export async function createOnboardingSetup(input: {
  orgName: string;
  businessType: string;
  siteName?: string;
  siteCity?: string;
  siteEircode?: string;
  assetName: string;
  assetType: AssetType;
  assetLocation?: string;
}) {
  return createOrganisationWithOwner({
    orgName: input.orgName,
    businessType: input.businessType,
    assetName: input.assetName,
    assetType: input.assetType,
  });
}

export async function createSite(
  orgId: string,
  name: string,
  city: string,
  eircode: string
) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: membership } = await client
    .from("organisation_members")
    .select("role")
    .eq("organisation_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership || !["owner", "manager"].includes(membership.role ?? "")) {
    return { error: "Forbidden" };
  }

  const { count } = await client
    .from("sites")
    .select("*", { count: "exact", head: true })
    .eq("organisation_id", orgId);
  if ((count ?? 0) >= 1) {
    await assertEntitlement(orgId, "multi_site.enabled");
  }

  const { data: site, error } = await client
    .from("sites")
    .insert({
      organisation_id: orgId,
      name,
      city: city || null,
      eircode: eircode || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { site };
}

export async function createAsset(
  orgId: string,
  siteId: string,
  name: string,
  assetType: string,
  location: string,
  qrCode: string,
  minTemp: string,
  maxTemp: string
) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: asset, error } = await client
    .from("assets")
    .insert({
      organisation_id: orgId,
      site_id: siteId,
      name,
      asset_type: assetType,
      location: location || null,
      qr_code: qrCode,
      min_temp: minTemp ? parseFloat(minTemp) : null,
      max_temp: maxTemp ? parseFloat(maxTemp) : null,
      active: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { asset };
}
