import type { BillingPlan } from "@/lib/billing/plans";

export type BusinessModuleKey =
  | "pos_core"
  | "inventory"
  | "recipe_costing"
  | "team_advanced"
  | "multi_site"
  | "kitchen_ops";

const PLAN_MODULES: Record<BillingPlan, readonly BusinessModuleKey[]> = {
  starter: ["pos_core"],
  pro: ["pos_core", "inventory", "recipe_costing", "team_advanced", "kitchen_ops"],
  multi_location: [
    "pos_core",
    "inventory",
    "recipe_costing",
    "team_advanced",
    "kitchen_ops",
    "multi_site",
  ],
};

export function modulesForPlan(plan: BillingPlan | null | undefined): readonly BusinessModuleKey[] {
  if (!plan) return PLAN_MODULES.starter;
  return PLAN_MODULES[plan] ?? PLAN_MODULES.starter;
}

export function planAllowsModule(
  plan: BillingPlan | null | undefined,
  module: BusinessModuleKey
): boolean {
  return modulesForPlan(plan).includes(module);
}

export type EffectiveBillingPlan = BillingPlan | "trial";

export function resolveEffectivePlan(input: {
  subscriptionPlan?: BillingPlan | null;
  hasTrial?: boolean;
}): EffectiveBillingPlan {
  if (input.subscriptionPlan) return input.subscriptionPlan;
  if (input.hasTrial) return "trial";
  return "starter";
}

export function planAllowsModuleEffective(
  effectivePlan: EffectiveBillingPlan,
  module: BusinessModuleKey
): boolean {
  if (effectivePlan === "trial") {
    return module !== "multi_site";
  }
  return planAllowsModule(effectivePlan, module);
}
