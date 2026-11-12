import { describe, expect, it } from "vitest";
import {
  fiscalItemsFromSaleLines,
  isSuccessfulAttempt,
  missingReceiptVerdict,
  saleLineFromStoredItem,
  vatRateGroupMapFrom,
} from "./missing-receipt";

const NOW = Date.parse("2026-11-12T15:00:00Z");
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();
const sale = (over: Partial<Parameters<typeof missingReceiptVerdict>[0]> = {}) => ({
  status: "completed",
  sold_at: minutesAgo(30),
  fiscal_receipt_required: true,
  fiscal_receipt_status: "api_pending",
  ...over,
});
const live = { orgMockMode: false, now: NOW };

describe("missingReceiptVerdict", () => {
  it("lists an api_pending sale with no attempt, and a failed one with only a failed attempt", () => {
    expect(missingReceiptVerdict(sale(), [], live)).toEqual({ eligible: true });
    expect(
      missingReceiptVerdict(sale({ fiscal_receipt_status: "failed" }), [{ status: "failed", mock_mode: false }], live),
    ).toEqual({ eligible: true });
  });

  it("refuses voided and not-required sales", () => {
    expect(missingReceiptVerdict(sale({ status: "voided" }), [], live)).toMatchObject({ reason: "voided" });
    expect(missingReceiptVerdict(sale({ fiscal_receipt_required: false }), [], live)).toMatchObject({ reason: "not_required" });
    expect(missingReceiptVerdict(sale({ fiscal_receipt_required: null }), [], live)).toMatchObject({ reason: "not_required" });
  });

  it("refuses statuses where a receipt may exist or was never due (ambiguous, timeout, success, mock-era pending)", () => {
    for (const s of ["ambiguous", "timeout", "success", "pending", "not_required", null]) {
      expect(missingReceiptVerdict(sale({ fiscal_receipt_status: s }), [], live)).toMatchObject({ reason: "status" });
    }
  });

  it("leaves sales younger than 2 minutes to the normal path, and drops ones older than 7 days", () => {
    expect(missingReceiptVerdict(sale({ sold_at: minutesAgo(1) }), [], live)).toMatchObject({ reason: "too_recent" });
    expect(missingReceiptVerdict(sale({ sold_at: minutesAgo(2.1) }), [], live)).toEqual({ eligible: true });
    expect(missingReceiptVerdict(sale({ sold_at: minutesAgo(7 * 24 * 60 + 1) }), [], live)).toMatchObject({ reason: "too_old" });
    expect(missingReceiptVerdict(sale({ sold_at: null }), [], live)).toMatchObject({ reason: "too_old" });
  });

  it("refuses when a real success attempt exists", () => {
    expect(
      missingReceiptVerdict(sale({ fiscal_receipt_status: "failed" }), [{ status: "success", mock_mode: false }], live),
    ).toMatchObject({ reason: "has_receipt" });
  });

  it("ignores mock attempts for a live org, counts them for a mock org", () => {
    const mockAttempts = [{ status: "mock_success", mock_mode: true }, { status: "success", mock_mode: true }];
    expect(missingReceiptVerdict(sale(), mockAttempts, live)).toEqual({ eligible: true });
    expect(missingReceiptVerdict(sale(), mockAttempts, { orgMockMode: true, now: NOW })).toMatchObject({ reason: "has_receipt" });
  });
});

describe("isSuccessfulAttempt", () => {
  it("only a real success counts for a live org", () => {
    expect(isSuccessfulAttempt({ status: "success", mock_mode: false }, false)).toBe(true);
    expect(isSuccessfulAttempt({ status: "success", mock_mode: null }, false)).toBe(true);
    expect(isSuccessfulAttempt({ status: "success", mock_mode: true }, false)).toBe(false);
    expect(isSuccessfulAttempt({ status: "mock_success", mock_mode: true }, false)).toBe(false);
    expect(isSuccessfulAttempt({ status: "ambiguous", mock_mode: false }, false)).toBe(false);
  });
});

describe("fiscalItemsFromSaleLines", () => {
  it("is the mapping completeSaleReturn used inline before (byte-for-byte)", () => {
    const itemCalcs = [
      { product_name: "Cappuccino", quantity: 2, unit_price: 14, vat_rate: 11, applied_discount_pct: 10, fiscalnet_vat_group: 2 },
      { product_name: "Garanție SGR", quantity: 1, unit_price: 0.5, vat_rate: 0, applied_discount_pct: 0, fiscalnet_vat_group: null },
      { product_name: "Apă", quantity: 1, unit_price: 6, vat_rate: 21, applied_discount_pct: 0 },
    ];
    const previousInline = itemCalcs.map((i) => ({
      productName: i.product_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      vatRate: i.vat_rate,
      fiscalNetGroup: i.fiscalnet_vat_group ?? null,
      ...(i.applied_discount_pct > 0 ? { discountPercent: i.applied_discount_pct } : {}),
    }));
    expect(fiscalItemsFromSaleLines(itemCalcs)).toStrictEqual(previousInline);
  });

  it("rebuilds the same items from saved rows (numeric strings, discount_pct, VAT group from vat_rates)", () => {
    const groupMap = vatRateGroupMapFrom([
      { rate: 11, fiscalnet_vat_group: 2 },
      { rate: 21, fiscalnet_vat_group: 1 },
      { rate: 9, fiscalnet_vat_group: null },
    ]);
    expect(groupMap).toEqual({ 11: 2, 21: 1 });
    const stored = [
      { product_name: "Cappuccino", quantity: "2.000000", unit_price: "14.00", vat_rate: "11", discount_pct: "10.0000" },
      { product_name: "Apă", quantity: "1.000000", unit_price: "6.00", vat_rate: "21", discount_pct: "0.0000" },
      { product_name: "Ceai", quantity: "1", unit_price: "8.00", vat_rate: "9", discount_pct: null },
    ];
    expect(fiscalItemsFromSaleLines(stored.map((r) => saleLineFromStoredItem(r, groupMap)))).toStrictEqual([
      { productName: "Cappuccino", quantity: 2, unitPrice: 14, vatRate: 11, fiscalNetGroup: 2, discountPercent: 10 },
      { productName: "Apă", quantity: 1, unitPrice: 6, vatRate: 21, fiscalNetGroup: 1 },
      { productName: "Ceai", quantity: 1, unitPrice: 8, vatRate: 9, fiscalNetGroup: null },
    ]);
  });
});
