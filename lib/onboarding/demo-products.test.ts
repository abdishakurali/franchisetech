import { describe, expect, it } from "vitest";
import { demoProductsForCountry } from "@/lib/onboarding/demo-products";

describe("demoProductsForCountry", () => {
  it("gives a café-shaped catalog for a café, in RON", () => {
    const items = demoProductsForCountry("RO", "Cafenea");
    expect(items.map((i) => i.name)).toEqual(["Espresso", "Croissant", "Latte", "Sandwich"]);
    expect(items[0].sale_price).toBe(12);
  });

  it("gives a distinct takeaway catalog, not the café one", () => {
    const items = demoProductsForCountry("RO", "Takeaway");
    expect(items.map((i) => i.name)).toEqual(["Shaorma", "Cartofi prăjiți", "Burger", "Suc"]);
  });

  it("recognizes the bakery/patisserie label regardless of language", () => {
    const ro = demoProductsForCountry("RO", "Patiserie / brutărie");
    const en = demoProductsForCountry("US", "Bakery / patisserie");
    expect(ro.map((i) => i.name)).toEqual(["Croissant", "Covrigi", "Plăcintă", "Pâine"]);
    expect(en.map((i) => i.name)).toEqual(["Croissant", "Pretzel", "Pie slice", "Bread loaf"]);
  });

  it("falls back to the café-shaped default for an unrecognized or missing business type", () => {
    const unrecognized = demoProductsForCountry("RO", "Altele");
    const missing = demoProductsForCountry("RO", undefined);
    expect(unrecognized.map((i) => i.name)).toEqual(["Espresso", "Croissant", "Latte", "Sandwich"]);
    expect(missing).toEqual(unrecognized);
  });

  it("uses non-RON pricing for a non-Romanian country, same category logic", () => {
    const items = demoProductsForCountry("IE", "Café");
    expect(items[0]).toEqual({ name: "Espresso", sale_price: 2.5, sort_order: 1 });
  });
});
