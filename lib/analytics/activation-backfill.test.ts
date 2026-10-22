import { describe, expect, it } from "vitest";
import { activationDistinctId, activationEventsForOrg } from "@/lib/analytics/activation-backfill";

describe("activationEventsForOrg", () => {
  it("returns only milestones proven by Supabase timestamps", () => {
    expect(activationEventsForOrg({
      id: "org_1",
      trial_started_at: "2026-10-01T00:00:00Z",
      growth_till_opened_at: "2026-10-02T00:00:00Z",
      growth_first_sale_at: null,
      growth_first_report_at: null,
    })).toEqual([
      { event: "trial_started", timestamp: "2026-10-01T00:00:00Z" },
      { event: "till_session_opened", timestamp: "2026-10-02T00:00:00Z" },
    ]);
  });
});

describe("activationDistinctId", () => {
  it("uses the Supabase owner id so backfilled events join the live funnel", () => {
    expect(activationDistinctId("user_1")).toBe("user_1");
  });

  it("skips organisations whose owner cannot be resolved", () => {
    expect(activationDistinctId(null)).toBeNull();
  });
});
