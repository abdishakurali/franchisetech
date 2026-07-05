import type { BusinessProfile } from "@/lib/business-profile";
import { normaliseBusinessProfile } from "@/lib/business-profile";
import type { BusinessModuleKey } from "@/lib/billing/entitlements";
import {
  RESTAURANT_FEATURES,
  getSuggestedFeaturesForIndustry,
  type RestaurantFeatureKey,
} from "@/lib/restaurant-features";

export type CapabilityCategoryId =
  | "payments_till"
  | "workstation";

export type ModuleCapabilityId = "inventory" | "recipe_costing" | "team_advanced" | "multi_site";

export type CapabilityItem =
  | {
      kind: "module";
      id: ModuleCapabilityId;
      moduleKey: BusinessModuleKey;
      fieldName: string;
      label: string;
      description: string;
      planGated: boolean;
    }
  | {
      kind: "feature";
      id: RestaurantFeatureKey;
      fieldName: RestaurantFeatureKey;
      label: string;
      description: string;
      ready: boolean;
      planGated: false;
    };

export type CapabilityCategory = {
  id: CapabilityCategoryId;
  title: string;
  description: string;
  items: CapabilityItem[];
};

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    id: "payments_till",
    title: "Payments & till",
    description: "Simple POS behaviour that does not install a separate module.",
    items: [
      {
        kind: "feature",
        id: "payment_split_enabled",
        fieldName: "payment_split_enabled",
        label: RESTAURANT_FEATURES.payment_split_enabled.label,
        description: RESTAURANT_FEATURES.payment_split_enabled.description,
        ready: RESTAURANT_FEATURES.payment_split_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "tips_enabled",
        fieldName: "tips_enabled",
        label: RESTAURANT_FEATURES.tips_enabled.label,
        description: RESTAURANT_FEATURES.tips_enabled.description,
        ready: RESTAURANT_FEATURES.tips_enabled.ready,
        planGated: false,
      },
    ],
  },
  {
    id: "workstation",
    title: "Workstation layout",
    description: "Screen layout for busy tills and installed kitchen displays.",
    items: [
      {
        kind: "feature",
        id: "compact_workstation_nav_enabled",
        fieldName: "compact_workstation_nav_enabled",
        label: RESTAURANT_FEATURES.compact_workstation_nav_enabled.label,
        description: RESTAURANT_FEATURES.compact_workstation_nav_enabled.description,
        ready: RESTAURANT_FEATURES.compact_workstation_nav_enabled.ready,
        planGated: false,
      },
    ],
  },
];

export type CapabilitySuggestion = {
  label: string;
  reason: "industry" | "profile";
};

const ADDON_FEATURE_KEYS = new Set<RestaurantFeatureKey>([
  "kitchen_display_enabled",
  "restaurant_order_flow_enabled",
  "table_service_enabled",
  "order_types_enabled",
  "kitchen_stations_enabled",
  "courses_enabled",
  "kitchen_printing_enabled",
  "product_modifiers_enabled",
]);

function moduleSuggestionsForIndustry(industry: string | null | undefined): ModuleCapabilityId[] {
  switch (industry) {
    case "restaurant":
    case "bakery":
    case "catering_events":
      return ["inventory", "recipe_costing"];
    case "franchise_multi_location":
      return ["multi_site", "team_advanced", "inventory"];
    case "convenience_store":
    case "retail":
      return ["inventory"];
    default:
      return [];
  }
}

function moduleSuggestionsForProfile(profile: BusinessProfile): ModuleCapabilityId[] {
  switch (profile) {
    case "multi_site":
      return ["inventory", "recipe_costing", "team_advanced", "multi_site"];
    case "standard":
      return ["inventory", "recipe_costing"];
    case "simple":
    default:
      return [];
  }
}

const MODULE_SUGGESTION_LABELS: Record<ModuleCapabilityId, string> = {
  inventory: "Stock & purchases",
  recipe_costing: "Recipe costing",
  team_advanced: "Team & audit",
  multi_site: "Multi-site operations",
};

export function getCapabilitySuggestions(input: {
  industry?: string | null;
  businessProfile?: BusinessProfile | string | null;
}): CapabilitySuggestion[] {
  const profile = normaliseBusinessProfile(input.businessProfile);
  const seen = new Set<string>();
  const out: CapabilitySuggestion[] = [];

  for (const key of getSuggestedFeaturesForIndustry(input.industry)) {
    if (ADDON_FEATURE_KEYS.has(key)) continue;
    const label = RESTAURANT_FEATURES[key].label;
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, reason: "industry" });
    }
  }

  for (const mod of moduleSuggestionsForIndustry(input.industry)) {
    const label = MODULE_SUGGESTION_LABELS[mod];
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, reason: "industry" });
    }
  }

  for (const mod of moduleSuggestionsForProfile(profile)) {
    const label = MODULE_SUGGESTION_LABELS[mod];
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, reason: "profile" });
    }
  }

  return out;
}

export function findCapabilityItem(
  id: ModuleCapabilityId | RestaurantFeatureKey
): CapabilityItem | undefined {
  for (const category of CAPABILITY_CATEGORIES) {
    const item = category.items.find((entry) => entry.id === id);
    if (item) return item;
  }
  return undefined;
}
