import { beforeEach, describe, expect, it, vi } from "vitest";

let updateError: { code: string; message: string } | null = null;
const updates: Record<string, unknown>[] = [];
const redirects: string[] = [];
const tracked: { step: string; input: Record<string, unknown> }[] = [];

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirects.push(url);
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));
vi.mock("@/lib/onboarding/step-events", () => ({
  trackOnboardingStepCompleted: (step: string, input: Record<string, unknown>) => tracked.push({ step, input }),
}));
vi.mock("@/lib/org-module-flags", () => ({ saveOrgModuleFlags: async () => ({ ok: true }) }));
vi.mock("@/lib/kitchenops/data", () => ({
  getActiveOrg: async () => ({
    orgId: "org-1",
    user: { id: "user-1", email: "owner@cafe.ro" },
    membership: { role: "owner" },
    supabase: {
      from: () => ({
        select: () => {
          const chain = { eq: () => chain, maybeSingle: async () => ({ data: { name: "Cafe Test SRL" } }) };
          return chain;
        },
        update: (row: Record<string, unknown>) => {
          updates.push(row);
          const chain = {
            eq: () => chain,
            not: () => chain,
            then: (res: (v: { error: typeof updateError }) => unknown) => res({ error: updateError }),
          };
          return chain;
        },
      }),
    },
  }),
}));

const { advanceFromFiscal, completeOnboardingJourney, markFirstSaleDoneForOnboarding } = await import("./onboarding-steps");

beforeEach(() => {
  updateError = null;
  updates.length = 0;
  redirects.length = 0;
  tracked.length = 0;
});

describe("onboarding step writes", () => {
  it("a refused step update returns a Romanian message and does not redirect", async () => {
    updateError = { code: "42501", message: "permission denied" };
    const res = await advanceFromFiscal();
    expect(res).toEqual({ error: expect.stringContaining("Pasul nu s-a salvat") });
    expect(redirects).toEqual([]);
  });

  it("a saved step redirects as before", async () => {
    await expect(advanceFromFiscal()).rejects.toThrow("NEXT_REDIRECT");
    expect(updates).toEqual([{ onboarding_step: "first_sale" }]);
    expect(redirects).toEqual(["/app/pos?onboarding=1&welcome=1"]);
  });

  it("completing onboarding does not send the owner to /app when the flag did not save", async () => {
    updateError = { code: "23514", message: "check violation" };
    expect(await completeOnboardingJourney()).toEqual({ error: expect.any(String) });
    expect(redirects).toEqual([]);
  });

  it("first-sale marker reports a failure instead of returning nothing", async () => {
    updateError = { code: "500", message: "db down" };
    expect(await markFirstSaleDoneForOnboarding()).toEqual({ error: expect.any(String) });
    updateError = null;
    expect(await markFirstSaleDoneForOnboarding()).toBeUndefined();
  });

  it("sends one step event after a saved step, none after a failed one", async () => {
    updateError = { code: "42501", message: "permission denied" };
    await advanceFromFiscal();
    expect(tracked).toEqual([]);
    updateError = null;
    await expect(advanceFromFiscal()).rejects.toThrow("NEXT_REDIRECT");
    expect(tracked).toEqual([
      { step: "fiscal", input: { userId: "user-1", orgId: "org-1", email: "owner@cafe.ro", orgName: "Cafe Test SRL" } },
    ]);
  });

  it("first sale and the final step are tracked as their own steps", async () => {
    await markFirstSaleDoneForOnboarding();
    await expect(completeOnboardingJourney()).rejects.toThrow("NEXT_REDIRECT");
    expect(tracked.map((t) => t.step)).toEqual(["first_sale", "result"]);
  });

  it("a failed completion is not tracked as completed", async () => {
    updateError = { code: "23514", message: "check violation" };
    await completeOnboardingJourney();
    expect(tracked).toEqual([]);
  });
});
