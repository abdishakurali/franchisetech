#!/usr/bin/env node
/**
 * Verify Stripe price env vars match lib/billing/plans.ts amounts.
 * Usage: STRIPE_SECRET_KEY=sk_... node scripts/verify-stripe-prices.mjs
 */
import Stripe from "stripe";

const PLANS = [
  { id: "starter", env: "STRIPE_STARTER_PRICE_ID", amountCents: 4900, lookup: "franchisetech_starter_monthly" },
  { id: "pro", env: "STRIPE_PRO_PRICE_ID", amountCents: 7900, lookup: "franchisetech_pro_monthly" },
  { id: "multi_location", env: "STRIPE_MULTI_LOCATION_PRICE_ID", amountCents: 9900, lookup: "franchisetech_multi_location_monthly" },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is required");
  process.exit(1);
}

const stripe = new Stripe(key);
let failed = false;

for (const plan of PLANS) {
  const priceId = process.env[plan.env];
  if (!priceId) {
    console.error(`✗ ${plan.id}: missing ${plan.env}`);
    failed = true;
    continue;
  }
  const price = await stripe.prices.retrieve(priceId);
  const okAmount = price.unit_amount === plan.amountCents;
  const okCurrency = price.currency === "eur";
  const okActive = price.active;
  const okLookup = price.lookup_key === plan.lookup;
  const okMeta = price.metadata?.plan_key === plan.id;
  if (okAmount && okCurrency && okActive) {
    console.log(`✓ ${plan.id}: ${priceId} → €${(price.unit_amount / 100).toFixed(2)}/mo`);
    if (!okLookup) console.warn(`  warn: lookup_key is ${price.lookup_key ?? "null"}, expected ${plan.lookup}`);
    if (!okMeta) console.warn(`  warn: metadata.plan_key is ${price.metadata?.plan_key ?? "null"}`);
  } else {
    console.error(`✗ ${plan.id}: ${priceId} amount=${price.unit_amount} active=${price.active} currency=${price.currency}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
