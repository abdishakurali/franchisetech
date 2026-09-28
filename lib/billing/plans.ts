// Single source of truth for billing plans, prices, and Stripe IDs.
// Every pricing page, checkout route, and backend validation MUST read from here.
// Never hardcode plan prices, amounts, or Stripe price IDs elsewhere.

import { flatPlanFeatures, getPlanFeatureCategories } from "@/lib/billing/plan-features";
import type { BillingMarket } from "@/lib/billing/market";

// Canonical plan keys. 'core' = alias for 'starter', 'operations' = alias for 'pro'.
// 'free'/'growth'/'team' are the new pricing generation (2026-09, displayed as
// Free/Pro/Multi) — deliberately NOT aliased onto 'starter'/'pro'/'scale',
// since those strings already mean the legacy tiers billed to the 2 existing
// subscribers. See lib/billing/plan-codes.ts for the matching entitlement-side
// PlanCode type.
export type BillingPlan = "starter" | "core" | "pro" | "operations" | "multi_location" | "scale" | "free" | "growth" | "team";

/** Stripe lookup keys — canonical live prices (EUR/month). Env vars must point to these. */
export const STRIPE_LOOKUP_KEYS: Record<BillingPlan, string> & Record<string, string> = {
  starter:        "franchisetech_starter_monthly",
  core:           "franchisetech_starter_monthly",
  pro:            "franchisetech_pro_monthly",
  operations:     "franchisetech_pro_monthly",
  scale:          "franchisetech_scale_monthly",
  multi_location: "franchisetech_multi_location_monthly",
  free:           "", // no Stripe subscription — Free never checks out
  growth:         "franchisetech_growth_monthly",
  team:           "franchisetech_team_monthly",
  // Annual variants
  starter_annual:        "franchisetech_starter_annual",
  pro_annual:            "franchisetech_pro_annual",
  scale_annual:          "franchisetech_scale_annual",
  multi_location_annual: "franchisetech_multi_location_annual",
  growth_annual:         "franchisetech_growth_annual",
  team_annual:           "franchisetech_team_annual",
};

/** Live Stripe price IDs aligned with pricingPlans (2026-06-19). Annual IDs added 2026-06-24. */
export const STRIPE_CANONICAL_PRICE_IDS: Record<BillingPlan, string> = {
  starter:        "price_1TkkLdQSKBSEqRxEKI1IQ0Rm",
  core:           "price_1TkkLdQSKBSEqRxEKI1IQ0Rm",
  pro:            "price_1TkNjPQSKBSEqRxEtqTSm45R",
  operations:     "price_1TkNjPQSKBSEqRxEtqTSm45R",
  scale:          "price_placeholder_scale_monthly",
  multi_location: "price_1TgahZQSKBSEqRxEEtIUQ0pU",
  // Placeholders until the test-mode Stripe products are created (pending
  // Stripe CLI re-auth) — same pattern as scale's placeholder above.
  free:           "",
  growth:         "price_placeholder_growth_monthly",
  team:           "price_placeholder_team_monthly",
};

/** Optional one-time €1.00 card verification checkout price (added 2026-07-10). */
export const STRIPE_CARD_VERIFICATION_PRICE_ID = "price_1TqythQSKBSEqRxE8y8aX5Ga";
export const CARD_VERIFICATION_AMOUNT_CENTS = 100;

/** Env override supports test mode; falls back to the canonical live price. */
export function getCardVerificationPriceId(): string {
  return process.env.STRIPE_CARD_VERIFICATION_PRICE_ID ?? STRIPE_CARD_VERIFICATION_PRICE_ID;
}

export type PlanDefinition = {
  readonly id: BillingPlan;
  readonly name: string;
  readonly price: string;
  readonly amountCents: number;
  /** Per-month price when billed annually (e.g., "€39") */
  readonly annualPrice: string;
  /** Total annual charge in cents (e.g., 46800 for €39 × 12) */
  readonly annualAmountCents: number;
  readonly currency: "eur" | "usd" | "gbp";
  readonly interval: "month" | "year";
  readonly cadence: string;
  readonly annualCadence: string;
  readonly description: string;
  /** @deprecated Use getPlanFeatureCategories(market) — kept for JSON-LD / backwards compat */
  readonly features: readonly string[];
  readonly priceEnv: string;
  readonly annualPriceEnv: string;
  readonly highlighted: boolean;
};

function plan(
  def: Omit<PlanDefinition, "features"> & { features?: readonly string[] }
): PlanDefinition {
  return { ...def, features: def.features ?? flatPlanFeatures(def.id) };
}

// ── New pricing generation (2026-09) ── Free / Pro ("growth") / Multi ("team") ──
// Coexists with the legacy plans below (still what the 2 existing subscribers
// are billed on) — nothing here changes their price or entitlements.
export const newPricingPlans: readonly PlanDefinition[] = [
  plan({
    id: "free",
    name: "franchisetech Free",
    price: "€0",
    amountCents: 0,
    annualPrice: "€0",
    annualAmountCents: 0,
    currency: "eur",
    interval: "month",
    cadence: "/forever",
    annualCadence: "/forever",
    description: "For one shop just getting started — POS, a fiscal driver, fiscal receipts, up to 50 products, 1 location. No card, no expiry.",
    priceEnv: "", // no Stripe subscription
    annualPriceEnv: "",
    highlighted: false,
  }),
  plan({
    id: "growth",
    name: "franchisetech Pro",
    price: "€49",
    amountCents: 4900,
    annualPrice: "€39",
    annualAmountCents: 46800,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    annualCadence: "/month, billed annually",
    description: "For one shop that wants stock, recipe costing, kitchen flow, and the accountant export pack — unlimited products.",
    priceEnv: "STRIPE_GROWTH_PRICE_ID",
    annualPriceEnv: "STRIPE_GROWTH_ANNUAL_PRICE_ID",
    highlighted: true,
  }),
  plan({
    id: "team",
    name: "franchisetech Multi",
    price: "€79",
    amountCents: 7900,
    annualPrice: "€63",
    annualAmountCents: 75600,
    currency: "eur",
    interval: "month",
    cadence: "/month base + €29/extra location",
    annualCadence: "/month base, billed annually + €29/extra location",
    description: "For businesses running two or more sites — everything in Pro, plus multi-location and priority support.",
    priceEnv: "STRIPE_TEAM_PRICE_ID",
    annualPriceEnv: "STRIPE_TEAM_ANNUAL_PRICE_ID",
    highlighted: false,
  }),
] as const;

// Legacy tiers — still exactly what the 2 existing subscribers are billed on.
// Kept resolvable via getPlan()/pricingPlans for their billing portal and
// invoices; the public /pricing page and PricingPlansSection render only
// newPricingPlans (filtered by id) for new signups.
const legacyPricingPlans: readonly PlanDefinition[] = [
  plan({
    id: "starter",
    name: "franchisetech Core",
    price: "€49",
    amountCents: 4900,
    annualPrice: "€39",
    annualAmountCents: 46800,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    annualCadence: "/month, billed annually",
    description: "For one shop that needs a legally compliant till with a fiscal driver, fiscal receipts, and daily reports.",
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    annualPriceEnv: "STRIPE_STARTER_ANNUAL_PRICE_ID",
    highlighted: true,
  }),
  plan({
    id: "pro",
    name: "franchisetech Operations",
    price: "€79",
    amountCents: 7900,
    annualPrice: "€63",
    annualAmountCents: 75600,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    annualCadence: "/month, billed annually",
    description: "For owners who want stock, recipe costing, kitchen flow, and stronger staff controls.",
    priceEnv: "STRIPE_PRO_PRICE_ID",
    annualPriceEnv: "STRIPE_PRO_ANNUAL_PRICE_ID",
    highlighted: false,
  }),
  plan({
    id: "scale",
    name: "franchisetech Scale",
    price: "€109",
    amountCents: 10900,
    annualPrice: "€87",
    annualAmountCents: 104400,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    annualCadence: "/month, billed annually",
    description: "For operationally mature businesses that want every module, priority support, and room to grow.",
    priceEnv: "STRIPE_SCALE_PRICE_ID",
    annualPriceEnv: "STRIPE_SCALE_ANNUAL_PRICE_ID",
    highlighted: false,
  }),
  plan({
    id: "multi_location",
    name: "franchisetech Multi-location",
    price: "€89",
    amountCents: 8900,
    annualPrice: "€71",
    annualAmountCents: 85200,
    currency: "eur",
    interval: "month",
    cadence: "/additional location/month",
    annualCadence: "/additional location/month, billed annually",
    description: "For businesses running two or more sites. Requires a Scale base plan.",
    priceEnv: "STRIPE_MULTI_LOCATION_PRICE_ID",
    annualPriceEnv: "STRIPE_MULTI_LOCATION_ANNUAL_PRICE_ID",
    highlighted: false,
  }),
] as const;

/** Every resolvable plan, old and new — what getPlan()/validatePlansConfig() search. */
export const pricingPlans: readonly PlanDefinition[] = [...newPricingPlans, ...legacyPricingPlans];

export { getPlanFeatureCategories };

/** True if all required Stripe env vars are present (supports both old and new naming conventions). */
export function isBillingConfigured(): boolean {
  const hasCorePriceId = Boolean(
    process.env.STRIPE_STARTER_PRICE_ID || process.env.STRIPE_CORE_MONTHLY_PRICE_ID
  );
  const hasOpsPriceId = Boolean(
    process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_OPERATIONS_MONTHLY_PRICE_ID
  );
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    hasCorePriceId &&
    hasOpsPriceId &&
    process.env.NEXT_PUBLIC_APP_URL
  );
}

/**
 * Resolve a Stripe price ID from the plan key and billing interval.
 * Supports both legacy naming (STRIPE_STARTER_PRICE_ID) and new naming
 * (STRIPE_CORE_MONTHLY_PRICE_ID). Returns null if no env var is set.
 */
export function getPriceId(plan: BillingPlan, interval: "month" | "year" = "month"): string | null {
  if (interval === "year") {
    const yearMap: Record<string, string | undefined> = {
      starter:        process.env.STRIPE_STARTER_ANNUAL_PRICE_ID    ?? process.env.STRIPE_CORE_ANNUAL_PRICE_ID,
      core:           process.env.STRIPE_CORE_ANNUAL_PRICE_ID        ?? process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
      pro:            process.env.STRIPE_PRO_ANNUAL_PRICE_ID         ?? process.env.STRIPE_OPERATIONS_ANNUAL_PRICE_ID,
      operations:     process.env.STRIPE_OPERATIONS_ANNUAL_PRICE_ID  ?? process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      scale:          process.env.STRIPE_SCALE_ANNUAL_PRICE_ID       ?? process.env.STRIPE_SCALE_ANNUAL_PRICE_ID,
      multi_location: process.env.STRIPE_MULTI_LOCATION_ANNUAL_PRICE_ID ?? process.env.STRIPE_MULTILOCATION_ANNUAL_PRICE_ID,
      growth:         process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID,
      team:           process.env.STRIPE_TEAM_ANNUAL_PRICE_ID,
    };
    return yearMap[plan] ?? null;
  }
  const monthMap: Record<string, string | undefined> = {
    starter:        process.env.STRIPE_STARTER_PRICE_ID          ?? process.env.STRIPE_CORE_MONTHLY_PRICE_ID,
    core:           process.env.STRIPE_CORE_MONTHLY_PRICE_ID      ?? process.env.STRIPE_STARTER_PRICE_ID,
    pro:            process.env.STRIPE_PRO_PRICE_ID               ?? process.env.STRIPE_OPERATIONS_MONTHLY_PRICE_ID,
    operations:     process.env.STRIPE_OPERATIONS_MONTHLY_PRICE_ID ?? process.env.STRIPE_PRO_PRICE_ID,
    scale:          process.env.STRIPE_SCALE_PRICE_ID             ?? process.env.STRIPE_SCALE_MONTHLY_PRICE_ID,
    multi_location: process.env.STRIPE_MULTI_LOCATION_PRICE_ID   ?? process.env.STRIPE_MULTILOCATION_MONTHLY_PRICE_ID,
    growth:         process.env.STRIPE_GROWTH_PRICE_ID,
    team:           process.env.STRIPE_TEAM_PRICE_ID,
  };
  return monthMap[plan] ?? null;
}

/** Look up a plan definition by ID. 'core' maps to 'starter', 'operations' maps to 'pro'. */
export function getPlan(plan: BillingPlan): PlanDefinition {
  const canonical = plan === "core" ? "starter" : plan === "operations" ? "pro" : plan;
  const found = pricingPlans.find((p) => p.id === canonical);
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
    // Free has no Stripe subscription by design — €0, no price env, never checks out.
    if (plan.id === "free") continue;
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
    return "For businesses running two or more sites. Requires a Scale base plan.";
  }
  return base.description;
}
