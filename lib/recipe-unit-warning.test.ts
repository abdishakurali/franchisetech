import { describe, expect, it } from "vitest";
import { appText } from "@/lib/app-i18n";
import { recipeLineUnitWarning } from "./recipe-unit-warning";

describe("recipeLineUnitWarning", () => {
  it("the live cases warn: kg against each, Buc against litre", () => {
    const a = recipeLineUnitWarning("kg", "each", "0.018", appText.ro, "ro");
    expect(a).toContain("scade 0.018 bucată");
    const b = recipeLineUnitWarning("Buc", "litre", "1", appText.ro, "ro");
    expect(b).toContain("scade 1 litru");
    expect(recipeLineUnitWarning("Buc", "litre", "1", appText.en, "en")).toContain("deducts 1 litre");
  });

  it("scale mismatch warns (g saved, kg product)", () => {
    expect(recipeLineUnitWarning("g", "kg", "18", appText.ro, "ro")).toContain("scade 18 kg");
  });

  it("equivalent labels and missing units do not warn", () => {
    expect(recipeLineUnitWarning("Buc", "each", "1", appText.ro, "ro")).toBeNull();
    expect(recipeLineUnitWarning("bottle", "each", "1", appText.ro, "ro")).toBeNull();
    expect(recipeLineUnitWarning("kg", "kg", "1", appText.ro, "ro")).toBeNull();
    expect(recipeLineUnitWarning(null, "kg", "1", appText.ro, "ro")).toBeNull();
    expect(recipeLineUnitWarning("kg", null, "1", appText.ro, "ro")).toBeNull();
  });
});
