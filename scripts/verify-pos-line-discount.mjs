#!/usr/bin/env node
/**
 * Unit checks for lib/pos-line-discount.ts (mirrors logic for CI without jest).
 * Run: node scripts/verify-pos-line-discount.mjs
 */

function clampDiscountPct(v) {
  return Number(Math.min(Math.max(v, 0), 100).toFixed(2));
}

function lineDiscountPct(line, legacyCartPct = 0) {
  if (line.discount_pct != null && line.discount_pct > 0) return clampDiscountPct(line.discount_pct);
  if (legacyCartPct > 0) return clampDiscountPct(legacyCartPct);
  return 0;
}

function lineGrossBefore(line) {
  return line.quantity * line.unit_price;
}

function lineGrossAfter(line, legacyCartPct = 0) {
  const pct = lineDiscountPct(line, legacyCartPct);
  return Number((lineGrossBefore(line) * (1 - pct / 100)).toFixed(2));
}

function cartGrossAfter(lines, legacyCartPct = 0) {
  return Number(lines.reduce((s, l) => s + lineGrossAfter(l, legacyCartPct), 0).toFixed(2));
}

function transactionDiscountPct(lines, legacyCartPct = 0) {
  if (!lines.length) return 0;
  const pcts = lines.map((l) => lineDiscountPct(l, legacyCartPct));
  const first = pcts[0];
  return pcts.every((p) => p === first) ? first : 0;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("ok:", msg);
  }
}

const croissant = { product_id: "c", product_name: "Croissant", quantity: 1, unit_price: 3.2, vat_rate: 9, discount_pct: 32 };
const danish = { product_id: "a", product_name: "Danish", quantity: 1, unit_price: 3.1, vat_rate: 9, discount_pct: 0 };
const coffee = { product_id: "k", product_name: "Coffee", quantity: 1, unit_price: 2.5, vat_rate: 9, discount_pct: 10 };

assert(lineGrossAfter(croissant) === 2.18, "croissant 32% → 2.18");
assert(lineGrossAfter(danish) === 3.1, "danish no discount");
assert(lineGrossAfter(coffee) === 2.25, "coffee 10% → 2.25");
assert(cartGrossAfter([croissant, danish]) === 5.28, "two items one discounted total");
assert(cartGrossAfter([croissant, danish, coffee]) === 7.53, "mixed three lines total");
assert(transactionDiscountPct([croissant, danish]) === 0, "mixed discounts → tx pct 0");
assert(transactionDiscountPct([croissant, { ...danish, discount_pct: 32 }]) === 32, "uniform → tx pct 32");
assert(lineDiscountPct(danish, 10) === 10, "legacy cart pct fallback");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nverify-pos-line-discount: all checks passed");
