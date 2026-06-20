import type { BusinessProfile } from "@/lib/business-profile";
import type { BusinessModuleKey } from "@/lib/billing/entitlements";

export const BUSINESS_PROFILE_LABELS_RO: Record<BusinessProfile, string> = {
  simple: "Magazin mic / cafenea solo",
  standard: "Restaurant în creștere",
  multi_site: "Franciză / mai multe locații",
};

export const MODULE_LABELS_RO: Record<BusinessModuleKey, string> = {
  pos_core: "POS și vânzări zilnice",
  inventory: "Stoc și achiziții",
  recipe_costing: "Costuri rețete",
  team_advanced: "Echipă și audit",
  multi_site: "Operațiuni multi-site",
  kitchen_ops: "Bucătărie și comenzi",
};

export function profileLabel(profile: BusinessProfile, locale?: string | null): string {
  if (locale === "ro") return BUSINESS_PROFILE_LABELS_RO[profile];
  const labels: Record<BusinessProfile, string> = {
    simple: "Small shop / solo café",
    standard: "Growing restaurant",
    multi_site: "Franchise / multi-location",
  };
  return labels[profile];
}

export function moduleLabel(module: BusinessModuleKey, locale?: string | null): string {
  if (locale === "ro") return MODULE_LABELS_RO[module];
  const labels: Record<BusinessModuleKey, string> = {
    pos_core: "POS & daily sales",
    inventory: "Stock & purchases",
    recipe_costing: "Recipe costing",
    team_advanced: "Team & audit",
    multi_site: "Multi-site operations",
    kitchen_ops: "Kitchen & order flow",
  };
  return labels[module];
}
