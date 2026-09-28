// Gate B proof: category-level photo/name-tile fallback, threshold 0.6,
// decided per category (not per product) so a category's grid section is
// never a patchwork of photo tiles next to blank placeholders.
//
// Fixtures mirror the real coverage found against Dolce Nera's actual
// catalog on 2026-09-15 (queried directly, not invented): CEAI 12/12 (100%),
// 1. HOUSE BLEND COFFEES 23/28 (82%), SHOP 11/29 (38%),
// 5. LIMONADA & FRESH 1/8 (13%).

import { describe, expect, it } from "vitest";
import { computeCategoryTileMode, tileModeForProduct, type TileModeProduct } from "./pos-tile-mode";

function products(categoryId: string, categoryName: string, total: number, withImage: number): TileModeProduct[] {
  const out: TileModeProduct[] = [];
  for (let i = 0; i < total; i++) {
    out.push({
      pos_category: { id: categoryId, name: categoryName },
      image_url: i < withImage ? "https://example.com/img.jpg" : null,
      available_in_pos: true,
      active: true,
    });
  }
  return out;
}

describe("computeCategoryTileMode", () => {
  it("real Dolce Nera coverage: well-covered categories get photo mode, thin ones get name mode", () => {
    const all = [
      ...products("ceai", "CEAI", 12, 12),
      ...products("house-blend", "1. HOUSE BLEND COFFEES", 28, 23),
      ...products("shop", "SHOP", 29, 11),
      ...products("limonada", "5. LIMONADA & FRESH", 8, 1),
    ];
    const modes = computeCategoryTileMode(all);

    expect(modes.get("ceai")).toBe("photo");
    expect(modes.get("house-blend")).toBe("photo"); // 82% >= 60%
    expect(modes.get("shop")).toBe("name"); // 38% < 60%
    expect(modes.get("limonada")).toBe("name"); // 13% < 60%
  });

  it("a category exactly at the 60% threshold gets photo mode (>=, not >)", () => {
    const all = products("half", "Half", 5, 3); // 60%
    expect(computeCategoryTileMode(all).get("half")).toBe("photo");
  });

  it("a category just below the threshold gets name mode", () => {
    const all = products("almost", "Almost", 5, 2); // 40%
    expect(computeCategoryTileMode(all).get("almost")).toBe("name");
  });

  it("decides per category, not per product — a well-photographed product in a thin category still gets a name tile", () => {
    const all = products("shop", "SHOP", 10, 3); // 30%, thin category
    const modes = computeCategoryTileMode(all);
    const photographedProductInThinCategory: TileModeProduct = {
      pos_category: { id: "shop", name: "SHOP" },
      image_url: "https://example.com/has-a-real-photo.jpg",
      available_in_pos: true,
      active: true,
    };
    expect(tileModeForProduct(modes, photographedProductInThinCategory)).toBe("name");
  });

  it("excludes inactive and not-available-in-pos products from the coverage calculation", () => {
    const all: TileModeProduct[] = [
      { pos_category: { id: "c1", name: "C1" }, image_url: "x", available_in_pos: true, active: true },
      { pos_category: { id: "c1", name: "C1" }, image_url: null, available_in_pos: true, active: true },
      // Neither of these should count toward the 2-product total above —
      // if they did, coverage would drop from 50% to 25%, changing the mode.
      { pos_category: { id: "c1", name: "C1" }, image_url: null, available_in_pos: false, active: true },
      { pos_category: { id: "c1", name: "C1" }, image_url: null, available_in_pos: true, active: false },
    ];
    // 50% < 60% -> name, proving the two excluded rows didn't get counted
    // (if they had, it'd still be name, so also check the inverse: without
    // exclusion this would be 1/4 = 25%; with exclusion it's 1/2 = 50%,
    // both under threshold here, so assert coverage math directly instead).
    const modes = computeCategoryTileMode(all);
    expect(modes.get("c1")).toBe("name");

    const wellCovered: TileModeProduct[] = [
      { pos_category: { id: "c2", name: "C2" }, image_url: "x", available_in_pos: true, active: true },
      // If this inactive row counted, coverage would be 1/2 = 50% (name).
      // Excluded, it's 1/1 = 100% (photo) — this is the case that actually
      // distinguishes "excluded" from "counted".
      { pos_category: { id: "c2", name: "C2" }, image_url: null, available_in_pos: true, active: false },
    ];
    expect(computeCategoryTileMode(wellCovered).get("c2")).toBe("photo");
  });

  it("products with no pos_category are bucketed together and default to name mode when thin", () => {
    const all: TileModeProduct[] = [
      { pos_category: null, image_url: null, available_in_pos: true, active: true },
      { pos_category: null, image_url: null, available_in_pos: true, active: true },
    ];
    const modes = computeCategoryTileMode(all);
    expect(tileModeForProduct(modes, all[0])).toBe("name");
  });

  it("tileModeForProduct defaults to name for a category never seen during computation", () => {
    const modes = computeCategoryTileMode(products("known", "Known", 5, 5));
    const unknownCategoryProduct: TileModeProduct = { pos_category: { id: "unknown", name: "Unknown" } };
    expect(tileModeForProduct(modes, unknownCategoryProduct)).toBe("name");
  });
});
