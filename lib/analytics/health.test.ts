import { describe, expect, it } from "vitest";
import { analyticsHealthState, shouldRecordAnalyticsDelivery, shouldSendAnalyticsAlert } from "@/lib/analytics/health";

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

describe("shouldSendAnalyticsAlert", () => {
  it("alerts once when production analytics first becomes silent", () => {
    expect(shouldSendAnalyticsAlert(null, "alert")).toBe(true);
    expect(shouldSendAnalyticsAlert("no_production_events_24h", "alert")).toBe(false);
  });
});

describe("shouldRecordAnalyticsDelivery", () => {
  it("records real production events", () => {
    expect(shouldRecordAnalyticsDelivery("first_sale_recorded")).toBe(true);
  });

  it("does not let the synthetic health check mark itself healthy", () => {
    expect(shouldRecordAnalyticsDelivery("analytics_health_check")).toBe(false);
  });
});
