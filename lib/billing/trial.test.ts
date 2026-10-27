import { describe, expect, it } from "vitest";
import { TRIAL_DAYS, isTrialActive, trialWindow } from "./trial";

describe("trial", () => {
  it("is 15 days", () => {
    expect(TRIAL_DAYS).toBe(15);
  });

  it("ends exactly TRIAL_DAYS after it starts", () => {
    const now = new Date("2026-10-27T10:00:00.000Z");
    expect(trialWindow(now)).toEqual({
      startedAt: "2026-10-27T10:00:00.000Z",
      endsAt: "2026-11-11T10:00:00.000Z",
    });
  });

  it("is active until the end instant, then not", () => {
    const end = "2026-11-11T10:00:00.000Z";
    expect(isTrialActive(end, new Date("2026-11-11T09:59:59.000Z"))).toBe(true);
    expect(isTrialActive(end, new Date("2026-11-11T10:00:00.000Z"))).toBe(false);
    expect(isTrialActive(null)).toBe(false);
  });
});
