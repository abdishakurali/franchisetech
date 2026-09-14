import type { BillingPlan } from "@/lib/billing/plans";
import { normalizePlan, type PlanCode } from "@/lib/billing/plan-codes";
import { planEntitlements, type EntitlementKey } from "@/lib/billing/entitlement-resolver";

export type BusinessModuleKey =
  | "pos_core"
  | "inventory"
  | "recipe_costing"
  | "team_advanced"
  | "multi_site"
  | "kitchen_ops";

// Plan-tier membership for the four modules with an honest 1:1 entitlement
// key, derived from planEntitlements (the static per-plan array — never
// resolveEntitlements(orgId), which layers subscription status and
// per-org overrides on top; see the comment there for why that distinction
// is load-bearing).
//
// pos_core and multi_site are deliberately absent from this map, not
// omitted by oversight:
//   - pos_core is unconditionally true regardless of plan (see below).
//     "Always on" and "has pos.enabled" happen to coincide today, but they
//     don't mean the same thing, and deriving from the latter would make
//     pos_core's availability an accident of how pos.enabled is defined
//     rather than an explicit guarantee.
//   - multi_site's real gate has never gone through this map at all —
//     lib/business-modules.ts's canUseModule special-cases it with its own
//     inline check (the org's multi_site_ops_enabled column AND plan code),
//     returning before it would ever consult modulesForPlan/planAllowsModule.
//     Collapsing this map doesn't change that; it's untouched.
const MODULE_ENTITLEMENT: Record<
  Exclude<BusinessModuleKey, "pos_core" | "multi_site">,
  EntitlementKey
> = {
  inventory: "inventory.enabled",
  recipe_costing: "recipes.costing",
  team_advanced: "team.advanced_roles",
  kitchen_ops: "kitchen.enabled",
};

export function modulesForPlan(plan: BillingPlan | string | null | undefined): readonly BusinessModuleKey[] {
  // normalizePlan already collapses "multi_location" to "scale" — multi_location's
  // non-multi_site module set was always identical to scale's, so no special case
  // is needed here (unlike the old PLAN_MODULES.multi_location array).
  const normalized = normalizePlan(plan);
  const tierKeys = new Set(planEntitlements(normalized));
  const modules: BusinessModuleKey[] = ["pos_core"];
  for (const moduleKey of Object.keys(MODULE_ENTITLEMENT) as (keyof typeof MODULE_ENTITLEMENT)[]) {
    if (tierKeys.has(MODULE_ENTITLEMENT[moduleKey])) modules.push(moduleKey);
  }
  return modules;
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
