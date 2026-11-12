/**
 * Recovery for sales that were saved but never got their fiscal receipt
 * (incident 2026-11-12: the till reloaded between "sale saved" and "send the
 * receipt", so the sale stayed `api_pending` with no attempt).
 *
 * Pure rules only; the server actions live in app/actions/fiscal-recovery.ts.
 */

import type { BrowserFiscalItem } from "./browser";

/**
 * Statuses a receipt may be re-issued from.
 * - `api_pending`: the browser was told to print and never reported back.
 * - `failed`: the device answered with an error.
 * Not included on purpose:
 * - `ambiguous` / `timeout`: the receipt may have printed; re-issuing risks a duplicate.
 * - `pending`: written by completeSaleReturn only when the org was in FiscalNet
 *   mock mode (API mode), where the live path never sends a receipt at all.
 *   Re-issuing those would turn test-mode sales into real fiscal receipts.
 */
export const RECOVERABLE_FISCAL_STATUSES = ["api_pending", "failed"] as const;

/** The normal path (send + log) is bounded at ~25 s; 2 min leaves it room to finish. */
export const MISSING_RECEIPT_MIN_AGE_MS = 2 * 60 * 1000;
export const MISSING_RECEIPT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type MissingReceiptSale = {
  status: string | null;
  sold_at: string | null;
  fiscal_receipt_required: boolean | null;
  fiscal_receipt_status: string | null;
};

export type MissingReceiptAttempt = {
  status: string | null;
  mock_mode: boolean | null;
};

/** A real receipt exists. For a non-mock org a simulated (mock) receipt does not count. */
export function isSuccessfulAttempt(attempt: MissingReceiptAttempt, orgMockMode: boolean): boolean {
  if (orgMockMode) return attempt.status === "success" || attempt.status === "mock_success";
  return attempt.status === "success" && attempt.mock_mode !== true;
}

export type MissingReceiptVerdict =
  | { eligible: true }
  | { eligible: false; reason: "voided" | "not_required" | "status" | "too_recent" | "too_old" | "has_receipt" };

export function missingReceiptVerdict(
  sale: MissingReceiptSale,
  attempts: MissingReceiptAttempt[],
  opts: { orgMockMode: boolean; now: number },
): MissingReceiptVerdict {
  if (sale.status !== "completed") return { eligible: false, reason: "voided" };
  if (sale.fiscal_receipt_required !== true) return { eligible: false, reason: "not_required" };
  if (!(RECOVERABLE_FISCAL_STATUSES as readonly string[]).includes(sale.fiscal_receipt_status ?? "")) {
    return { eligible: false, reason: "status" };
  }
  const soldAt = sale.sold_at ? Date.parse(sale.sold_at) : NaN;
  if (!Number.isFinite(soldAt)) return { eligible: false, reason: "too_old" };
  if (opts.now - soldAt < MISSING_RECEIPT_MIN_AGE_MS) return { eligible: false, reason: "too_recent" };
  if (opts.now - soldAt > MISSING_RECEIPT_WINDOW_MS) return { eligible: false, reason: "too_old" };
  if (attempts.some((a) => isSuccessfulAttempt(a, opts.orgMockMode))) return { eligible: false, reason: "has_receipt" };
  return { eligible: true };
}

/**
 * The sale line → FiscalNet item mapping. completeSaleReturn uses this for
 * `res.items` (what the browser prints on a live sale), and the recovery
 * payload uses it on the saved lines, so both print the same receipt.
 */
export type FiscalSaleLine = {
  product_name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  applied_discount_pct: number;
  fiscalnet_vat_group?: number | null;
};

export function fiscalItemsFromSaleLines(lines: FiscalSaleLine[]): Array<BrowserFiscalItem & { fiscalNetGroup: number | null }> {
  return lines.map((i) => ({
    productName: i.product_name,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    vatRate: i.vat_rate,
    fiscalNetGroup: i.fiscalnet_vat_group ?? null,
    ...(i.applied_discount_pct > 0 ? { discountPercent: i.applied_discount_pct } : {}),
  }));
}

/**
 * VAT rate → FiscalNet group, built the same way the POS page builds the
 * `vatRateGroupMap` it puts on every cart line (app/app/pos/page.tsx).
 */
export function vatRateGroupMapFrom(
  rates: Array<{ rate: number; fiscalnet_vat_group?: number | null }>,
): Record<number, number> {
  return Object.fromEntries(
    rates
      .filter((r) => r.fiscalnet_vat_group != null)
      .map((r) => [r.rate, r.fiscalnet_vat_group as number]),
  );
}

/** Saved pos_transaction_items row → the cart line shape completeSaleReturn mapped from. */
export function saleLineFromStoredItem(
  row: { product_name: unknown; quantity: unknown; unit_price: unknown; vat_rate: unknown; discount_pct: unknown },
  vatRateGroupMap: Record<number, number>,
): FiscalSaleLine {
  const vatRate = Number(row.vat_rate ?? 0);
  return {
    product_name: String(row.product_name ?? ""),
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    vat_rate: vatRate,
    // post_pos_document stores applied_discount_pct as discount_pct (0 when none).
    applied_discount_pct: Number(row.discount_pct ?? 0),
    fiscalnet_vat_group: vatRateGroupMap[vatRate] ?? null,
  };
}
