import { describe, expect, it } from "vitest";
import { computeSaleTotals, resolveSalePayments } from "@/lib/pos-sale-math";

describe("computeSaleTotals", () => {
  const items = [
    { net_amount: 10, vat_amount: 1.9, gross_amount: 11.9, discount_amount: 0 },
    { net_amount: 5, vat_amount: 0.95, gross_amount: 5.95, discount_amount: 0 },
  ];

  it("sums line totals and folds in the tip when tips are enabled", () => {
    const totals = computeSaleTotals(items, { tipsEnabled: true, tipAmountRaw: 2 });
    expect(totals.subtotalNet).toBe(15);
    expect(totals.taxTotal).toBeCloseTo(2.85, 8);
    expect(totals.totalGross).toBe(17.85);
    expect(totals.discountTotal).toBe(0);
    expect(totals.tipAmount).toBe(2);
    expect(totals.saleTotal).toBe(19.85);
  });

  it("ignores the tip entirely when tips are disabled for the org", () => {
    const totals = computeSaleTotals(items, { tipsEnabled: false, tipAmountRaw: 2 });
    expect(totals.tipAmount).toBe(0);
    expect(totals.saleTotal).toBe(17.85);
  });

  it("clamps a negative tip to zero", () => {
    const totals = computeSaleTotals(items, { tipsEnabled: true, tipAmountRaw: -5 });
    expect(totals.tipAmount).toBe(0);
  });
});

describe("resolveSalePayments", () => {
  it("accepts an exact single cash payment with no change", () => {
    const result = resolveSalePayments({
      paymentRows: [{ method: "cash", payment_method_id: "pm1", amount: 25 }],
      saleTotal: 25,
      splitEnabled: false,
      paymentType: "cash",
      cashReceivedStored: 25,
    });
    expect(result).toEqual({
      ok: true,
      result: {
        paidTotal: 25,
        hasCashPayment: true,
        cashOverpay: 0,
        canonicalPayments: [
          {
            method: "cash",
            payment_method_id: "pm1",
            amount: 25,
            sequence: 0,
            metadata: { cash_received: 25, change_due: 0 },
          },
        ],
      },
    });
  });

  it("computes change for a single cash payment above the total", () => {
    const result = resolveSalePayments({
      paymentRows: [{ method: "cash", payment_method_id: "pm1", amount: 25 }],
      saleTotal: 25,
      splitEnabled: false,
      paymentType: "cash",
      cashReceivedStored: 30,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.canonicalPayments[0].metadata).toEqual({ cash_received: 30, change_due: 5 });
  });

  it("rejects a single cash payment that doesn't cover the total", () => {
    const result = resolveSalePayments({
      paymentRows: [{ method: "cash", payment_method_id: "pm1", amount: 25 }],
      saleTotal: 25,
      splitEnabled: false,
      paymentType: "cash",
      cashReceivedStored: 20,
    });
    expect(result).toEqual({
      ok: false,
      error: "Cash received is less than the total due.",
      code: "cash_insufficient",
    });
  });

  it("rejects split payments that don't cover the total", () => {
    const result = resolveSalePayments({
      paymentRows: [
        { method: "card", payment_method_id: "pmCard", amount: 10 },
        { method: "cash", payment_method_id: "pmCash", amount: 5 },
      ],
      saleTotal: 20,
      splitEnabled: true,
      paymentType: "other",
      cashReceivedStored: null,
    });
    expect(result).toEqual({
      ok: false,
      error: "Payment total is less than the sale total.",
      code: "payment_mismatch",
    });
  });

  it("rejects an overpaid split with no cash to explain the excess", () => {
    const result = resolveSalePayments({
      paymentRows: [{ method: "card", payment_method_id: "pmCard", amount: 25 }],
      saleTotal: 20,
      splitEnabled: true,
      paymentType: "other",
      cashReceivedStored: null,
    });
    expect(result).toEqual({
      ok: false,
      error: "Payment total is higher than the sale total.",
      code: "payment_mismatch",
    });
  });

  it("allows a split overpay when cash absorbs the change, distributed across cash rows in order", () => {
    const result = resolveSalePayments({
      paymentRows: [
        { method: "card", payment_method_id: "pmCard", amount: 15 },
        { method: "cash", payment_method_id: "pmCash", amount: 10 },
      ],
      saleTotal: 20,
      splitEnabled: true,
      paymentType: "other",
      cashReceivedStored: null,
    });
    expect(result).toEqual({
      ok: true,
      result: {
        paidTotal: 25,
        hasCashPayment: true,
        cashOverpay: 5,
        canonicalPayments: [
          { method: "card", payment_method_id: "pmCard", amount: 15, sequence: 0, metadata: { split: true } },
          {
            method: "cash",
            payment_method_id: "pmCash",
            amount: 5,
            sequence: 1,
            metadata: { split: true, cash_received: 10, change_due: 5 },
          },
        ],
      },
    });
  });
});
