# Annual billing defaults off — live Stripe annual prices don't match code's expected amount

Status: accepted (interim — annual should be re-enabled once the Stripe-side price is fixed)

Found via a real browser-tested QA audit (2026-09-06) and confirmed in production logs: clicking "Subscribe" while the pricing page's "Anual" toggle is active 503s with "Checkout-ul nu a pornit" on every plan. `app/api/billing/checkout/route.ts` compares the live Stripe price's `unit_amount` against `lib/billing/plans.ts`'s expected `annualAmountCents` (46800/75600 — the full annual charge) before allowing checkout, refusing to proceed on a mismatch rather than risk charging the wrong amount. The live Stripe prices behind `STRIPE_CORE_ANNUAL_PRICE_ID` / `STRIPE_OPERATIONS_ANNUAL_PRICE_ID` return `unit_amount: 3900` / `6300` — the monthly-equivalent discounted rate, not the annual total — so every annual checkout attempt mismatches and gets blocked.

The safety check itself is doing its job correctly (better a blocked checkout than a wrong charge); the bug is the Stripe-side price configuration. That requires the Stripe Dashboard to fix (create or correct the annual Price objects to actually charge the annual total on a yearly interval) — not something fixable from this codebase alone.

Interim mitigation: `PricingPlansSection.tsx`'s billing-interval toggle now defaults to `"month"` instead of `"year"`, since monthly checkout is correctly configured. This unblocks the default path but does not fix annual — a visitor who manually switches the toggle still hits the same 503. Whether to also disable/hide the annual option entirely until the Stripe prices are corrected is an open question for whoever owns that decision.
