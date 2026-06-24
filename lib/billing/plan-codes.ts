export type PlanCode = "core" | "operations" | "scale";

export function normalizePlan(plan: string | null | undefined): PlanCode | null {
  if (plan === "starter" || plan === "core") return "core";
  if (plan === "pro" || plan === "operations") return "operations";
  if (plan === "scale" || plan === "multi_location") return "scale";
  return null;
}
