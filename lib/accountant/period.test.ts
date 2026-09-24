import { describe, expect, it } from "vitest";
import { monthRange, normalizeMonth } from "./period";

describe("accountant period", () => {
  it("accepts only canonical months", () => {
    const now = new Date("2026-09-24T00:00:00Z");
    expect(normalizeMonth("2026-08", now)).toBe("2026-08");
    expect(normalizeMonth("2026-13", now)).toBe("2026-09");
  });

  it("handles leap years", () => {
    expect(monthRange("2024-02")).toMatchObject({ from: "2024-02-01", to: "2024-02-29", days: 29 });
  });
});
