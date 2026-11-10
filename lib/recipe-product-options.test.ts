import { describe, expect, it } from "vitest";
import { buildRecipeProductChoices, missingLinkedIds } from "./recipe-product-options";

const live = { id: "a", name: "Cafea", active: true };
const archived = { id: "b", name: "Lapte vechi", active: false };
const noFlag = { id: "c", name: "Zahăr" };

describe("buildRecipeProductChoices", () => {
  it("new recipe: archived products are not offered", () => {
    const out = buildRecipeProductChoices([live, archived, noFlag], [], []);
    expect(out.map((p) => p.id)).toEqual(["a", "c"]);
    expect(out.every((p) => p.archived === false)).toBe(true);
  });

  it("existing recipe: the already-linked archived product stays visible, marked archived", () => {
    const out = buildRecipeProductChoices([live], [archived], ["b"]);
    expect(out.map((p) => [p.id, p.archived])).toEqual([["a", false], ["b", true]]);
  });

  it("an archived product that is NOT linked stays hidden even if it was loaded", () => {
    const out = buildRecipeProductChoices([live, archived], [], ["a"]);
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });

  it("a linked product that is active but outside the filter is added unmarked", () => {
    const out = buildRecipeProductChoices([live], [noFlag], ["c"]);
    expect(out.find((p) => p.id === "c")?.archived).toBe(false);
  });

  it("a deleted product (not found anywhere) is skipped, no duplicates", () => {
    const out = buildRecipeProductChoices([live], [], ["zzz", "a", "a", null]);
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });
});

describe("missingLinkedIds", () => {
  it("returns unique linked ids not already in the active list", () => {
    expect(missingLinkedIds(["a"], ["a", "b", "b", null, undefined, ""])).toEqual(["b"]);
  });
});
