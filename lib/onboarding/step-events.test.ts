import { beforeEach, describe, expect, it, vi } from "vitest";

const captured: { distinctId: string; event: string; props: Record<string, unknown> }[] = [];
vi.mock("next/server", () => ({ after: () => {} }));
vi.mock("@/lib/posthog-server", () => ({
  captureServerEvent: (distinctId: string, event: string, props: Record<string, unknown>) =>
    captured.push({ distinctId, event, props }),
  flushPostHog: async () => {},
}));

const { onboardingStepEventProps, trackOnboardingStepCompleted, ONBOARDING_FUNNEL_STEPS } = await import("./step-events");

beforeEach(() => {
  captured.length = 0;
});

describe("onboarding step events", () => {
  it("numbers steps in funnel order and classifies test accounts", () => {
    expect(ONBOARDING_FUNNEL_STEPS[0]).toBe("business_cui");
    const props = onboardingStepEventProps("menu", { orgId: "o1", email: "a@cafe.ro", orgName: "Cafe Test" });
    expect(props).toMatchObject({ step: "menu", step_index: 3, organisation_id: "o1", account_type: "test" });
    expect(onboardingStepEventProps("modules", { orgId: "o1", email: "x@franchisetech.ro" }).account_type).toBe("internal");
    expect(onboardingStepEventProps("modules", { orgId: "o1", email: "x@cafe.ro", orgName: "Aroma" }).account_type).toBe("real_customer");
  });

  it("a middle step sends only onboarding_step_completed", () => {
    trackOnboardingStepCompleted("fiscal", { userId: "u1", orgId: "o1", email: "a@cafe.ro", orgName: "Aroma" });
    expect(captured.map((c) => c.event)).toEqual(["onboarding_step_completed"]);
    expect(captured[0]).toMatchObject({ distinctId: "u1", props: { step: "fiscal", step_index: 4 } });
  });

  it("onboarding_completed fires only on the final step", () => {
    for (const step of ONBOARDING_FUNNEL_STEPS.slice(0, -1)) {
      trackOnboardingStepCompleted(step, { userId: "u1", orgId: "o1" });
    }
    expect(captured.some((c) => c.event === "onboarding_completed")).toBe(false);
    trackOnboardingStepCompleted("result", { userId: "u1", orgId: "o1" });
    expect(captured.slice(-2).map((c) => c.event)).toEqual(["onboarding_step_completed", "onboarding_completed"]);
  });
});
