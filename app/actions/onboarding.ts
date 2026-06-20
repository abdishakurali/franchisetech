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
  locationBand: LocationBand;
  ingredientTracking: IngredientTrackingIntent;
  seedSampleCategory?: boolean;
  referralCode?: string | null;
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
    currency_code: currencyCode,
    currency_symbol: currencySymbol,
    business_profile: profile,
    inventory_enabled: modules.inventory_enabled,
    recipe_costing_enabled: modules.recipe_costing_enabled,
    team_advanced_enabled: modules.team_advanced_enabled,
    multi_site_ops_enabled: modules.multi_site_ops_enabled,
    onboarding_completed_at: new Date().toISOString(),
    trial_started_at: new Date().toISOString(),
    trial_ends_at: trialEndsAt,
    referred_by_code: input.referralCode?.trim() || null,
  }).eq("id", orgId);

  await ensureReferralCode(orgId);

  await supabase.from("payment_methods").insert([
    { organisation_id: orgId, name: "Cash", type: "cash" },
    { organisation_id: orgId, name: "Card", type: "card" },
  ]);

  if (input.seedSampleCategory) {
    const { data: cats } = await supabase
      .from("product_categories")
      .select("id")
      .eq("organisation_id", orgId)
      .limit(1);
    if (!cats?.length) {
      await supabase.from("product_categories").insert({
        organisation_id: orgId,
        name: "General",
        color: "#2563eb",
        sort_order: 1,
      });
    }
  }

  await seedOrgVatRatesIfEmpty(supabase, orgId, input.countryCode);

  revalidatePath("/app");
  revalidatePath("/onboarding");
  redirect("/app/setup-checklist");
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
