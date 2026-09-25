import { describe, expect, it } from "vitest";
import { accountantDateRange, monthRange, normalizeMonth } from "./period";

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

describe("accountantDateRange", () => {
  it("accepts a custom inclusive period", () => {
    expect(accountantDateRange("2026-09-02", "2026-09-12").days).toBe(11);
  });

  it("caps exports to 366 days", () => {
    expect(accountantDateRange("2025-01-01", "2026-12-31").to).toBe("2026-01-01");
  });
});
