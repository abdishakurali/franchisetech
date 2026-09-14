import { describe, expect, it } from "vitest";
import { parsePurchaseLinesFromForm } from "./purchase";

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
