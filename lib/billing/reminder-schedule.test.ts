import { describe, expect, it } from "vitest";
import { billingReminderWindow } from "./reminder-schedule";

describe("billing reminder schedule", () => {
  it("uses a stable incident key across cron retries", () => {
    expect(billingReminderWindow("past_due_grace", "2026-09-28T10:00:00+03:00")).toBe("2026-09-28T07:00:00.000Z");
  });

  it("rejects invalid incident timestamps", () => {
    expect(() => billingReminderWindow("trial_expired", "invalid")).toThrow();
  });
});
