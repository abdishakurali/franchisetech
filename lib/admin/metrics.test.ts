import { describe, expect, it } from "vitest";
import {
  bucharestDayKey,
  dailySeries,
  lastDayKeys,
  onboardingStepLabel,
  signupStage,
  subscriptionMrrCents,
  summarizeTrading,
  totalMrrCents,
  windowDelta,
} from "@/lib/admin/metrics";

describe("Romania days", () => {
  it("uses the Bucharest calendar day, not UTC", () => {
    // 22:30 UTC on 13 Nov is 00:30 on 14 Nov in Bucharest (UTC+2 in winter).
    expect(bucharestDayKey("2026-11-13T22:30:00Z")).toBe("2026-11-14");
    expect(bucharestDayKey("2026-11-13T21:59:00Z")).toBe("2026-11-13");
  });

  it("lists N consecutive days ending today, across a DST change", () => {
    const keys = lastDayKeys(5, new Date("2026-10-26T09:00:00Z")); // DST ended 25 Oct
    expect(keys).toEqual(["2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"]);
  });

  it("zero-fills daily series and ignores rows outside the window", () => {
    const now = new Date("2026-11-13T10:00:00Z");
    const rows = [
      { at: "2026-11-13T08:00:00Z", v: 10 },
      { at: "2026-11-13T09:00:00Z", v: 5.5 },
      { at: "2026-11-11T09:00:00Z", v: 1 },
      { at: "2026-10-01T09:00:00Z", v: 99 },
    ];
    const s = dailySeries(rows, (r) => r.at, (r) => r.v, 3, now);
    expect(s).toEqual([
      { day: "2026-11-11", value: 1 },
      { day: "2026-11-12", value: 0 },
      { day: "2026-11-13", value: 15.5 },
    ]);
  });
});

describe("windowDelta", () => {
  const now = new Date("2026-11-13T00:00:00Z");
  it("compares the current window with the previous one", () => {
    const rows = [{ at: "2026-11-10T00:00:00Z" }, { at: "2026-11-11T00:00:00Z" }, { at: "2026-10-30T00:00:00Z" }];
    expect(windowDelta(rows, (r) => r.at, () => 1, 10, now)).toEqual({ current: 2, previous: 1, pct: 100 });
  });
  it("returns pct null when there is no previous data", () => {
    expect(windowDelta([{ at: "2026-11-10T00:00:00Z" }], (r) => r.at, () => 1, 10, now).pct).toBeNull();
  });
});

describe("signups", () => {
  const now = new Date("2026-11-13T12:00:00Z");
  it("flags unfinished onboarding older than 2h as stalled", () => {
    expect(signupStage({ created_at: "2026-11-13T09:00:00Z", onboarding_completed: false, onboarding_step: "menu" }, now)).toBe("stalled");
    expect(signupStage({ created_at: "2026-11-13T11:30:00Z", onboarding_completed: false, onboarding_step: null }, now)).toBe("in_progress");
    expect(signupStage({ created_at: "2026-01-01T00:00:00Z", onboarding_completed: true, onboarding_step: "complete" }, now)).toBe("complete");
  });
  it("labels a null step as the first screen", () => {
    expect(onboardingStepLabel(null)).toMatch(/^1/);
    expect(onboardingStepLabel("fiscal")).toMatch(/FiscalNet/);
  });
});

describe("MRR", () => {
  const base = { organisation_id: "o", current_period_end: null, cancel_at_period_end: false, stripe_price_id: null };
  it("counts only active / past_due subscriptions at list price", () => {
    expect(subscriptionMrrCents({ ...base, plan: "pro", status: "active" })).toBe(7900);
    expect(subscriptionMrrCents({ ...base, plan: "pro", status: "canceled" })).toBe(0);
    expect(subscriptionMrrCents({ ...base, plan: "nonsense", status: "active" })).toBe(0);
    expect(totalMrrCents([{ ...base, plan: "pro", status: "active" }, { ...base, plan: "starter", status: "past_due" }])).toBe(7900 + 4900);
  });
});

describe("summarizeTrading", () => {
  const now = new Date("2026-11-13T12:00:00Z"); // 14:00 in Bucharest
  const orgs = [{ id: "dn", name: "Dolce Nera" }, { id: "t", name: "Trial café" }];

  it("splits today vs 7 days and counts real fiscal outcomes only", () => {
    const rows = summarizeTrading({
      orgs,
      payingOrgIds: new Set(["dn"]),
      tx: [
        { organisation_id: "dn", sold_at: "2026-11-13T07:00:00Z", total: "10.50", fiscal_receipt_status: "success" },
        { organisation_id: "dn", sold_at: "2026-11-12T07:00:00Z", total: 20, fiscal_receipt_status: "failed" },
        { organisation_id: "dn", sold_at: "2026-11-01T07:00:00Z", total: 999, fiscal_receipt_status: "success" },
      ],
      openSessions: [],
      attempts: [
        { organisation_id: "dn", status: "success", mock_mode: false, attempted_at: "2026-11-13T07:00:00Z" },
        { organisation_id: "dn", status: "failed", mock_mode: false, attempted_at: "2026-11-12T07:00:00Z" },
        { organisation_id: "dn", status: "failed", mock_mode: true, attempted_at: "2026-11-12T07:00:00Z" },
      ],
      now,
    });
    const dn = rows.find((r) => r.organisationId === "dn")!;
    expect(dn).toMatchObject({ salesToday: 10.5, countToday: 1, sales7d: 30.5, count7d: 2, fiscalSent7d: 1, fiscalFailed7d: 1, receiptsFailed7d: 1, paying: true });
    expect(dn.alerts.some((a) => a.includes("eșuate"))).toBe(true);
  });

  it("flags a paying café with the till open and no sale for hours (the outage case)", () => {
    const rows = summarizeTrading({
      orgs,
      payingOrgIds: new Set(["dn"]),
      tx: [{ organisation_id: "dn", sold_at: "2026-11-13T06:00:00Z", total: 5, fiscal_receipt_status: "success" }],
      openSessions: [{ organisation_id: "dn", opened_at: "2026-11-13T05:30:00Z" }],
      attempts: [],
      now,
    });
    expect(rows[0].alerts.join(" ")).toMatch(/nicio vânzare de 3h/);
  });

  it("flags a paying café with no sales in a week and lists it even without activity", () => {
    const rows = summarizeTrading({ orgs, payingOrgIds: new Set(["dn"]), tx: [], openSessions: [], attempts: [], now });
    expect(rows).toHaveLength(1);
    expect(rows[0].alerts).toContain("Plătește, dar nicio vânzare în 7 zile");
  });

  it("puts paying cafés first", () => {
    const rows = summarizeTrading({
      orgs,
      payingOrgIds: new Set(["dn"]),
      tx: [{ organisation_id: "t", sold_at: "2026-11-13T07:00:00Z", total: 500, fiscal_receipt_status: "not_required" }],
      openSessions: [],
      attempts: [],
      now,
    });
    expect(rows.map((r) => r.organisationId)).toEqual(["dn", "t"]);
  });
});
