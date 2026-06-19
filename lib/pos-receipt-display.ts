/** Receipt / history display helpers for stored POS sale rows (post-checkout). */

import { clampDiscountPct } from "@/lib/pos-line-discount";

export type StoredReceiptItem = {
  quantity: number | string;
  unit_price: number | string;
  line_total?: number | string | null;
  gross_amount?: number | string | null;
  discount_pct?: number | string | null;
  discount_amount?: number | string | null;
  vat_rate?: number | string | null;
  net_amount?: number | string | null;
  vat_amount?: number | string | null;
};

export type StoredReceiptTx = {
  subtotal_gross_before_discount?: number | string | null;
  discount_total?: number | string | null;
  total?: number | string | null;
  total_gross?: number | string | null;
  subtotal_net?: number | string | null;
  tax_total?: number | string | null;
};

export function lineGrossBeforeStored(item: StoredReceiptItem): number {
  return Number((Number(item.quantity ?? 0) * Number(item.unit_price ?? 0)).toFixed(2));
}

export function lineGrossAfterStored(item: StoredReceiptItem): number {
  return Number(Number(item.line_total ?? item.gross_amount ?? lineGrossBeforeStored(item)).toFixed(2));
}

/** Resolve line discount % from stored columns (prefers discount_pct). */
export function lineDiscountPctStored(item: StoredReceiptItem): number {
  const pct = Number(item.discount_pct ?? 0);
  if (pct > 0) return clampDiscountPct(pct);
  const before = lineGrossBeforeStored(item);
  const discAmt = Number(item.discount_amount ?? 0);
  if (discAmt > 0 && before > 0) return clampDiscountPct((discAmt / before) * 100);
  const after = lineGrossAfterStored(item);
  if (before > after + 0.001) return clampDiscountPct(((before - after) / before) * 100);
  return 0;
}

export function lineHasDiscount(item: StoredReceiptItem): boolean {
  return lineDiscountPctStored(item) > 0 || Number(item.discount_amount ?? 0) > 0.001;
}

export function receiptDiscountSummary(items: StoredReceiptItem[], tx: StoredReceiptTx = {}) {
  const computedBefore = Number(items.reduce((s, i) => s + lineGrossBeforeStored(i), 0).toFixed(2));
  const computedAfter = Number(items.reduce((s, i) => s + lineGrossAfterStored(i), 0).toFixed(2));
  const storedBefore = Number(tx.subtotal_gross_before_discount ?? 0);
  const storedDiscount = Number(tx.discount_total ?? 0);
  const subtotalBefore = storedBefore > 0 ? storedBefore : computedBefore;
  const totalAfter = Number(tx.total_gross ?? tx.total ?? computedAfter);
  const discountTotal =
    storedDiscount > 0
      ? storedDiscount
      : Number(Math.max(0, subtotalBefore - totalAfter).toFixed(2));
  const hasDiscount = discountTotal > 0.001 || items.some(lineHasDiscount);
  return { subtotalBefore, discountTotal, totalAfter, hasDiscount };
}
