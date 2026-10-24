import { describe, expect, it } from "vitest";
import { filterPurchaseOptions, purchaseLineForSelectedProduct, purchaseLineTotalsFromDraft } from "@/lib/nir/form-performance";

describe("filterPurchaseOptions", () => {
  const options = [
    { id: "1", name: "Zahăr brun" },
    { id: "2", name: "Cafea boabe" },
    { id: "3", name: "Lapte" },
  ];

  it("matches Romanian names when the cashier omits diacritics", () => {
    expect(filterPurchaseOptions(options, "zahar", 12)).toEqual([{ id: "1", name: "Zahăr brun" }]);
  });

  it("limits large option lists before rendering", () => {
    expect(filterPurchaseOptions(options, "", 2)).toHaveLength(2);
  });
});

describe("purchaseLineTotalsFromDraft", () => {
  it("computes NIR totals locally without a server round-trip", () => {
    expect(purchaseLineTotalsFromDraft([
      { quantity: "2", unit_cost: "10", tax_rate: "19" },
      { quantity: "1", unit_cost: "5", tax_rate: "9" },
    ])).toEqual({ subtotal: 25, tax: 4.25, total: 29.25 });
  });
});

describe("purchaseLineForSelectedProduct", () => {
  it("inherits the product unit and VAT rate in the NIR row", () => {
    expect(purchaseLineForSelectedProduct(
      { product_id: "", quantity: "", received_quantity: "", unit_cost: "", tax_rate: "21", unit_of_measure: "each" },
      { id: "sugar", unit_of_measure: "kg", vat_rate: 11 },
      ["each", "kg"],
      "each",
    )).toEqual(expect.objectContaining({ product_id: "sugar", unit_of_measure: "kg", tax_rate: "11" }));
  });
});
