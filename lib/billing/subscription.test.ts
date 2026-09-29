import { describe, expect, it } from "vitest";
import { isAccessAllowed, isSubscriptionBlockedForApp, type SubState, type SubscriptionStatus } from "./subscription";

function statusFor(state: SubState): SubscriptionStatus {
  return {
    state,
    plan: "pro",
    label: "",
    urgent: false,
    showUpgradeCTA: false,
    trialEndsAt: null,
    stripeTrialEnd: null,
    periodEnd: null,
    gracePeriodEndsAt: null,
    cancelAtPeriodEnd: false,
    creditMonths: 0,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    trialDaysLeft: null,
    graceDaysLeft: null,
  };
}

describe("isAccessAllowed / isSubscriptionBlockedForApp", () => {
  const allowedStates: SubState[] = ["active", "trialing", "soft_trial", "free", "past_due"];
  const blockedStates: SubState[] = ["none", "canceled", "incomplete", "past_due_expired"];

  for (const state of allowedStates) {
    it(`allows access for "${state}"`, () => {
      expect(isAccessAllowed(statusFor(state))).toBe(true);
      expect(isSubscriptionBlockedForApp(statusFor(state))).toBe(false);
    });
  }

  for (const state of blockedStates) {
    it(`blocks access for "${state}"`, () => {
      expect(isAccessAllowed(statusFor(state))).toBe(false);
      expect(isSubscriptionBlockedForApp(statusFor(state))).toBe(true);
    });
  }

  it("past_due (within grace) and past_due_expired (grace elapsed) resolve to opposite access decisions", () => {
    expect(isAccessAllowed(statusFor("past_due"))).toBe(true);
    expect(isAccessAllowed(statusFor("past_due_expired"))).toBe(false);
  });

  it("treats a null/undefined status as blocked, not allowed by default", () => {
    expect(isSubscriptionBlockedForApp(null)).toBe(false);
    expect(isSubscriptionBlockedForApp(undefined)).toBe(false);
  });
});
