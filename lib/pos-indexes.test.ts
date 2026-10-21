import { describe, expect, it } from "vitest";
import { indexCartQuantities, indexProducts } from "@/lib/pos-indexes";

describe("POS indexes", () => {
  it("indexes products and cart quantities without repeated array searches", () => {
    const coffee = { id: "coffee", has_sgr: false };
    const water = { id: "water", has_sgr: true };

    expect(indexProducts([coffee, water]).get("water")).toBe(water);
    expect(indexCartQuantities([
      { product_id: "coffee", quantity: 2 },
      { product_id: "water", quantity: 3 },
    ])).toEqual(new Map([["coffee", 2], ["water", 3]]));
  });
});
