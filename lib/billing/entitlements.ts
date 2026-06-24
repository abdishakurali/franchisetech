import type { BillingPlan } from "@/lib/billing/plans";
import { normalizePlan, type PlanCode } from "@/lib/billing/plan-codes";

export type BusinessModuleKey =
  | "pos_core"
  | "inventory"
  | "recipe_costing"
  | "team_advanced"
  | "multi_site"
  | "kitchen_ops";

const PLAN_MODULES: Record<PlanCode | "multi_location", readonly BusinessModuleKey[]> = {
  core: ["pos_core"],
  operations: ["pos_core", "inventory", "recipe_costing", "team_advanced", "kitchen_ops"],
  scale: ["pos_core", "inventory", "recipe_costing", "team_advanced", "kitchen_ops"],
  multi_location: [
    "pos_core",
    "inventory",
    "recipe_costing",
    "team_advanced",
    "kitchen_ops",
    "multi_site",
  ],
};

export function modulesForPlan(plan: BillingPlan | string | null | undefined): readonly BusinessModuleKey[] {
  if (plan === "multi_location") return PLAN_MODULES.multi_location;
  const normalized = normalizePlan(plan);
  if (!normalized) return PLAN_MODULES.core;
  return PLAN_MODULES[normalized] ?? PLAN_MODULES.core;
}

export function planAllowsModule(
  plan: BillingPlan | string | null | undefined,
  module: BusinessModuleKey
): boolean {
  return modulesForPlan(plan).includes(module);
}

export type EffectiveBillingPlan = BillingPlan | PlanCode | "trial";

export function resolveEffectivePlan(input: {
  subscriptionPlan?: BillingPlan | string | null;
  hasTrial?: boolean;
}): EffectiveBillingPlan {
  if (input.subscriptionPlan === "multi_location") return "multi_location";
  const normalized = normalizePlan(input.subscriptionPlan);
  if (normalized) return normalized;
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
