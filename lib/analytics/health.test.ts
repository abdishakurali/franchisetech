import { describe, expect, it } from "vitest";
import { analyticsHealthState } from "@/lib/analytics/health";

describe("analyticsHealthState", () => {
  it("alerts after 24 hours without a successful delivery", () => {
    expect(analyticsHealthState({
      lastSuccessAt: "2026-10-19T12:00:00.000Z",
      now: new Date("2026-10-21T12:01:00.000Z"),
    })).toBe("alert");
  });

  it("stays healthy when a delivery succeeded within 24 hours", () => {
    expect(analyticsHealthState({
      lastSuccessAt: "2026-10-21T11:00:00.000Z",
      now: new Date("2026-10-21T12:01:00.000Z"),
    })).toBe("healthy");
  });
});
