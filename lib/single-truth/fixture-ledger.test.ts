import { describe, expect, it } from "vitest";
import { aggregateFixture } from "./fixture-ledger";

describe("fixture Dolce Nera - august", () => {
  it("numără bonul o dată și echilibrează TVA, numerarul, stocul și marja netă", () => {
    const result = aggregateFixture({
      openingCash: 100,
      openingStock: 1,
      lines: [
        { documentId: "bon-august-1", direction: 1, net: 19.82, vat: 2.18, gross: 22 },
        { documentId: "retur-august-1", direction: -1, net: -9.91, vat: -1.09, gross: -11 },
      ],
      payments: [{ method: "cash", amount: 22 }, { method: "cash", amount: -11 }],
      stock: [{ quantity: -0.036, unitCost: 100 }, { quantity: 0.018, unitCost: 100 }],
    });

    expect(result).toEqual({
      receiptCount: 1,
      vatDocumentCount: 1,
      net: 9.91,
      vat: 1.09,
      gross: 11,
      expectedCash: 111,
      closingStock: 0.982,
      cost: 1.8,
      netMargin: 8.11,
    });
  });
});
