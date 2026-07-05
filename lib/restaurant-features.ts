export const RESTAURANT_FEATURE_KEYS = [
  "kitchen_display_enabled",
  "restaurant_order_flow_enabled",
  "table_service_enabled",
  "order_types_enabled",
  "kitchen_stations_enabled",
  "product_modifiers_enabled",
  "courses_enabled",
  "kitchen_printing_enabled",
  "payment_split_enabled",
  "tips_enabled",
  "compact_workstation_nav_enabled",
] as const;

export type RestaurantFeatureKey = (typeof RESTAURANT_FEATURE_KEYS)[number];

export const RESTAURANT_FEATURES: Record<RestaurantFeatureKey, { label: string; description: string; ready: boolean }> = {
  kitchen_display_enabled: {
    label: "Kitchen display",
    description: "Send paid POS orders to a clear kitchen or prep board.",
    ready: true,
  },
  restaurant_order_flow_enabled: {
    label: "Order workflow",
    description: "Track orders from sent to preparing, ready, and completed.",
    ready: true,
  },
  order_types_enabled: {
    label: "Dine-in / takeaway / delivery",
    description: "Label orders so staff know how each order leaves the business.",
    ready: true,
  },
  table_service_enabled: {
    label: "Table management",
    description: "Floor plan, table tabs, and checkout from POS.",
    ready: true,
  },
  kitchen_stations_enabled: {
    label: "Prep stations",
    description: "Route items to areas like kitchen, bar, coffee, or packing.",
    ready: true,
  },
  product_modifiers_enabled: {
    label: "Product options",
    description: "Add choices such as size, milk, extras, or preparation notes.",
    ready: false,
  },
  courses_enabled: {
    label: "Courses / service timing",
    description: "Group food by course for more formal service.",
    ready: false,
  },
  kitchen_printing_enabled: {
    label: "Kitchen ticket printing",
    description: "Print prep tickets when hardware is configured.",
    ready: false,
  },
  payment_split_enabled: {
    label: "Split payments",
    description: "Take one sale across cash, card, voucher, bank, or other methods.",
    ready: true,
  },
  tips_enabled: {
    label: "Tips",
    description: "Add tips at checkout and keep them separate from product sales.",
    ready: true,
  },
  compact_workstation_nav_enabled: {
    label: "Compact workstation view",
    description: "Give POS and kitchen screens more room with an icon-only sidebar.",
    ready: true,
  },
};

export const INDUSTRY_OPTIONS = [
  { value: "cafe", label: "Cafe" },
  { value: "restaurant", label: "Restaurant" },
  { value: "takeaway_qsr", label: "Takeaway / QSR" },
  { value: "bakery", label: "Bakery" },
  { value: "food_truck", label: "Food truck" },
  { value: "retail", label: "Retail" },
  { value: "florist", label: "Florist" },
  { value: "salon_barber", label: "Salon / Barber" },
  { value: "convenience_store", label: "Convenience store" },
  { value: "franchise_multi_location", label: "Franchise / Multi-location" },
  { value: "catering_events", label: "Catering / Events" },
  { value: "other", label: "Other" },
] as const;


export function getSuggestedFeaturesForCountry(_country: string | null | undefined): RestaurantFeatureKey[] {
  return [];
}
export function isFeatureEnabled(
  org: Partial<Record<RestaurantFeatureKey, boolean | null | undefined>> | null | undefined,
  key: RestaurantFeatureKey
) {
  return Boolean(org?.[key]);
}

export function getSuggestedFeaturesForIndustry(industry: string | null | undefined): RestaurantFeatureKey[] {
  switch (industry) {
    case "restaurant":
      return ["kitchen_display_enabled", "restaurant_order_flow_enabled", "order_types_enabled", "table_service_enabled", "payment_split_enabled", "tips_enabled"];
    case "cafe":
      return ["kitchen_display_enabled", "order_types_enabled", "product_modifiers_enabled", "payment_split_enabled", "tips_enabled"];
    case "takeaway_qsr":
      return ["kitchen_display_enabled", "order_types_enabled", "restaurant_order_flow_enabled"];
    case "food_truck":
      return ["order_types_enabled", "kitchen_display_enabled"];
    case "catering_events":
      return ["restaurant_order_flow_enabled", "courses_enabled"];
    default:
      return [];
  }
}

export function normaliseIndustry(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return INDUSTRY_OPTIONS.some((option) => option.value === raw) ? raw : "other";
}
