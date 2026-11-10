import { describe, expect, it } from "vitest";
import { buildStockEffectRows, rowsMissingMovement } from "./stock-effect";

describe("buildStockEffectRows", () => {
  const products = [
    { id: "coffee", name: "Cafea boabe", current_stock_qty: 0.36, unit_of_measure: "kg" },
    { id: "milk", name: "Lapte", current_stock_qty: "12", unit_of_measure: "litre" },
  ];

  it("shows what this purchase added and the stock now, in the product's unit", () => {
    const rows = buildStockEffectRows(
      [
        { product_id: "coffee", product_name: "Cafea", unit_of_measure: "kg" },
        { product_id: "milk", product_name: "Lapte", unit_of_measure: "litre" },
      ],
      [
        { product_id: "coffee", quantity_change: 1 },
        { product_id: "milk", quantity_change: "10" },
      ],
      products,
    );
    expect(rows).toEqual([
      { productId: "coffee", name: "Cafea boabe", productUnit: "kg", lineUnits: ["kg"], added: 1, now: 0.36 },
      { productId: "milk", name: "Lapte", productUnit: "litre", lineUnits: ["litre"], added: 10, now: 12 },
    ]);
  });

  it("the -0.64 kg + 1 kg case: added 1, now 0.36 (both visible, nothing hidden)", () => {
    const [row] = buildStockEffectRows([{ product_id: "coffee" }], [{ product_id: "coffee", quantity_change: 1 }], products);
    expect(row.added).toBe(1);
    expect(row.now).toBe(0.36);
  });

  it("two lines of the same product become one row with the summed movement", () => {
    const rows = buildStockEffectRows(
      [
        { product_id: "milk", unit_of_measure: "litre" },
        { product_id: "milk", unit_of_measure: "bottle" },
      ],
      [{ product_id: "milk", quantity_change: 10 }],
      products,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].lineUnits).toEqual(["litre", "bottle"]);
    expect(rows[0].added).toBe(10);
  });

  it("a line with no movement is flagged; an unknown product has now = null", () => {
    const rows = buildStockEffectRows(
      [{ product_id: "coffee" }, { product_id: "gone", product_name: "Old item" }],
      [{ product_id: "coffee", quantity_change: 1 }],
      products,
    );
    expect(rows[1]).toMatchObject({ name: "Old item", added: null, now: null, productUnit: "each" });
    expect(rowsMissingMovement(rows).map((r) => r.productId)).toEqual(["gone"]);
  });

  it("ignores lines without a product and movements of other products", () => {
    const rows = buildStockEffectRows(
      [{ product_id: null }, { product_id: "milk" }],
      [{ product_id: "coffee", quantity_change: 5 }, { product_id: null, quantity_change: 3 }],
      products,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].added).toBeNull();
  });
});
