import type { BusinessProfile } from "@/lib/business-profile";
import {
  planAllowsModuleEffective,
  resolveEffectivePlan,
  type BusinessModuleKey,
  type EffectiveBillingPlan,
} from "@/lib/billing/entitlements";
import type { BillingPlan } from "@/lib/billing/plans";

export type { BusinessModuleKey } from "@/lib/billing/entitlements";

export type OrgModuleRow = {
  business_profile?: BusinessProfile | string | null;
  inventory_enabled?: boolean | null;
  recipe_costing_enabled?: boolean | null;
  team_advanced_enabled?: boolean | null;
  multi_site_ops_enabled?: boolean | null;
};

export const BUSINESS_MODULE_DEFINITIONS: readonly {
  key: BusinessModuleKey;
  label: string;
  description: string;
  settingsKey: keyof OrgModuleRow | null;
  routes: readonly string[];
}[] = [
  {
    key: "pos_core",
    label: "POS & daily sales",
    description: "Products, till, transactions, and basic reports.",
    settingsKey: null,
    routes: ["/app/pos", "/app/products", "/app/transactions", "/app/reports"],
  },
  {
    key: "inventory",
    label: "Stock & purchases",
    description: "Stock levels, suppliers, purchases, and NIR receiving.",
    settingsKey: "inventory_enabled",
    routes: ["/app/stock", "/app/purchases", "/app/suppliers"],
  },
  {
    key: "recipe_costing",
    label: "Recipe costing",
    description: "Recipes, ingredient costs, and margin reports.",
    settingsKey: "recipe_costing_enabled",
    routes: ["/app/recipes", "/app/reports/margins"],
  },
  {
    key: "team_advanced",
    label: "Team & audit",
    description: "Team roles, permissions, and cash audit trail.",
    settingsKey: "team_advanced_enabled",
    routes: ["/app/settings/team", "/app/settings/cash-drawer-audit"],
  },
  {
    key: "multi_site",
    label: "Multi-site operations",
    description: "Multiple locations and central reporting.",
    settingsKey: "multi_site_ops_enabled",
    routes: ["/app/sites"],
  },
  {
    key: "kitchen_ops",
    label: "Kitchen & order flow",
    description: "Kitchen display and restaurant order workflow toggles.",
    settingsKey: null,
    routes: ["/app/kitchen"],
  },
] as const;

const MODULE_COLUMN: Record<Exclude<BusinessModuleKey, "pos_core" | "kitchen_ops">, keyof OrgModuleRow> = {
  inventory: "inventory_enabled",
  recipe_costing: "recipe_costing_enabled",
  team_advanced: "team_advanced_enabled",
  multi_site: "multi_site_ops_enabled",
};

export function isModuleEnabled(org: OrgModuleRow | null | undefined, key: BusinessModuleKey): boolean {
  if (!org) return key === "pos_core";
  if (key === "pos_core") return true;
  if (key === "kitchen_ops") return true;
  const column = MODULE_COLUMN[key as keyof typeof MODULE_COLUMN];
  return Boolean(org[column]);
}

export function canUseModule(input: {
  org: OrgModuleRow | null | undefined;
  module: BusinessModuleKey;
  subscriptionPlan?: BillingPlan | null;
  hasTrial?: boolean;
}): boolean {
  if (input.module === "pos_core") return true;
  if (!isModuleEnabled(input.org, input.module)) return false;
  const effectivePlan = resolveEffectivePlan({
    subscriptionPlan: input.subscriptionPlan,
    hasTrial: input.hasTrial,
  });
  return planAllowsModuleEffective(effectivePlan, input.module);
}

export function isModuleVisible(input: {
  org: OrgModuleRow | null | undefined;
  module: BusinessModuleKey;
  subscriptionPlan?: BillingPlan | null;
  hasTrial?: boolean;
}): boolean {
  return canUseModule(input);
}

export function moduleBlockReason(input: {
  org: OrgModuleRow | null | undefined;
  module: BusinessModuleKey;
  subscriptionPlan?: BillingPlan | null;
  hasTrial?: boolean;
}): string | null {
  if (input.module === "pos_core") return null;
  if (!isModuleEnabled(input.org, input.module)) {
    return "Enable this module in Settings when you are ready.";
  }
  const effectivePlan = resolveEffectivePlan({
    subscriptionPlan: input.subscriptionPlan,
    hasTrial: input.hasTrial,
  });
  if (!planAllowsModuleEffective(effectivePlan, input.module)) {
    return "Available on Pro. Upgrade your plan or start a Pro trial.";
  }
  return null;
}

export function pathnameRequiresModule(pathname: string): BusinessModuleKey | null {
  for (const def of BUSINESS_MODULE_DEFINITIONS) {
    if (def.routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      return def.key;
    }
  }
  return null;
}

export function effectivePlanLabel(plan: EffectiveBillingPlan): string {
  if (plan === "trial") return "Trial";
  if (plan === "multi_location") return "Multi-location";
  if (plan === "pro") return "Pro";
  return "Starter";
}
