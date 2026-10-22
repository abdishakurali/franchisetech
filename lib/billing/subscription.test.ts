import { describe, expect, it } from "vitest";
import { isAccessAllowed, isStripeSubscriptionRecord, isSubscriptionBlockedForApp, resolveNoSubscriptionState, resolveSubscriptionState, type SubState, type SubscriptionStatus } from "./subscription";

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

describe("resolveSubscriptionState", () => {
  it("keeps a canceled subscription active through its paid period", () => {
    expect(resolveSubscriptionState("canceled", "2099-10-25T08:13:25.000Z", null)).toBe("active");
  });

  it("blocks a canceled subscription after its paid period", () => {
    expect(resolveSubscriptionState("canceled", "2020-10-25T08:13:25.000Z", null)).toBe("canceled");
  });
});

describe("isStripeSubscriptionRecord", () => {
  it("ignores the customer placeholder created by €1 card verification", () => {
    expect(isStripeSubscriptionRecord({ stripe_subscription_id: null })).toBe(false);
  });

  it("keeps real Stripe subscriptions authoritative", () => {
    expect(isStripeSubscriptionRecord({ stripe_subscription_id: "sub_live" })).toBe(true);
  });
});

describe("resolveNoSubscriptionState", () => {
  it("allows a verified 15-day trial before its deadline", () => {
    expect(resolveNoSubscriptionState({
      cardVerifiedAt: "2026-10-01T00:00:00.000Z",
      trialStartedAt: "2026-10-01T00:00:00.000Z",
      trialEndsAt: "2099-10-16T00:00:00.000Z",
    })).toBe("soft_trial");
  });

  it("does not grant app access before card verification", () => {
    expect(resolveNoSubscriptionState({
      cardVerifiedAt: null,
      trialStartedAt: null,
      trialEndsAt: null,
    })).toBe("none");
  });
});
