import { describe, expect, it } from "vitest";
import { mergeStockPageProducts, postedPurchaseProductIds } from "./stock-page-products";

const p = (id: string, name: string, qty: number | null = 0) => ({ id, name, current_stock_qty: qty });

describe("mergeStockPageProducts", () => {
  const tracked = [p("milk", "Lapte", 4), p("coffee", "Cafea", 0.36)];

  it("a purchased item that is neither stock-tracked nor an ingredient is listed (marked untracked)", () => {
    const rows = mergeStockPageProducts(tracked, [p("syrup", "Sirop vanilie", 0)], { purchasedIds: ["syrup"], movedIds: [] });
    expect(rows.map((r) => r.id)).toEqual(["coffee", "milk", "syrup"]);
    expect(rows.find((r) => r.id === "syrup")!.untracked).toBe(true);
    expect(rows.find((r) => r.id === "milk")!.untracked).toBeUndefined();
  });

  it("an untracked item with stock movements or non-zero stock is listed", () => {
    const rows = mergeStockPageProducts(
      tracked,
      [p("cups", "Pahare", 0), p("lids", "Capace", 120), p("neg", "Negativ", -2)],
      { purchasedIds: [], movedIds: ["cups"] },
    );
    expect(rows.map((r) => r.id).sort()).toEqual(["coffee", "cups", "lids", "milk", "neg"]);
  });

  it("an untracked item with no stock evidence stays off the page", () => {
    const rows = mergeStockPageProducts(tracked, [p("latte", "Latte", 0), p("tea", "Ceai", null)], { purchasedIds: [], movedIds: [] });
    expect(rows).toBe(tracked);
  });

  it("never duplicates a product already listed", () => {
    const rows = mergeStockPageProducts(tracked, [p("milk", "Lapte", 4)], { purchasedIds: ["milk"], movedIds: ["milk"] });
    expect(rows.filter((r) => r.id === "milk")).toHaveLength(1);
  });
});

describe("postedPurchaseProductIds", () => {
  it("keeps products on posted or received purchases only", () => {
    const ids = postedPurchaseProductIds(
      [
        { product_id: "a", purchase_id: "p1" },
        { product_id: "b", purchase_id: "p2" },
        { product_id: "c", purchase_id: "p3" },
        { product_id: null, purchase_id: "p1" },
      ],
      [
        { id: "p1", status: "posted" },
        { id: "p2", status: "draft" },
        { id: "p3", status: "received" },
      ],
    );
    expect([...ids].sort()).toEqual(["a", "c"]);
  });
});
