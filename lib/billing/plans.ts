// Single source of truth for billing plans, prices, and Stripe IDs.
// Every pricing page, checkout route, and backend validation MUST read from here.
// Never hardcode plan prices, amounts, or Stripe price IDs elsewhere.

export type BillingPlan = "starter" | "pro" | "multi_location";

export interface PlanDefinition {
  readonly id: BillingPlan;
  readonly name: string;
  /** Display string shown to users, e.g. "€29" */
  readonly price: string;
  /** Amount in smallest currency unit (cents for EUR). Must match the Stripe price object. */
  readonly amountCents: number;
  readonly currency: "eur" | "usd" | "gbp";
  readonly interval: "month" | "year";
  readonly cadence: string;
  readonly description: string;
  readonly features: readonly string[];
  /** Name of the environment variable holding this plan's Stripe price ID. */
  readonly priceEnv: string;
  readonly highlighted: boolean;
}

export const pricingPlans: readonly PlanDefinition[] = [
  {
    id: "starter",
    name: "franchisetech Starter",
    price: "€39",
    amountCents: 3900,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    description: "For one small shop starting with POS sales, products, and daily reports.",
    features: [
      "No credit card required",
      "POS sales",
      "Products & categories",
      "Transaction history",
      "Daily cash control",
      "Stock overview",
      "Manual cash drawer mode",
      "Basic reports",
    ],
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    highlighted: false,
  },
  {
    id: "pro",
    name: "franchisetech Pro",
    price: "€79",
    amountCents: 7900,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    description: "The main plan for owners who want stock, recipe costing, staff, and stronger controls.",
    features: [
      "No credit card required",
      "Everything in Starter",
      "Team roles & permissions",
      "Cash audit trail",
      "Recipe costing",
      "Stock controls",
      "Reminders & schedules",
      "Manager review & exports",
      "Cash drawer connector",
      "Advanced reports",
      "Priority support",
    ],
    priceEnv: "STRIPE_PRO_PRICE_ID",
    highlighted: true,
  },
  {
    id: "multi_location",
    name: "franchisetech Multi-location",
    price: "€99",
    amountCents: 9900,
    currency: "eur",
    interval: "month",
    cadence: "/month",
    description: "For franchise or multi-site operations with central reporting.",
    features: [
      "No credit card required",
      "Everything in Pro",
      "Multiple locations",
      "Central reporting dashboard",
      "Franchise management tools",
      "FiscalNet integration (Romania)",
      "Dedicated account support",
    ],
    priceEnv: "STRIPE_MULTI_LOCATION_PRICE_ID",
    highlighted: false,
  },
] as const;

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
