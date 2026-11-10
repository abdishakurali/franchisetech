import { describe, expect, it } from "vitest";
import { appText } from "@/lib/app-i18n";
import { purchaseLineUnitWarning } from "./unit-warning";

describe("purchaseLineUnitWarning", () => {
  it("warns in ro with the number that will be added in the product's unit", () => {
    const msg = purchaseLineUnitWarning({ quantity: "1", received_quantity: "", unit_of_measure: "each" }, "g", appText.ro, "ro");
    expect(msg).toContain("stocul va crește cu 1 g");
    expect(msg).toContain("bucată"); // ro label for "each"
  });

  it("uses the received quantity when given", () => {
    const msg = purchaseLineUnitWarning({ quantity: "300", received_quantity: "250", unit_of_measure: "g" }, "kg", appText.en, "en");
    expect(msg).toContain("increase by 250 kg");
  });

  it("no number typed yet: shows N", () => {
    expect(purchaseLineUnitWarning({ quantity: "", unit_of_measure: "kg" }, "each", appText.en, "en")).toContain("by N each");
  });

  it("no warning for matching or equivalent units, or when the product unit is missing", () => {
    expect(purchaseLineUnitWarning({ quantity: "2", unit_of_measure: "kg" }, "kg", appText.ro, "ro")).toBeNull();
    expect(purchaseLineUnitWarning({ quantity: "6", unit_of_measure: "bottle" }, "each", appText.ro, "ro")).toBeNull();
    expect(purchaseLineUnitWarning({ quantity: "6", unit_of_measure: "Buc" }, "each", appText.ro, "ro")).toBeNull();
    expect(purchaseLineUnitWarning({ quantity: "6", unit_of_measure: "pack" }, "each", appText.ro, "ro")).toBeNull();
    expect(purchaseLineUnitWarning({ quantity: "6", unit_of_measure: "kg" }, null, appText.ro, "ro")).toBeNull();
  });
});
