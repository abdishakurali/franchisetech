import { describe, expect, it, vi } from "vitest";

// resolveStatus and FALLBACK_ENTITLEMENTS are pure; the Supabase import is
// only needed by resolveEntitlements, which these tests don't call.
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: vi.fn() }));

import { FALLBACK_ENTITLEMENTS, planEntitlements, resolveNoSubscription, resolveStatus } from "./entitlement-resolver";

const DAY = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * DAY).toISOString();

describe("resolveStatus — canceled subscriptions", () => {
  it("keeps access through the grace window after Stripe cancels on payment failure", () => {
    // Dolce Nera 2026-10: period ended, Stripe canceled, grace still running.
    expect(resolveStatus("canceled", inDays(-2), inDays(4))).toBe("past_due");
  });

  it("falls back once both the period and the grace window have ended", () => {
    expect(resolveStatus("canceled", inDays(-7), inDays(-1))).toBe("canceled");
  });

  it("stays active while the paid period is still running", () => {
    expect(resolveStatus("canceled", inDays(10), null)).toBe("active");
  });

  it("falls back immediately when there is no grace and the period is over", () => {
    expect(resolveStatus("canceled", inDays(-1), null)).toBe("canceled");
  });
});

describe("resolveStatus — other statuses unchanged", () => {
  it("past_due honours the grace window", () => {
    expect(resolveStatus("past_due", inDays(-1), inDays(2))).toBe("past_due");
    expect(resolveStatus("past_due", inDays(-1), inDays(-1))).toBe("expired");
  });

  it("active and trialing pass through", () => {
    expect(resolveStatus("active", null, null)).toBe("active");
    expect(resolveStatus("trialing", null, null)).toBe("trialing");
  });

  it("unknown status expires", () => {
    expect(resolveStatus("incomplete_expired", null, null)).toBe("expired");
  });
});

describe("FALLBACK_ENTITLEMENTS", () => {
  it("keeps stock depletion so a lapsed org's sales still update stock", () => {
    expect(FALLBACK_ENTITLEMENTS).toContain("recipes.stock_depletion");
  });

  it("still withholds the Pro management features", () => {
    for (const key of ["recipes.enabled", "inventory.enabled", "purchases.nir", "reports.gestiune", "reports.accountant_pack"]) {
      expect(FALLBACK_ENTITLEMENTS).not.toContain(key);
    }
  });

  it("keeps selling and fiscal features", () => {
    for (const key of ["pos.enabled", "fiscal.fiscalnet", "fiscal.z_report", "reports.vat"]) {
      expect(FALLBACK_ENTITLEMENTS).toContain(key);
    }
  });
});

describe("resolveNoSubscription — 15-day trial, then reduced access", () => {
  it("gives Pro (growth) during the trial", () => {
    expect(resolveNoSubscription(inDays(10))).toEqual({ status: "trialing", currentPlan: "growth" });
  });

  it("falls back to the reduced set once the trial ends", () => {
    expect(resolveNoSubscription(inDays(-1))).toEqual({ status: "expired", currentPlan: null });
  });

  it("treats an org with no trial dates as an ended trial, not as Free", () => {
    expect(resolveNoSubscription(null)).toEqual({ status: "expired", currentPlan: null });
  });

  it("Pro during the trial includes the features the reduced set withholds", () => {
    const pro = planEntitlements("growth");
    for (const key of ["recipes.enabled", "inventory.enabled", "purchases.nir", "reports.accountant_pack"] as const) {
      expect(pro).toContain(key);
    }
  });
});
