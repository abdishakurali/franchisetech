import { describe, expect, it } from "vitest";
import { aggregatePayments } from "./fetch";

describe("aggregatePayments", () => {
  it("returns all zeros for no payments", () => {
    expect(aggregatePayments([])).toEqual({ cashTotal: 0, cardTotal: 0, onlineTotal: 0, otherTotal: 0 });
  });

  it("sums a single-method sale into the right bucket", () => {
    expect(aggregatePayments([{ method: "cash", amount: 42.5 }])).toEqual({
      cashTotal: 42.5, cardTotal: 0, onlineTotal: 0, otherTotal: 0,
    });
  });

  it("splits a cash+card sale across both buckets, not into a single one", () => {
    // The bug this fixes: a split-payment sale used to be attributed entirely
    // to whichever single payment_methods FK the transaction row happened to
    // carry. Real split data is two sale_payments rows for one sale — both
    // must land in their own bucket.
    const result = aggregatePayments([
      { method: "cash", amount: 20 },
      { method: "card", amount: 22.5 },
    ]);
    expect(result).toEqual({ cashTotal: 20, cardTotal: 22.5, onlineTotal: 0, otherTotal: 0 });
    expect(result.cashTotal + result.cardTotal).toBe(42.5);
  });

  it("buckets an unrecognized method as other rather than dropping it", () => {
    const result = aggregatePayments([{ method: "voucher", amount: 15 }]);
    expect(result.otherTotal).toBe(15);
    expect(result.cashTotal + result.cardTotal + result.onlineTotal).toBe(0);
  });

  it("aggregates across many sales, not just one", () => {
    const result = aggregatePayments([
      { method: "cash", amount: 10 },
      { method: "cash", amount: 5 },
      { method: "card", amount: 30 },
      { method: "online", amount: 12 },
    ]);
    expect(result).toEqual({ cashTotal: 15, cardTotal: 30, onlineTotal: 12, otherTotal: 0 });
  });

  it("treats a null/missing amount as 0 rather than NaN", () => {
    const result = aggregatePayments([{ method: "cash", amount: null }]);
    expect(result.cashTotal).toBe(0);
  });
});
