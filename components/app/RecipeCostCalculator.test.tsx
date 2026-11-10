// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

vi.mock("@/app/actions/kitchenops", () => ({
  addRecipeFromProducts: vi.fn(),
  createIngredientInline: vi.fn(),
}));

const { RecipeCostCalculator } = await import("@/components/app/RecipeCostCalculator");

// Numbers from the customer's own screen (Dolce Nera espresso): stored amounts
// are already lei. 0.018 kg x 117 + 0.24 + 0.1689 = 2.5149; 21 - 2.5149 = 18.4851.
const sellable = [{ id: "esp", name: "Espresso", sale_price: 21 }];
const ingredients = [
  { id: "beans", name: "Cafea boabe", unit_of_measure: "kg", cost_price: 117, current_stock_qty: 0.36 },
  { id: "cup", name: "Pahar", unit_of_measure: "each", cost_price: 0.24, current_stock_qty: 100 },
  { id: "milk", name: "Lapte", unit_of_measure: "l", cost_price: 0.1689, current_stock_qty: 10 },
];
const rows = [
  { product_id: "beans", quantity: "0.018" },
  { product_id: "cup", quantity: "1" },
  { product_id: "milk", quantity: "1" },
];

function renderWith(currency?: string) {
  return render(
    <RecipeCostCalculator
      sellableProducts={sellable}
      ingredientProducts={ingredients}
      recipeId="r1"
      initialProductId="esp"
      initialYieldQty="1"
      initialRows={rows}
      currency={currency}
    />,
  );
}

afterEach(cleanup);

describe("RecipeCostCalculator currency (display only)", () => {
  it("RON org shows lei and never the euro sign, numbers unchanged", () => {
    const { container } = renderWith("RON");
    const text = container.textContent ?? "";
    expect(text).not.toContain("€");
    expect(text).not.toContain("EUR");
    expect(text).toContain("Espresso — 21.00 lei");
    expect(text).toContain("2.11 lei"); // 0.018 x 117 = 2.106
    expect(text).toContain("2.51 lei"); // total cost 2.5149
    expect(text).toContain("21.00 lei"); // sale price
    expect(text).toContain("18.49 lei (88.0%)"); // margin
    expect(text).toContain("117.0000 lei/unit"); // picker unit cost
  });

  it("EUR org still shows the euro sign with the same numbers", () => {
    const { container } = renderWith("EUR");
    const text = container.textContent ?? "";
    expect(text).not.toContain("lei");
    expect(text).toContain("Espresso — €21.00");
    expect(text).toContain("€2.51");
    expect(text).toContain("€18.49 (88.0%)");
    expect(text).toContain("€117.0000/unit");
  });

  it("defaults to EUR when no currency is passed (old callers keep old output)", () => {
    const { container } = renderWith(undefined);
    expect(container.textContent ?? "").toContain("€18.49 (88.0%)");
  });
});

describe("RecipeCostCalculator archived products", () => {
  it("keeps the recipe's archived product visible and marked, and hides other archived products", () => {
    const { container } = render(
      <RecipeCostCalculator
        sellableProducts={[
          { id: "esp", name: "Espresso", sale_price: 21, archived: true },
          { id: "old", name: "Frappe vechi", sale_price: 15, archived: true },
          { id: "lat", name: "Latte", sale_price: 18 },
        ]}
        ingredientProducts={[
          { id: "beans", name: "Cafea boabe", unit_of_measure: "kg", cost_price: 117, current_stock_qty: 1, archived: true },
        ]}
        recipeId="r1"
        initialProductId="esp"
        initialRows={[{ product_id: "beans", quantity: "0.018" }]}
        currency="RON"
      />,
    );
    const options = [...container.querySelectorAll("select[name=product_id] option")].map((o) => o.textContent);
    expect(options).toContain("Espresso (arhivat) — 21.00 lei");
    expect(options).toContain("Latte — 18.00 lei");
    expect(options.some((o) => o?.includes("Frappe vechi"))).toBe(false);
    expect(container.textContent).toContain("Cafea boabe (kg) (arhivat)");
  });
});
