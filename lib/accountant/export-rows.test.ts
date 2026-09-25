import { describe, expect, it } from "vitest";
import { accountantReadinessIssues, amountPerUnit } from "./export-rows";

describe("accountant export rows", () => {
  it("derives the unit selling price for sales and returns", () => {
    expect(amountPerUnit(25, 2)).toBe(12.5);
    expect(amountPerUnit(-25, -2)).toBe(12.5);
  });

  it("lists only material handoff gaps", () => {
    expect(accountantReadinessIssues({ identityMissing: false, productsWithoutSalePrice: 2, purchasesWithoutDocument: 0, purchaseLinesWithoutCost: 3, stockWithoutCost: 0, cashDiscrepancies: 1 })).toEqual([
      { label: "Produse fără preț de vânzare", count: 2 },
      { label: "Linii de achiziție fără preț furnizor", count: 3 },
      { label: "Închideri cu diferență de numerar", count: 1 },
    ]);
  });
});
