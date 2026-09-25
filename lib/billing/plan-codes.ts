// "core"/"operations"/"scale" are the legacy (pre-2026-09) plan tiers — frozen
// forever for the 2 live subscribers still billed on them. "free"/"growth"/
// "team" are the new pricing generation (displayed as Free/Pro/Multi) and are
// NEVER aliased from "pro"/"scale" the way legacy strings are, precisely
// because "pro" already means something else (the old €79 operations tier).
export type PlanCode = "core" | "operations" | "scale" | "free" | "growth" | "team";

export function normalizePlan(plan: string | null | undefined): PlanCode | null {
  if (plan === "starter" || plan === "core") return "core";
  if (plan === "pro" || plan === "operations") return "operations";
  if (plan === "scale" || plan === "multi_location") return "scale";
  if (plan === "free") return "free";
  if (plan === "growth") return "growth";
  if (plan === "team") return "team";
  return null;
}
