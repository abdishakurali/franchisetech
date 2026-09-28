import { describe, expect, it } from "vitest";
import { buildCashLedger } from "./cash-ledger";

describe("buildCashLedger", () => {
  it("combines cash sales and supported cash movements chronologically", () => {
    const rows = buildCashLedger(100, [{ performed_at: "2026-09-01T12:00:00Z", movement_type: "withdrawal", amount: -20, reason: "Plată furnizor" }], [{ sold_at: "2026-09-01T10:00:00Z", transaction_number: "B1", total: 50, status: "completed", payment_methods: { type: "cash" } }]);
    expect(rows.map((row) => row.balance)).toEqual([150, 130]);
  });

  it("excludes card and voided sales", () => {
    expect(buildCashLedger(0, [], [{ sold_at: "2026-09-01T10:00:00Z", transaction_number: "B1", total: 50, status: "completed", payment_methods: { type: "card" } }])).toEqual([]);
  });
});
