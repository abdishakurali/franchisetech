import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  NO_LIVE_RECEIPT_ALERT_ACTION,
  buildNoLiveReceiptAlert,
  buildTimelines,
  isLiveReceiptAttempt,
  selectOrgsToAlert,
  type OrgReceiptTimeline,
} from "./first-receipt";
import { runFirstReceiptWatch } from "./first-receipt-watch";

const NOW = new Date("2026-11-12T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

const timeline = (over: Partial<OrgReceiptTimeline> = {}): OrgReceiptTimeline => ({
  orgId: "org-1",
  name: "Cafenea Ana",
  businessType: "cafenea",
  ownerEmail: "ana@cafenea.ro",
  signupAt: hoursAgo(30),
  firstLiveReceiptAt: null,
  hoursToFirstLiveReceipt: null,
  ...over,
});

describe("live receipt detection", () => {
  it("counts only confirmed, non-mock receipts", () => {
    expect(isLiveReceiptAttempt({ status: "success", mock_mode: false })).toBe(true);
    expect(isLiveReceiptAttempt({ status: "mock_success", mock_mode: true })).toBe(false);
    expect(isLiveReceiptAttempt({ status: "success", mock_mode: true })).toBe(false);
    expect(isLiveReceiptAttempt({ status: "ambiguous", mock_mode: false })).toBe(false);
    expect(isLiveReceiptAttempt({ status: "success", mock_mode: null })).toBe(false);
  });

  it("takes the earliest live attempt and the hours since signup", () => {
    const [t] = buildTimelines(
      [{ id: "org-1", name: "A", business_type: null, created_at: "2026-11-10T10:00:00.000Z" }],
      [
        { organisation_id: "org-1", status: "success", mock_mode: true, attempted_at: "2026-11-10T10:30:00.000Z" },
        { organisation_id: "org-1", status: "success", mock_mode: false, attempted_at: "2026-11-11T16:00:00.000Z" },
        { organisation_id: "org-1", status: "success", mock_mode: false, attempted_at: "2026-11-11T13:00:00.000Z" },
      ],
      new Map([["org-1", "a@b.ro"]]),
    );
    expect(t.firstLiveReceiptAt).toBe("2026-11-11T13:00:00.000Z");
    expect(t.hoursToFirstLiveReceipt).toBe(27);
    expect(t.ownerEmail).toBe("a@b.ro");
  });
});

describe("who gets the 24h alert", () => {
  it("alerts a real customer 24h+ after signup with no live receipt", () => {
    expect(selectOrgsToAlert([timeline()], new Set(), NOW)).toHaveLength(1);
  });

  it("skips orgs too new, too old, with a live receipt, already alerted, or test accounts", () => {
    const picked = selectOrgsToAlert(
      [
        timeline({ orgId: "new", signupAt: hoursAgo(23) }),
        timeline({ orgId: "old", signupAt: hoursAgo(80) }),
        timeline({ orgId: "live", firstLiveReceiptAt: hoursAgo(5) }),
        timeline({ orgId: "done" }),
        timeline({ orgId: "test", name: "Test cafe" }),
      ],
      new Set(["done"]),
      NOW,
    );
    expect(picked).toEqual([]);
  });

  it("writes a founder alert with name, email, type and signup time", () => {
    const { subject, body } = buildNoLiveReceiptAlert(timeline(), NOW);
    expect(subject).toBe("Fără bon fiscal după 30h — Cafenea Ana");
    expect(body).toContain("ana@cafenea.ro");
    expect(body).toContain("Tip afacere: cafenea");
    expect(body).toMatch(/Ora înscrierii: 11\.11\.2026,? 08:00/);
  });
});

// Minimal Supabase stand-in: records audit_log inserts, returns canned rows.
function fakeSupabase(tables: Record<string, unknown[]>) {
  const inserts: unknown[] = [];
  const from = (table: string) => {
    const result = { data: tables[table] ?? [], error: null };
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "gte", "order", "in", "eq"]) builder[m] = () => builder;
    builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
    builder.insert = (row: unknown) => {
      inserts.push(row);
      tables.audit_log = [...(tables.audit_log ?? []), { organisation_id: (row as { organisation_id: string }).organisation_id }];
      return Promise.resolve({ error: null });
    };
    return builder;
  };
  return { client: { from } as unknown as SupabaseClient, inserts };
}

describe("first-receipt watch handler", () => {
  afterEach(() => vi.unstubAllEnvs());
  const req = (auth: string) => new Request("http://x/api/cron/first-receipt-watch", { headers: { authorization: auth } });

  it("rejects calls without the cron secret", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await runFirstReceiptWatch(req("Bearer wrong"), { supabase: fakeSupabase({}).client });
    expect(res.status).toBe(401);
  });

  it("alerts an org once, then not again on the next run", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const fake = fakeSupabase({
      organisations: [{ id: "org-1", name: "Cafenea Ana", business_type: "cafenea", created_at: hoursAgo(30) }],
      fiscal_receipt_attempts: [],
      organisation_members: [{ organisation_id: "org-1", profiles: { email: "ana@cafenea.ro" } }],
    });
    const send = vi.fn().mockResolvedValue(true);

    const first = await (await runFirstReceiptWatch(req("Bearer s3cret"), { supabase: fake.client, send, now: NOW })).json();
    expect(first).toMatchObject({ ok: true, orgs: 1, withLiveReceipt: 0, sent: 1, failed: 0 });
    expect(fake.inserts).toEqual([expect.objectContaining({ organisation_id: "org-1", action: NO_LIVE_RECEIPT_ALERT_ACTION })]);

    const second = await (await runFirstReceiptWatch(req("Bearer s3cret"), { supabase: fake.client, send, now: NOW })).json();
    expect(second).toMatchObject({ sent: 0 });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("does not mark an org alerted when the email failed", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const fake = fakeSupabase({
      organisations: [{ id: "org-1", name: "Cafenea Ana", business_type: null, created_at: hoursAgo(30) }],
      organisation_members: [{ organisation_id: "org-1", profiles: { email: "ana@cafenea.ro" } }],
    });
    const body = await (await runFirstReceiptWatch(req("Bearer s3cret"), { supabase: fake.client, send: async () => false, now: NOW })).json();
    expect(body).toMatchObject({ sent: 0, failed: 1 });
    expect(fake.inserts).toEqual([]);
  });
});
