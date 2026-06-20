import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrgModuleRow } from "@/lib/business-modules";
import type { BusinessProfile } from "@/lib/business-profile";

const MODULE_COLUMNS =
  "business_profile,inventory_enabled,recipe_costing_enabled,team_advanced_enabled,multi_site_ops_enabled,onboarding_completed_at";

const MISSING_COLUMN_HINT =
  "Module settings need a one-time database upgrade. Contact support to apply migration 039, or run 039_business_profile_modules.sql in the Supabase SQL editor.";

export type OrgModuleFlagUpdates = {
  business_profile?: BusinessProfile | string | null;
  inventory_enabled: boolean;
  recipe_costing_enabled: boolean;
  team_advanced_enabled: boolean;
  multi_site_ops_enabled: boolean;
};

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    msg.includes("inventory_enabled") ||
    msg.includes("business_profile") ||
    msg.includes("schema cache")
  );
}

function formatModuleSaveError(error: { code?: string; message?: string }): string {
  if (isMissingColumnError(error)) return MISSING_COLUMN_HINT;
  return "Could not save module settings. Please try again in a moment.";
}

/** True when migration 039 columns exist on organisations. */
export async function orgModuleColumnsAvailable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from("organisations").select("inventory_enabled").limit(1);
  return !error;
}

/** Load module flags when migration 039 is present. */
export async function fetchOrgModuleFlags(
  supabase: SupabaseClient,
  orgId: string
): Promise<OrgModuleRow> {
  const { data, error } = await supabase
    .from("organisations")
    .select(MODULE_COLUMNS)
    .eq("id", orgId)
    .maybeSingle();

  if (error) {
    console.error("org_module_flags_unavailable", { code: error.code, message: error.message });
    if (isMissingColumnError(error)) {
      return {
        inventory_enabled: true,
        recipe_costing_enabled: true,
        team_advanced_enabled: true,
        multi_site_ops_enabled: true,
      };
    }
    return {
      inventory_enabled: false,
      recipe_costing_enabled: false,
      team_advanced_enabled: false,
      multi_site_ops_enabled: false,
    };
  }

  return (data ?? {}) as OrgModuleRow;
}

export async function saveOrgModuleFlags(
  supabase: SupabaseClient,
  orgId: string,
  updates: OrgModuleFlagUpdates
): Promise<{ ok: true } | { ok: false; error: string }> {
  const available = await orgModuleColumnsAvailable(supabase);
  if (!available) {
    return { ok: false, error: MISSING_COLUMN_HINT };
  }

  const payload: Record<string, unknown> = {
    inventory_enabled: updates.inventory_enabled,
    recipe_costing_enabled: updates.recipe_costing_enabled,
    team_advanced_enabled: updates.team_advanced_enabled,
    multi_site_ops_enabled: updates.multi_site_ops_enabled,
  };

  const profile = String(updates.business_profile ?? "").trim();
  if (profile === "simple" || profile === "standard" || profile === "multi_site") {
    payload.business_profile = profile;
  }

  const { error } = await supabase.from("organisations").update(payload).eq("id", orgId);
  if (error) {
    console.error("save_org_module_flags", { code: error.code, message: error.message });
    return { ok: false, error: formatModuleSaveError(error) };
  }

  await supabase
    .from("organisations")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", orgId)
    .then(() => null, () => null);

  return { ok: true };
}
