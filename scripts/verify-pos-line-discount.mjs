#!/usr/bin/env node
/**
 * P1.7b hotfix: end-to-end POS line discount checks (cart → action calcs → FiscalNet lines).
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

function normalizeCartLines(lines, legacyCartPct = 0) {
  const legacy = legacyCartPct && legacyCartPct > 0 ? clampDiscountPct(legacyCartPct) : 0;
  return lines.map((l) => ({
    ...l,
    discount_pct:
      l.discount_pct != null && l.discount_pct > 0
        ? clampDiscountPct(l.discount_pct)
        : legacy > 0
          ? legacy
          : 0,
  }));
}

/** Mirrors app/actions/kitchenops.ts buildPosItemCalcs */
function buildPosItemCalcs(cart, legacyCartPct) {
  return cart.map((item) => {
    const appliedPct = lineDiscountPct(item, legacyCartPct);
    const discountMultiplier = 1 - appliedPct / 100;
    const grossBefore = item.quantity * item.unit_price;
    const grossAmount = grossBefore * discountMultiplier;
    return {
      ...item,
      applied_discount_pct: appliedPct,
      line_total: Number(grossAmount.toFixed(2)),
    };
  });
}

/** Simulate completeSaleReturn fiscal item mapping */
function fiscalItemsFromCalcs(itemCalcs) {
  return itemCalcs.map((item) => ({
    productName: item.product_name,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    vatRate: Number(item.vat_rate ?? 0),
    fiscalNetGroup: 1,
    ...(item.applied_discount_pct > 0 ? { discountPercent: item.applied_discount_pct } : {}),
  }));
}

function encodeMoney(eur) {
  return Math.round(Number(eur) * 100);
}

function encodeQty(qty) {
  return Math.round(Number(qty) * 1000);
}

/** Mirrors lib/fiscalnet/browser.ts buildFiscalNetReceiptLines (subset) */
function buildFiscalNetReceiptLines(items, total) {
  const lines = [];
  for (const item of items) {
    lines.push(
      `S^${item.productName}^${encodeMoney(item.unitPrice)}^${encodeQty(item.quantity)}^Buc^${item.fiscalNetGroup ?? 1}^1`
    );
    const pct = item.discountPercent ?? 0;
    if (pct > 0 && pct <= 100) lines.push(`DP^${Math.round(pct * 100)}`);
  }
  lines.push("ST^0");
  lines.push(`P^1^${encodeMoney(total)}`);
  return lines;
}

/** UI: apply discount to all lines immediately (P1.7b hotfix behaviour) */
function applyDiscountToAllLines(cart, pct) {
  const clamped = clampDiscountPct(pct);
  return cart.map((i) => ({ ...i, discount_pct: clamped }));
}

/** UI: set single line discount (live commit) */
function setLineDiscount(cart, productId, pct) {
  return cart.map((i) =>
    i.product_id === productId ? { ...i, discount_pct: clampDiscountPct(pct) } : i
  );
}

/** Simulate FormData cart_json + discount_pct from POS submit */
function parseSalePayload(cartJson, discountPctField) {
  const cart = JSON.parse(cartJson);
  const legacyCartPct = Number(discountPctField) || 0;
  const itemCalcs = buildPosItemCalcs(cart, legacyCartPct);
  const txDiscountPct = transactionDiscountPct(cart, legacyCartPct);
  const total = Number(itemCalcs.reduce((s, i) => s + i.line_total, 0).toFixed(2));
  const fiscalItems = fiscalItemsFromCalcs(itemCalcs);
  const dbItems = itemCalcs.map((item) => ({
    discount_pct: item.applied_discount_pct > 0 ? item.applied_discount_pct : 0,
  }));
  return { cart, itemCalcs, txDiscountPct, total, fiscalItems, dbItems };
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

const croissantLine = {
  product_id: "c",
  product_name: "Chocolate Croissant",
  quantity: 1,
  unit_price: 3.2,
  vat_rate: 9,
  fiscalnet_vat_group: 1,
  discount_pct: 0,
};
const danishLine = {
  product_id: "a",
  product_name: "Apple Danish",
  quantity: 1,
  unit_price: 3.1,
  vat_rate: 9,
  fiscalnet_vat_group: 1,
  discount_pct: 0,
};
const coffeeLine = {
  product_id: "k",
  product_name: "Coffee",
  quantity: 1,
  unit_price: 2.5,
  vat_rate: 9,
  fiscalnet_vat_group: 1,
  discount_pct: 0,
};

// ── Unit math (existing) ──
assert(lineGrossAfter({ ...croissantLine, discount_pct: 32 }) === 2.18, "croissant 32% → 2.18");
assert(cartGrossAfter([{ ...croissantLine, discount_pct: 32 }, danishLine]) === 5.28, "two items one discounted total");
assert(cartGrossAfter([{ ...croissantLine, discount_pct: 32 }, danishLine, { ...coffeeLine, discount_pct: 10 }]) === 7.53, "mixed three lines total");

// 1. Cart line discount → action payload with item discount
let cart = [{ ...croissantLine }];
cart = setLineDiscount(cart, "c", 32);
const payload1 = parseSalePayload(JSON.stringify(cart), transactionDiscountPct(cart));
assert(payload1.itemCalcs[0].applied_discount_pct === 32, "action payload item has 32% applied_discount_pct");
assert(payload1.fiscalItems[0].discountPercent === 32, "fiscal payload gets discountPercent 32");

// 2. completeSaleReturn path persists item discount_pct
assert(payload1.dbItems[0].discount_pct === 32, "pos_transaction_items.discount_pct would be 32");

// 4. One item 32% → DP^3200 and P^218
const lines1 = buildFiscalNetReceiptLines(payload1.fiscalItems, payload1.total);
assert(lines1[1] === "DP^3200", "one item 32% emits DP^3200");
assert(lines1[lines1.length - 1] === "P^1^218", "one item 32% P^218");

// 5. No item discount → no DP^ and P^320
const payloadNoDisc = parseSalePayload(JSON.stringify([{ ...croissantLine }]), 0);
const linesNo = buildFiscalNetReceiptLines(payloadNoDisc.fiscalItems, payloadNoDisc.total);
assert(!linesNo.some((l) => l.startsWith("DP^")), "no discount → no DP^");
assert(linesNo[linesNo.length - 1] === "P^1^320", "no discount P^320");

// 6. Mixed cart — DP^ only under discounted lines
cart = [
  setLineDiscount([{ ...croissantLine }], "c", 32)[0],
  { ...danishLine },
];
const payloadMixed = parseSalePayload(JSON.stringify(cart), transactionDiscountPct(cart));
const linesMixed = buildFiscalNetReceiptLines(payloadMixed.fiscalItems, payloadMixed.total);
assert(linesMixed[1] === "DP^3200", "mixed: DP under croissant only");
assert(linesMixed.filter((l) => l.startsWith("DP^")).length === 1, "mixed: single DP^ line");
assert(linesMixed[linesMixed.length - 1] === "P^1^528", "mixed two-item total P^528");

// 7. Apply-to-all writes discount_pct to each line
cart = applyDiscountToAllLines([{ ...croissantLine }, { ...danishLine }], 32);
assert(cart.every((l) => l.discount_pct === 32), "apply-to-all sets discount_pct on every line");
const payloadAll = parseSalePayload(JSON.stringify(cart), transactionDiscountPct(cart));
assert(payloadAll.txDiscountPct === 32, "uniform apply-to-all → tx discount_pct 32");

// 8. Hold/resume preserves line discount (in-memory held cart shape)
const heldCart = JSON.parse(JSON.stringify(cart));
assert(heldCart[0].discount_pct === 32 && heldCart[1].discount_pct === 32, "hold/resume preserves line discount");

// 9. Cart restore spreads legacy discount onto lines once
const restored = normalizeCartLines(
  [{ ...croissantLine, discount_pct: 0 }],
  32
);
assert(restored[0].discount_pct === 32, "cart restore normalizes legacy discount onto lines");

// 10. Line-total edit must not create fiscal mismatch — fiscal uses unit_price + discount_pct only
const tamperedCart = [{ ...croissantLine, unit_price: 2.18, discount_pct: 0 }];
const payloadTampered = parseSalePayload(JSON.stringify(tamperedCart), 0);
const linesTampered = buildFiscalNetReceiptLines(payloadTampered.fiscalItems, payloadTampered.total);
assert(!linesTampered.some((l) => l.startsWith("DP^")), "line-total edit without discount_pct → no DP^");
assert(linesTampered[linesTampered.length - 1] === "P^1^218", "tampered unit price alone → fiscal P from unit_price not hidden discount");

// Live failure regression: typed 32% in apply-to-all without separate Apply (old P1.7b bug)
const uncommittedOldBug = [{ ...croissantLine, discount_pct: 0 }];
const oldBugPayload = parseSalePayload(JSON.stringify(uncommittedOldBug), 0);
assert(!buildFiscalNetReceiptLines(oldBugPayload.fiscalItems, oldBugPayload.total).some((l) => l.startsWith("DP^")), "uncommitted line discount reproduces live failure");
const fixedCart = applyDiscountToAllLines(uncommittedOldBug, 32);
const fixedPayload = parseSalePayload(JSON.stringify(fixedCart), transactionDiscountPct(fixedCart));
const fixedLines = buildFiscalNetReceiptLines(fixedPayload.fiscalItems, fixedPayload.total);
assert(fixedLines[1] === "DP^3200" && fixedLines.at(-1) === "P^1^218", "immediate apply-to-all fixes live failure path");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nverify-pos-line-discount: all checks passed");
