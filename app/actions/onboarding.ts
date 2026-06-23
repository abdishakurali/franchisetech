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

const COUNTRY_LABELS: Record<string, string> = {
  RO: "Romania",
  IE: "Ireland",
  UK: "United Kingdom",
  OTHER: "Other",
};

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
  acquisition?: {
    utm_source?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_medium?: string;
  } | null;
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be signed in. Please sign in and try again." };
  }

  if (!input.orgName.trim()) {
    return { error: "Business name is required." };
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
  const currencyCode = input.countryCode === "RO" ? "RON" : "EUR";
  const currencySymbol = input.countryCode === "RO" ? "lei" : "€";
  const trialEndsAt = new Date(Date.now() + 15 * 86400000).toISOString();

  await supabase.from("organisations").update({
    business_type: input.businessType || null,
    country: countryLabel,
    country_code: input.countryCode,
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
  }).eq("id", orgId);

  // Module columns — safe if migration 039 not yet applied.
  await saveOrgModuleFlags(supabase, orgId, {
    business_profile: profile,
    inventory_enabled: modules.inventory_enabled,
    recipe_costing_enabled: modules.recipe_costing_enabled,
    team_advanced_enabled: modules.team_advanced_enabled,
    multi_site_ops_enabled: modules.multi_site_ops_enabled,
  }).then(() => null, () => null);

  await ensureReferralCode(orgId);

  await supabase.from("payment_methods").insert([
    { organisation_id: orgId, name: "Cash", type: "cash" },
    { organisation_id: orgId, name: "Card", type: "card" },
  ]);

  const { data: category } = await supabase
    .from("product_categories")
    .insert({
      organisation_id: orgId,
      name: "Menu",
      color: "#2563eb",
      sort_order: 1,
    })
    .select("id")
    .single();

  await seedOrgVatRatesIfEmpty(supabase, orgId, input.countryCode);

  const { data: defaultVat } = await supabase
    .from("vat_rates")
    .select("rate")
    .eq("organisation_id", orgId)
    .eq("is_default", true)
    .limit(1)
    .maybeSingle();
  const vatRate = defaultVat?.rate != null ? Number(defaultVat.rate) : input.countryCode === "RO" ? 19 : 23;

  if (category?.id) {
    const demos = demoProductsForCountry(input.countryCode);
    await supabase.from("products").insert(
      demos.map((item) => ({
        organisation_id: orgId,
        category_id: category.id,
        name: item.name,
        sale_price: item.sale_price,
        vat_rate: vatRate,
        available_in_pos: true,
        active: true,
        sort_order: item.sort_order,
      })),
    );
  }

  const siteId = created?.site_id as string | undefined;
  if (siteId) {
    await supabase.from("pos_sessions").insert({
      organisation_id: orgId,
      site_id: siteId,
      opened_by: user.id,
      opening_cash: 0,
      expected_cash: 0,
      status: "open",
    });
  }

  if (input.preferredPlan) {
    const { cookies } = await import("next/headers");
    const { PREFERRED_PLAN_COOKIE } = await import("@/lib/billing/preferred-plan");
    (await cookies()).set(PREFERRED_PLAN_COOKIE, input.preferredPlan, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
  }

  if (user.email) {
    const trialStartedAt = new Date().toISOString();
    void upsertLoopsContact(user.email, {
      firstName: input.userName?.trim(),
      plan: input.preferredPlan ?? "starter",
      trialStartedAt,
    });
    void trackLoopsEvent(user.email, "trial_started", {
      businessName: input.orgName.trim(),
      countryCode: input.countryCode,
      plan: input.preferredPlan ?? "starter",
    });
  }

  revalidatePath("/app");
  revalidatePath("/onboarding");
  redirect("/app/setup-checklist?welcome=1");
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
