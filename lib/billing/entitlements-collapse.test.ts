// Before/after proof for Step F: collapsing PLAN_MODULES into a derivation
// from planEntitlements. The "old" implementations below are copied verbatim
// from the last-committed lib/billing/entitlements.ts (git show HEAD, before
// this change) — an independent reference, not a re-derivation of the new
// code, so this test can't pass by construction.
//
// Deliberately exercises every plan code the type system allows plus legacy
// aliases, null/undefined/garbage input, and both hasTrial states — the full
// input space these functions actually accept. Subscription STATUS
// (active/expired/trialing/canceled/...) is not part of that space:
// canUseModule/modulesForPlan/planAllowsModuleEffective take a plan code and
// a hasTrial boolean, never a status. That boundary is exactly why deriving
// from planEntitlements (plan-tier only) rather than resolveEntitlements
// (status- and override-aware) is safe — there's no door for status to leak
// through. This test proves that boundary holds by exhausting the actual
// input space, not by asserting the boundary exists.

import { describe, expect, it } from "vitest";
import {
  modulesForPlan,
  planAllowsModule,
  resolveEffectivePlan,
  planAllowsModuleEffective,
  type BusinessModuleKey,
} from "./entitlements";

// ── Old reference implementation (git show HEAD, pre-collapse) ────────────
type OldPlanCode = "core" | "operations" | "scale";
function oldNormalizePlan(plan: string | null | undefined): OldPlanCode | null {
  if (plan === "starter" || plan === "core") return "core";
  if (plan === "pro" || plan === "operations") return "operations";
  if (plan === "scale" || plan === "multi_location") return "scale";
  return null;
}
const OLD_PLAN_MODULES: Record<OldPlanCode | "multi_location", readonly BusinessModuleKey[]> = {
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
function oldModulesForPlan(plan: string | null | undefined): readonly BusinessModuleKey[] {
  if (plan === "multi_location") return OLD_PLAN_MODULES.multi_location;
  const normalized = oldNormalizePlan(plan);
  if (!normalized) return OLD_PLAN_MODULES.core;
  return OLD_PLAN_MODULES[normalized] ?? OLD_PLAN_MODULES.core;
}
function oldPlanAllowsModule(plan: string | null | undefined, module: BusinessModuleKey): boolean {
  return oldModulesForPlan(plan).includes(module);
}
type OldEffectivePlan = string | OldPlanCode | "trial";
function oldResolveEffectivePlan(input: { subscriptionPlan?: string | null; hasTrial?: boolean }): OldEffectivePlan {
  if (input.subscriptionPlan === "multi_location") return "multi_location";
  const normalized = oldNormalizePlan(input.subscriptionPlan);
  if (normalized) return normalized;
  if (input.hasTrial) return "trial";
  return "starter";
}
function oldPlanAllowsModuleEffective(effectivePlan: OldEffectivePlan, module: BusinessModuleKey): boolean {
  if (effectivePlan === "trial") return module !== "multi_site";
  return oldPlanAllowsModule(effectivePlan, module);
}

// ── Full input space ────────────────────────────────────────────────────
const PLAN_INPUTS: (string | null | undefined)[] = [
  "starter", "core", "pro", "operations", "scale", "multi_location",
  null, undefined, "", "garbage_plan_code",
];
const HAS_TRIAL: boolean[] = [true, false];
const ALL_MODULES: BusinessModuleKey[] = [
  "pos_core", "inventory", "recipe_costing", "team_advanced", "multi_site", "kitchen_ops",
];

// multi_site is the one CONFIRMED, deliberate exception: PLAN_MODULES.multi_site
// entries are deleted as dead weight (canUseModule's multi_site branch never
// reached this map — it returns from its own inline check first), so the new
// map never reports multi_site as included, even for plan=multi_location,
// where the old map did. Every other module must match exactly, with no
// exceptions, across the full input space.

describe("Step F collapse: modulesForPlan matches the old table for every module except multi_site", () => {
  for (const plan of PLAN_INPUTS) {
    it(`plan=${JSON.stringify(plan)}`, () => {
      const oldSet = [...oldModulesForPlan(plan)].filter((m) => m !== "multi_site").sort();
      const newSet = [...modulesForPlan(plan)].sort();
      expect(newSet).toEqual(oldSet);
    });

    it(`plan=${JSON.stringify(plan)} never includes multi_site (confirmed deletion, not a regression)`, () => {
      expect(modulesForPlan(plan)).not.toContain("multi_site");
    });
  }
});

describe("Step F collapse: planAllowsModule matches for every plan x every non-multi_site module", () => {
  for (const plan of PLAN_INPUTS) {
    for (const moduleKey of ALL_MODULES.filter((m) => m !== "multi_site")) {
      it(`plan=${JSON.stringify(plan)} module=${moduleKey}`, () => {
        expect(planAllowsModule(plan, moduleKey)).toBe(oldPlanAllowsModule(plan, moduleKey));
      });
    }
  }
});

describe("Step F collapse: planAllowsModuleEffective matches across plan x hasTrial x non-multi_site module", () => {
  for (const plan of PLAN_INPUTS) {
    for (const hasTrial of HAS_TRIAL) {
      const oldEffective = oldResolveEffectivePlan({ subscriptionPlan: plan, hasTrial });
      const newEffective = resolveEffectivePlan({ subscriptionPlan: plan, hasTrial });
      it(`plan=${JSON.stringify(plan)} hasTrial=${hasTrial} resolves the same effective plan`, () => {
        expect(newEffective).toBe(oldEffective);
      });
      for (const moduleKey of ALL_MODULES.filter((m) => m !== "multi_site")) {
        it(`plan=${JSON.stringify(plan)} hasTrial=${hasTrial} module=${moduleKey}`, () => {
          expect(planAllowsModuleEffective(newEffective, moduleKey)).toBe(
            oldPlanAllowsModuleEffective(oldEffective, moduleKey),
          );
        });
      }
      // multi_site under planAllowsModuleEffective: the trial branch answers
      // "false" without ever touching the map (unaffected either way, old or
      // new). Only the non-trial branch falls through to the map, where the
      // deliberate deletion applies. Assert both halves explicitly instead
      // of skipping multi_site here entirely.
      it(`plan=${JSON.stringify(plan)} hasTrial=${hasTrial} module=multi_site trial branch unaffected by the map change`, () => {
        if (newEffective === "trial") {
          expect(planAllowsModuleEffective(newEffective, "multi_site")).toBe(false);
          expect(oldPlanAllowsModuleEffective(oldEffective, "multi_site")).toBe(false);
        } else {
          expect(planAllowsModuleEffective(newEffective, "multi_site")).toBe(false);
        }
      });
    }
  }
});

describe("Step F collapse: the specific trap cell named during design", () => {
  it("core plan stays kitchen_ops=false regardless of trial state (the cell a status-based derivation would have flipped)", () => {
    expect(planAllowsModule("core", "kitchen_ops")).toBe(false);
    expect(oldPlanAllowsModule("core", "kitchen_ops")).toBe(false);
  });

  it("pos_core is unconditionally true for every input, old and new", () => {
    for (const plan of PLAN_INPUTS) {
      expect(planAllowsModule(plan, "pos_core")).toBe(true);
      expect(oldPlanAllowsModule(plan, "pos_core")).toBe(true);
    }
  });
});
