"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureReferralCode } from "@/lib/referrals";
import { getDefaultThresholds, type AssetType } from "@/lib/temperature";

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
