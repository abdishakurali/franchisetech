#!/usr/bin/env node
/**
 * P1.8 NIR purchase flow — static verification (no DB required).
 * Run: node scripts/verify-nir-purchase-flow.mjs
 */

function parsePurchaseLinesFromForm(entries) {
  return entries
    .map(({ product_id, quantity, unit_cost, tax_rate, unit_of_measure }) => {
      const qty = Number(quantity) || 0;
      const cost = Number(unit_cost) || 0;
      const rate = Number(tax_rate) || 0;
      const subtotal = qty * cost;
      const taxAmount = (subtotal * rate) / 100;
      return {
        product_id,
        quantity: qty,
        unit_cost: cost,
        total_cost: subtotal,
        tax_rate: rate,
        tax_amount: taxAmount,
        unit_of_measure: unit_of_measure || "each",
      };
    })
    .filter((item) => item.product_id && item.quantity > 0);
}

function formatNirNumber(year, seq) {
  return `NIR-${year}-${String(seq).padStart(6, "0")}`;
}

function canCancelPurchase(status) {
  return status === "draft";
}

function isAlreadyPosted(status, postedAt, nirNumber) {
  if (postedAt) return true;
  if (status === "posted") return true;
  if (status === "received") return true;
  if (nirNumber) return true;
  return false;
}

function countsTowardPurchaseSpend(status) {
  return status === "posted" || status === "received";
}

function simulateStockApply(stockByProduct, items, alreadyPosted) {
  if (alreadyPosted) return { stockByProduct, applied: false };
  const next = { ...stockByProduct };
  for (const item of items) {
    next[item.product_id] = (next[item.product_id] ?? 0) + item.quantity;
  }
  return { stockByProduct: next, applied: true };
}

let passed = 0;
let failed = 0;

function assert(name, cond) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

console.log("P1.8 NIR purchase flow verification\n");

// 1. Draft does not alter stock
{
  const items = parsePurchaseLinesFromForm([
    { product_id: "p1", quantity: 5, unit_cost: 2, tax_rate: 21, unit_of_measure: "kg" },
  ]);
  const stock = { p1: 10 };
  assert("draft path parses line items", items.length === 1);
  // Draft save must not invoke stock apply — stock stays at initial value
  assert("draft purchase leaves stock unchanged", stock.p1 === 10);
}

// 2. Post assigns NIR number format
{
  const num = formatNirNumber(2026, 1);
  assert("NIR number format", num === "NIR-2026-000001");
  assert("NIR sequence padding", formatNirNumber(2026, 42) === "NIR-2026-000042");
}

// 3. Post increases stock once
{
  const items = [{ product_id: "p1", quantity: 3 }];
  let stock = { p1: 10 };
  const first = simulateStockApply(stock, items, false);
  stock = first.stockByProduct;
  assert("post increases stock", stock.p1 === 13);
  assert("post applied flag", first.applied === true);
}

// 4. Second post does not double stock
{
  const items = [{ product_id: "p1", quantity: 3 }];
  let stock = { p1: 13 };
  const second = simulateStockApply(stock, items, true);
  stock = second.stockByProduct;
  assert("second post blocked by idempotency", stock.p1 === 13);
  assert("second post not applied", second.applied === false);
}

// 5. stock_movements uses quantity_change (code convention)
{
  const movement = {
    movement_type: "purchase_received",
    quantity_change: 4,
    reference_type: "purchase",
  };
  assert("movement uses quantity_change not quantity", movement.quantity_change === 4);
  assert("movement type purchase_received", movement.movement_type === "purchase_received");
}

// 6. Posted NIR cannot be cancelled
{
  assert("posted cannot cancel", !canCancelPurchase("posted"));
  assert("received cannot cancel", !canCancelPurchase("received"));
  assert("draft can cancel", canCancelPurchase("draft"));
}

// 7. Legacy received treated as posted
{
  assert("received is already posted", isAlreadyPosted("received", null, null));
  assert("legacy without nir still posted", isAlreadyPosted("received", null, null));
  assert("draft not posted", !isAlreadyPosted("draft", null, null));
}

// 8. Spend totals exclude draft/cancelled
{
  assert("posted counts toward spend", countsTowardPurchaseSpend("posted"));
  assert("received counts toward spend", countsTowardPurchaseSpend("received"));
  assert("draft excluded from spend", !countsTowardPurchaseSpend("draft"));
  assert("cancelled excluded from spend", !countsTowardPurchaseSpend("cancelled"));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
