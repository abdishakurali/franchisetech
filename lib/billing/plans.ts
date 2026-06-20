// Single source of truth for billing plans, prices, and Stripe IDs.
// Every pricing page, checkout route, and backend validation MUST read from here.
// Never hardcode plan prices, amounts, or Stripe price IDs elsewhere.

import { flatPlanFeatures, getPlanFeatureCategories } from "@/lib/billing/plan-features";
import type { BillingMarket } from "@/lib/billing/market";

export type BillingPlan = "starter" | "pro" | "multi_location";

/** Stripe lookup keys — canonical live prices (EUR/month). Env vars must point to these. */
export const STRIPE_LOOKUP_KEYS: Record<BillingPlan, string> = {
  starter: "franchisetech_starter_monthly",
  pro: "franchisetech_pro_monthly",
  multi_location: "franchisetech_multi_location_monthly",
};

/** Live Stripe price IDs aligned with pricingPlans (2026-06-19). */
export const STRIPE_CANONICAL_PRICE_IDS: Record<BillingPlan, string> = {
  starter: "price_1TkNjMQSKBSEqRxEnsWqWy2Y",
  pro: "price_1TkNjPQSKBSEqRxEtqTSm45R",
  multi_location: "price_1TgahZQSKBSEqRxEEtIUQ0pU",
};

export type PlanDefinition = {
  readonly id: BillingPlan;
  readonly name: string;
  readonly price: string;
  readonly amountCents: number;
  readonly currency: "eur" | "usd" | "gbp";
  readonly interval: "month" | "year";
  readonly cadence: string;
  readonly description: string;
  /** @deprecated Use getPlanFeatureCategories(market) — kept for JSON-LD / backwards compat */
  readonly features: readonly string[];
  readonly priceEnv: string;
  readonly highlighted: boolean;
};

function plan(
  def: Omit<PlanDefinition, "features"> & { features?: readonly string[] }
): PlanDefinition {
  return { ...def, features: def.features ?? flatPlanFeatures(def.id) };
}

export const pricingPlans: readonly PlanDefinition[] = [
  plan({
    id: "starter",
    name: "franchisetech Starter",
    price: "€39",
    amountCents: 3900,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    description: "For one shop that needs a reliable till, products, and daily sales reports.",
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    highlighted: false,
  }),
  plan({
    id: "pro",
    name: "franchisetech Pro",
    price: "€79",
    amountCents: 7900,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    description: "For owners who want stock, recipe costing, kitchen flow, and stronger staff controls.",
    priceEnv: "STRIPE_PRO_PRICE_ID",
    highlighted: true,
  }),
  plan({
    id: "multi_location",
    name: "franchisetech Multi-location",
    price: "€99",
    amountCents: 9900,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    description: "For businesses running two or more sites with Romania fiscal support.",
    priceEnv: "STRIPE_MULTI_LOCATION_PRICE_ID",
    highlighted: false,
  }),
] as const;

export { getPlanFeatureCategories };

export const connectedPlan = {
  name: "Assisted setup",
  price: "€199 one-time",
  description: "Product setup, payment methods, first sale test, and owner dashboard walkthrough.",
  features: [
    "Business and till settings",
    "Product/category setup or import",
    "Payment method setup",
    "First sale and report walkthrough",
  ],
};

/** True if all required Stripe env vars are present. */
export function isBillingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_STARTER_PRICE_ID &&
    process.env.STRIPE_PRO_PRICE_ID &&
    process.env.NEXT_PUBLIC_APP_URL
  );
}

/** Resolve a Stripe price ID from the plan key. Returns null if env var not set. */
export function getPriceId(plan: BillingPlan): string | null {
  const map: Record<BillingPlan, string | undefined> = {
    starter:        process.env.STRIPE_STARTER_PRICE_ID,
    pro:            process.env.STRIPE_PRO_PRICE_ID,
    multi_location: process.env.STRIPE_MULTI_LOCATION_PRICE_ID,
  };
  return map[plan] ?? null;
}

/** Look up a plan definition by ID. Throws for unknown plans. */
export function getPlan(plan: BillingPlan): PlanDefinition {
  const found = pricingPlans.find((p) => p.id === plan);
  if (!found) throw new Error(`Unknown billing plan: "${plan}"`);
  return found;
}

/**
 * Validate the plans config. Throws in development if any plan is misconfigured.
 * In production logs warnings so a bad deploy doesn't crash the server on startup.
 */
export function validatePlansConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const plan of pricingPlans) {
    if (!plan.amountCents || plan.amountCents <= 0)
      errors.push(`Plan "${plan.id}": amountCents must be > 0`);
    if (!plan.currency)
      errors.push(`Plan "${plan.id}": currency is required`);
    if (!plan.interval)
      errors.push(`Plan "${plan.id}": interval is required`);
    if (!plan.priceEnv)
      errors.push(`Plan "${plan.id}": priceEnv is required`);
    // Only check Stripe IDs when Stripe is enabled (dev without keys is fine)
    if (process.env.STRIPE_SECRET_KEY && !getPriceId(plan.id))
      errors.push(`Plan "${plan.id}": env var ${plan.priceEnv} is not set`);
  }

  if (errors.length > 0) {
    const msg = `[billing] Plans config validation failed:\n  ${errors.join("\n  ")}`;
    if (process.env.NODE_ENV === "development") throw new Error(msg);
    console.error(msg);
  }

  return { valid: errors.length === 0, errors };
}

export function planDescriptionForMarket(plan: BillingPlan, market: BillingMarket): string {
  const base = getPlan(plan);
  if (plan === "multi_location" && market !== "RO") {
    return "For businesses running two or more sites with per-site reporting.";
  }
  return base.description;
}
