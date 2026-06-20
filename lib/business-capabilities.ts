import type { BusinessProfile } from "@/lib/business-profile";
import { normaliseBusinessProfile } from "@/lib/business-profile";
import type { BusinessModuleKey } from "@/lib/billing/entitlements";
import {
  RESTAURANT_FEATURES,
  getSuggestedFeaturesForIndustry,
  type RestaurantFeatureKey,
} from "@/lib/restaurant-features";

export type CapabilityCategoryId =
  | "stock_costing"
  | "kitchen_orders"
  | "payments_till"
  | "products_menu"
  | "team_locations"
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
    id: "stock_costing",
    title: "Stock & costing",
    description: "Track deliveries, ingredient costs, recipes, and margins. Turn off to keep the menu simple.",
    items: [
      {
        kind: "module",
        id: "inventory",
        moduleKey: "inventory",
        fieldName: "inventory_enabled",
        label: "Stock & purchases",
        description: "Stock levels, suppliers, purchases, and receiving.",
        planGated: true,
      },
      {
        kind: "module",
        id: "recipe_costing",
        moduleKey: "recipe_costing",
        fieldName: "recipe_costing_enabled",
        label: "Recipe costing",
        description: "Recipes, ingredient costs, and margin reports.",
        planGated: true,
      },
    ],
  },
  {
    id: "kitchen_orders",
    title: "Kitchen & orders",
    description: "For businesses that prepare food to order and need a clear path from till to kitchen.",
    items: [
      {
        kind: "feature",
        id: "kitchen_display_enabled",
        fieldName: "kitchen_display_enabled",
        label: RESTAURANT_FEATURES.kitchen_display_enabled.label,
        description: RESTAURANT_FEATURES.kitchen_display_enabled.description,
        ready: RESTAURANT_FEATURES.kitchen_display_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "restaurant_order_flow_enabled",
        fieldName: "restaurant_order_flow_enabled",
        label: RESTAURANT_FEATURES.restaurant_order_flow_enabled.label,
        description: RESTAURANT_FEATURES.restaurant_order_flow_enabled.description,
        ready: RESTAURANT_FEATURES.restaurant_order_flow_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "order_types_enabled",
        fieldName: "order_types_enabled",
        label: RESTAURANT_FEATURES.order_types_enabled.label,
        description: RESTAURANT_FEATURES.order_types_enabled.description,
        ready: RESTAURANT_FEATURES.order_types_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "kitchen_stations_enabled",
        fieldName: "kitchen_stations_enabled",
        label: RESTAURANT_FEATURES.kitchen_stations_enabled.label,
        description: RESTAURANT_FEATURES.kitchen_stations_enabled.description,
        ready: RESTAURANT_FEATURES.kitchen_stations_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "table_service_enabled",
        fieldName: "table_service_enabled",
        label: RESTAURANT_FEATURES.table_service_enabled.label,
        description: RESTAURANT_FEATURES.table_service_enabled.description,
        ready: RESTAURANT_FEATURES.table_service_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "courses_enabled",
        fieldName: "courses_enabled",
        label: RESTAURANT_FEATURES.courses_enabled.label,
        description: RESTAURANT_FEATURES.courses_enabled.description,
        ready: RESTAURANT_FEATURES.courses_enabled.ready,
        planGated: false,
      },
      {
        kind: "feature",
        id: "kitchen_printing_enabled",
        fieldName: "kitchen_printing_enabled",
        label: RESTAURANT_FEATURES.kitchen_printing_enabled.label,
        description: RESTAURANT_FEATURES.kitchen_printing_enabled.description,
        ready: RESTAURANT_FEATURES.kitchen_printing_enabled.ready,
        planGated: false,
      },
    ],
  },
  {
    id: "payments_till",
    title: "Payments & till",
    description: "How staff take payment and handle tips at the till.",
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
    id: "products_menu",
    title: "Products & menu",
    description: "Extra choices on products when your menu needs variants or notes.",
    items: [
      {
        kind: "feature",
        id: "product_modifiers_enabled",
        fieldName: "product_modifiers_enabled",
        label: RESTAURANT_FEATURES.product_modifiers_enabled.label,
        description: RESTAURANT_FEATURES.product_modifiers_enabled.description,
        ready: RESTAURANT_FEATURES.product_modifiers_enabled.ready,
        planGated: false,
      },
    ],
  },
  {
    id: "team_locations",
    title: "Team & locations",
    description: "More staff control or multiple branches.",
    items: [
      {
        kind: "module",
        id: "team_advanced",
        moduleKey: "team_advanced",
        fieldName: "team_advanced_enabled",
        label: "Team & audit",
        description: "Team roles, permissions, and cash audit trail.",
        planGated: true,
      },
      {
        kind: "module",
        id: "multi_site",
        moduleKey: "multi_site",
        fieldName: "multi_site_ops_enabled",
        label: "Multi-site operations",
        description: "Multiple locations and site switching.",
        planGated: true,
      },
    ],
  },
  {
    id: "workstation",
    title: "Workstation layout",
    description: "Screen layout for busy tills and kitchen displays.",
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
