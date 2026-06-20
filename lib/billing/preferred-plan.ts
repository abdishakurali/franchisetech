import type { BillingPlan } from "./plans";

export const PREFERRED_PLAN_COOKIE = "franchisetech_preferred_plan";

const VALID: BillingPlan[] = ["starter", "pro", "multi_location"];

export function isPreferredBillingPlan(value: string | null | undefined): value is BillingPlan {
  return VALID.includes(value as BillingPlan);
}

export async function getPreferredPlan(): Promise<BillingPlan | null> {
  const { cookies } = await import("next/headers");
  const value = (await cookies()).get(PREFERRED_PLAN_COOKIE)?.value;
  return isPreferredBillingPlan(value) ? value : null;
}

export function writePreferredPlanClient(plan: BillingPlan): void {
  if (typeof window === "undefined") return;
  document.cookie = `${PREFERRED_PLAN_COOKIE}=${plan};path=/;max-age=604800;samesite=lax`;
}

export function readPreferredPlanClient(): BillingPlan | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${PREFERRED_PLAN_COOKIE}=(starter|pro|multi_location)`));
  return match && isPreferredBillingPlan(match[1]) ? match[1] : null;
}
