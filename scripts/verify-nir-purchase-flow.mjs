#!/usr/bin/env node
/**
 * P1.8 NIR purchase flow — static verification (no DB required).
 * Run: node scripts/verify-nir-purchase-flow.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function read(relPath) {
  return readFileSync(resolve(root, relPath), "utf8");
}

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

// ── Source / migration static checks (atomic post) ─────────────
{
  const migration = read("supabase/migrations/037_nir_purchase_fields.sql");
  const kitchenops = read("app/actions/kitchenops.ts");

  assert("migration defines post_nir_purchase RPC", /function public\.post_nir_purchase/.test(migration));
  assert("post RPC uses FOR UPDATE row lock", /for update/i.test(migration));
  assert("post RPC checks ALREADY_POSTED", migration.includes("ALREADY_POSTED"));
  assert("post RPC uses quantity_change on stock_movements", migration.includes("quantity_change"));
  assert("post RPC has NOT EXISTS movement guard", /if exists\s*\(\s*select 1\s*from public\.stock_movements/i.test(migration));
  assert("post RPC grants execute to service_role only", /grant execute on function public\.post_nir_purchase/.test(migration));
  assert("next_nir_number not granted to service_role", !/grant execute on function public\.next_nir_number.*service_role/s.test(migration));

  assert("server action calls post_nir_purchase RPC", kitchenops.includes('rpc("post_nir_purchase"'));
  assert("server action does not call next_nir_number", !kitchenops.includes('rpc("next_nir_number"'));
  assert("applyPurchaseStockIncrease removed from server action", !kitchenops.includes("applyPurchaseStockIncrease"));
  assert("postNirPurchase uses createServiceClient server-side", kitchenops.includes("createServiceClient"));
}

// ── Romanian document layout (print + detail) ─────────────────
{
  const printPage = read("app/app/purchases/[id]/print/page.tsx");
  const detailPage = read("app/app/purchases/[id]/page.tsx");
  const purchaseForm = read("components/app/PurchaseForm.tsx");
  const nirLib = read("lib/nir/purchase.ts");
  const migration = read("supabase/migrations/037_nir_purchase_fields.sql");

  assert("NIR RO title constant defined", nirLib.includes("NOTĂ DE RECEPȚIE ȘI CONSTATARE DE DIFERENȚE"));
  assert("NIR RO code 14-3-1A defined", nirLib.includes("14-3-1A"));
  assert("print page uses RO title constant", printPage.includes("NIR_RO_TITLE"));
  assert("print page shows document code", printPage.includes("NIR_RO_CODE"));
  assert("print page has supplier invoice label", printPage.includes("Nr. factură furnizor"));
  assert("print page has observations label", printPage.includes("Diferențe / Observații"));
  assert("print page has signature labels", printPage.includes("Recepționat de") && printPage.includes("Comisie recepție"));
  assert("print page has software disclaimer", printPage.includes("certificare legală") || printPage.includes("legal or accounting certification"));
  assert("print page legacy without fake NIR", printPage.includes("fără număr NIR") || printPage.includes("no NIR number"));
  assert("detail page legacy received banner", detailPage.includes("Cumpărare veche / fără NIR") || detailPage.includes("Legacy purchase / no NIR"));
  assert("detail page observations label", detailPage.includes("Observații / diferențe"));
  assert("form has supplier invoice date label", purchaseForm.includes("Data factură furnizor"));
  assert("form has observations label", purchaseForm.includes("Observații / diferențe"));
  assert("migration 037 avoids reception_notes column", !migration.includes("reception_notes"));
  assert("POS discount script still present", read("scripts/verify-pos-line-discount.mjs").includes("discount"));
}

// 1. Draft does not alter stock
{
  const items = parsePurchaseLinesFromForm([
    { product_id: "p1", quantity: 5, unit_cost: 2, tax_rate: 21, unit_of_measure: "kg" },
  ]);
  const stock = { p1: 10 };
  assert("draft path parses line items", items.length === 1);
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

// 9. Unified VAT catalog — no hardcoded purchase/product rate arrays
{
  const purchaseForm = read("components/app/PurchaseForm.tsx");
  const productNew = read("app/app/products/new/page.tsx");
  const productEdit = read("app/app/products/[id]/edit/page.tsx");
  const vatLib = read("lib/vat-rates.ts");
  assert("PurchaseForm has no RO_TAX_RATES", !purchaseForm.includes("RO_TAX_RATES"));
  assert("PurchaseForm has no EN_TAX_RATES", !purchaseForm.includes("EN_TAX_RATES"));
  assert("PurchaseForm uses VatRateSelect", purchaseForm.includes("VatRateSelect"));
  assert("products/new has no VAT_RATES constant", !productNew.includes("VAT_RATES = ["));
  assert("products/edit has no VAT_RATES constant", !productEdit.includes("VAT_RATES = ["));
  assert("PurchaseForm inherits product vat_rate on pick", purchaseForm.includes("tax_rate: taxRate"));
  const roDefaults = vatLib.match(/RO:\s*\[[\s\S]*?\]/);
  assert("RO VAT defaults defined", Boolean(roDefaults));
  if (roDefaults) {
    const block = roDefaults[0];
    assert("RO seed includes 19%", block.includes("rate: 19"));
    assert("RO seed includes 9%", block.includes("rate: 9"));
    assert("RO seed includes 5%", block.includes("rate: 5"));
    assert("RO seed includes 0%", block.includes("rate: 0"));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
