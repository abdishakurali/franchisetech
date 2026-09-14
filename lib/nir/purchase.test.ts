import { describe, expect, it } from "vitest";
import { parsePurchaseLinesFromForm, nirLineValue, nirUnitCostForDisplay } from "./purchase";

describe("nirLineValue — the costing rule the whole document family follows", () => {
  it("registered buyer: value is net (VAT is reclaimed, not part of acquisition cost)", () => {
    expect(nirLineValue({ buyerVatRegistered: true, netAmount: 100, taxAmount: 19 })).toBe(100);
  });

  it("unregistered buyer: value is gross (VAT is not reclaimable, so it IS acquisition cost)", () => {
    expect(nirLineValue({ buyerVatRegistered: false, netAmount: 100, taxAmount: 19 })).toBe(119);
  });

  it("zero tax: registered and unregistered agree, trivially", () => {
    expect(nirLineValue({ buyerVatRegistered: true, netAmount: 100, taxAmount: 0 })).toBe(100);
    expect(nirLineValue({ buyerVatRegistered: false, netAmount: 100, taxAmount: 0 })).toBe(100);
  });
});

describe("nirUnitCostForDisplay", () => {
  it("registered buyer sees the net unit cost as-is", () => {
    expect(nirUnitCostForDisplay({ buyerVatRegistered: true, netUnitCost: 10, taxRatePct: 21 })).toBe(10);
  });

  it("unregistered buyer sees the unit cost grossed up by the tax rate", () => {
    expect(nirUnitCostForDisplay({ buyerVatRegistered: false, netUnitCost: 10, taxRatePct: 21 })).toBeCloseTo(12.1, 5);
  });

  it("unregistered buyer with a 0% line: gross-up is a no-op, not a divide-by-zero", () => {
    expect(nirUnitCostForDisplay({ buyerVatRegistered: false, netUnitCost: 10, taxRatePct: 0 })).toBe(10);
  });
});

function buildFormData(rows: Array<{
  product_id: string;
  quantity: string;
  received_quantity: string;
  unit_cost: string;
  tax_rate: string;
  unit_of_measure: string;
}>): FormData {
  const fd = new FormData();
  for (const row of rows) {
    fd.append("product_id", row.product_id);
    fd.append("quantity", row.quantity);
    fd.append("received_quantity", row.received_quantity);
    fd.append("unit_cost", row.unit_cost);
    fd.append("tax_rate", row.tax_rate);
    fd.append("unit_of_measure", row.unit_of_measure);
  }
  return fd;
}

describe("parsePurchaseLinesFromForm — received_quantity", () => {
  it("blank received_quantity parses to null, not 0 and not the invoiced quantity", () => {
    const fd = buildFormData([
      { product_id: "p1", quantity: "10", received_quantity: "", unit_cost: "2", tax_rate: "0", unit_of_measure: "each" },
    ]);
    const [line] = parsePurchaseLinesFromForm(fd);
    expect(line.quantity).toBe(10);
    expect(line.received_quantity).toBeNull();
  });

  it("an explicit received_quantity different from invoiced is preserved exactly", () => {
    const fd = buildFormData([
      { product_id: "p1", quantity: "10", received_quantity: "8", unit_cost: "2", tax_rate: "0", unit_of_measure: "each" },
    ]);
    const [line] = parsePurchaseLinesFromForm(fd);
    expect(line.quantity).toBe(10);
    expect(line.received_quantity).toBe(8);
  });

  it("an explicit received_quantity equal to invoiced is still recorded as a real value, not coerced to null", () => {
    const fd = buildFormData([
      { product_id: "p1", quantity: "10", received_quantity: "10", unit_cost: "2", tax_rate: "0", unit_of_measure: "each" },
    ]);
    const [line] = parsePurchaseLinesFromForm(fd);
    expect(line.received_quantity).toBe(10);
  });

  it("garbage received_quantity input falls back to null rather than NaN", () => {
    const fd = buildFormData([
      { product_id: "p1", quantity: "10", received_quantity: "not-a-number", unit_cost: "2", tax_rate: "0", unit_of_measure: "each" },
    ]);
    const [line] = parsePurchaseLinesFromForm(fd);
    expect(line.received_quantity).toBeNull();
  });

  it("multiple lines each parse their own received_quantity independently", () => {
    const fd = buildFormData([
      { product_id: "p1", quantity: "10", received_quantity: "8", unit_cost: "2", tax_rate: "0", unit_of_measure: "each" },
      { product_id: "p2", quantity: "5", received_quantity: "", unit_cost: "1", tax_rate: "0", unit_of_measure: "kg" },
    ]);
    const lines = parsePurchaseLinesFromForm(fd);
    expect(lines).toHaveLength(2);
    expect(lines[0].received_quantity).toBe(8);
    expect(lines[1].received_quantity).toBeNull();
  });
});
