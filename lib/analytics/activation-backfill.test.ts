import { describe, expect, it } from "vitest";
import { activationEventsForOrg } from "@/lib/analytics/activation-backfill";

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
