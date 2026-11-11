import { describe, expect, it } from "vitest";
import { unitShortLabel } from "@/lib/units-of-measure";

describe("unitShortLabel", () => {
  it("shows buc for pieces in Romanian", () => {
    expect(unitShortLabel("each", "ro")).toBe("buc");
    expect(unitShortLabel(null, "ro")).toBe("buc");
  });

  it("keeps the stored code for English and other units", () => {
    expect(unitShortLabel("each", "en")).toBe("each");
    expect(unitShortLabel(null, "en")).toBe("each");
    expect(unitShortLabel("kg", "ro")).toBe("kg");
    expect(unitShortLabel("ml", "ro")).toBe("ml");
  });
});
