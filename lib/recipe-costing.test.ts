import { describe, expect, it } from "vitest";
import { formatRecipeMoney, formatRecipeUnitCost, recipeCurrencyLabel } from "./recipe-costing";

describe("recipe money formatting is display only", () => {
  it("RON prints lei with the stored number unchanged", () => {
    expect(formatRecipeMoney(18.4851, "RON")).toBe("18.49 lei");
    expect(formatRecipeUnitCost(117, "RON")).toBe("117.0000 lei");
    expect(formatRecipeUnitCost(0.012, "RON", 3)).toBe("0.012 lei");
    expect(recipeCurrencyLabel("RON")).toBe("lei");
  });

  it("EUR keeps the euro sign and the old format", () => {
    expect(formatRecipeMoney(18.4851, "EUR")).toBe("€18.49");
    expect(formatRecipeUnitCost(0.1234, "EUR")).toBe("€0.1234");
    expect(formatRecipeUnitCost(0.012, "EUR", 3)).toBe("€0.012");
    expect(recipeCurrencyLabel("EUR")).toBe("€");
    expect(recipeCurrencyLabel("")).toBe("€");
  });
});
