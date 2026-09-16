import { describe, expect, it } from "vitest";
import { CORE_REPORTS, selectCoreReport } from "./hub-selection";

describe("reports hub selection", () => {
  const allVisible = CORE_REPORTS.map((key) => `/app/reports/${key}`);

  it("exposes only the six core reports", () => {
    expect(CORE_REPORTS).toEqual(["sales", "z-report", "vat", "stock", "purchases", "margins"]);
  });

  it("selects an entitled report", () => {
    expect(selectCoreReport("stock", allVisible)).toBe("stock");
  });

  it("does not select hidden or parked reports via the URL", () => {
    expect(selectCoreReport("margins", allVisible.slice(0, 3))).toBe("sales");
    expect(selectCoreReport("audit-export", allVisible)).toBe("sales");
  });

  it("falls back to the first accessible core report", () => {
    expect(selectCoreReport(undefined, ["/app/reports/stock"])).toBe("stock");
  });
});
