export type BusinessProfile = "simple" | "standard" | "multi_site";

export type IngredientTrackingIntent = "yes" | "no" | "later";

export type LocationBand = "one" | "few" | "many";

export const BUSINESS_PROFILE_LABELS: Record<BusinessProfile, string> = {
  simple: "Small shop / solo café",
  standard: "Growing restaurant",
  multi_site: "Franchise / multi-location",
};

export function normaliseBusinessProfile(value: unknown): BusinessProfile {
  if (value === "simple" || value === "standard" || value === "multi_site") return value;
  return "simple";
}

export function deriveBusinessProfile(input: {
  locationBand: LocationBand;
  ingredientTracking: IngredientTrackingIntent;
}): BusinessProfile {
  if (input.locationBand === "few" || input.locationBand === "many") {
    return "multi_site";
  }
  if (input.ingredientTracking === "yes") {
    return "standard";
  }
  return "simple";
}

export function defaultModulesForProfile(profile: BusinessProfile): {
  inventory_enabled: boolean;
  recipe_costing_enabled: boolean;
  team_advanced_enabled: boolean;
  multi_site_ops_enabled: boolean;
} {
  switch (profile) {
    case "multi_site":
      return {
        inventory_enabled: true,
        recipe_costing_enabled: true,
        team_advanced_enabled: true,
        multi_site_ops_enabled: true,
      };
    case "standard":
      return {
        inventory_enabled: true,
        recipe_costing_enabled: true,
        team_advanced_enabled: true,
        multi_site_ops_enabled: false,
      };
    case "simple":
    default:
      return {
        inventory_enabled: false,
        recipe_costing_enabled: false,
        team_advanced_enabled: false,
        multi_site_ops_enabled: false,
      };
  }
}

export function recommendedPlanForProfile(profile: BusinessProfile): "starter" | "pro" | "scale" | "multi_location" {
  if (profile === "multi_site") return "multi_location";
  if (profile === "standard") return "pro";
  return "starter";
}
