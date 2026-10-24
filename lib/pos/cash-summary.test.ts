import { describe, expect, it } from "vitest";
import { applyCashMovementToSummary, reconcileCashSummary, type CashSummary } from "@/lib/pos/cash-summary";

const summary: CashSummary = {
  openingCash: 100,
  cashSales: 50,
  cardSales: 20,
  expectedCash: 150,
  txCount: 3,
  topProduct: "Cafea",
  cashInTotal: 0,
  cashOutTotal: 0,
  cashOperations: [],
};

describe("applyCashMovementToSummary", () => {
  it("updates expected cash and prepends a cash-in operation", () => {
    const next = applyCashMovementToSummary(summary, {
      id: "cash-1",
      movement_type: "cash_in",
      amount: 25,
      reason: "Fond suplimentar",
      performedAt: "2026-10-24T15:00:00.000Z",
    });

    expect(next.expectedCash).toBe(175);
    expect(next.cashInTotal).toBe(25);
    expect(next.cashOutTotal).toBe(0);
    expect(next.cashOperations[0]?.id).toBe("cash-1");
    expect(summary.expectedCash).toBe(150);
  });

  it("subtracts cash-out amounts while keeping displayed amounts positive", () => {
    const next = applyCashMovementToSummary(summary, {
      id: "cash-2",
      movement_type: "cash_out",
      amount: 30,
      reason: "Plată furnizor",
      performedAt: null,
    });

    expect(next.expectedCash).toBe(120);
    expect(next.cashOutTotal).toBe(30);
    expect(next.cashOperations[0]?.amount).toBe(30);
  });
});

describe("reconcileCashSummary", () => {
  it("keeps a confirmed local operation until the refreshed server summary includes it", () => {
    const operation = { id: "cash-1", movement_type: "cash_in" as const, amount: 25, reason: "Float", performedAt: null };
    expect(reconcileCashSummary(summary, [operation]).expectedCash).toBe(175);

    const serverCaughtUp = applyCashMovementToSummary(summary, operation);
    expect(reconcileCashSummary(serverCaughtUp, [operation]).expectedCash).toBe(175);
    expect(reconcileCashSummary(serverCaughtUp, [operation]).cashOperations).toHaveLength(1);
  });
});
