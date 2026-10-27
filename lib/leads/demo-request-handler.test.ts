import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/posthog-server", () => ({ captureServerEventAsync: vi.fn() }));

import { handleDemoRequest, type Store } from "./demo-request-handler";

const body = (overrides: Record<string, unknown> = {}) => ({
  business_name: "Cafeneaua Test",
  contact_name: "Ana Pop",
  email: "ana@example.ro",
  business_type: "Cafenea",
  locations: "1",
  consent: true,
  started_at: Date.now() - 20_000,
  ph_distinct_id: "anon-123456",
  ...overrides,
});

function req(payload: unknown, ip = "203.0.113.7") {
  return new Request("https://www.franchisetech.ro/api/demo-request", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

function fakeStore(overrides: Partial<Store> = {}): Store & { inserted: number; marked: Array<[string, boolean]> } {
  const s = {
    inserted: 0,
    marked: [] as Array<[string, boolean]>,
    recentFromIp: vi.fn(async () => 0),
    recentDuplicate: vi.fn(async () => false),
    insert: vi.fn(async () => {
      s.inserted++;
      return "lead-1";
    }),
    markEmail: vi.fn(async (id: string, ok: boolean) => {
      s.marked.push([id, ok]);
    }),
    ...overrides,
  };
  return s;
}

function deps(store: Store, sendOk = true) {
  return {
    store: async () => store,
    send: vi.fn(async () => (sendOk ? { success: true as const } : { success: false as const, error: "smtp down" })),
    capture: vi.fn(async () => true),
  };
}

describe("handleDemoRequest", () => {
  it("stores, emails, marks the email sent and records non-PII analytics", async () => {
    const store = fakeStore();
    const d = deps(store);
    const res = await handleDemoRequest(req(body()), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(store.inserted).toBe(1);
    expect(store.marked).toEqual([["lead-1", true]]);
    expect(d.capture).toHaveBeenCalledWith("anon-123456", "demo_form_submitted", expect.objectContaining({ stored: true, notified: true, lead_fit: "horeca" }));
    expect(d.capture).toHaveBeenCalledWith("anon-123456", "qualified_lead", expect.anything());
    expect(JSON.stringify((d.capture as ReturnType<typeof vi.fn>).mock.calls)).not.toContain("ana@example.ro");
  });

  it("still succeeds when the email fails but the lead is stored, and records the failure", async () => {
    const store = fakeStore();
    const res = await handleDemoRequest(req(body()), deps(store, false));
    expect(res.status).toBe(200);
    expect(store.marked).toEqual([["lead-1", false]]);
  });

  it("still succeeds when storage is unavailable but the email is delivered", async () => {
    const store = fakeStore({ insert: vi.fn(async () => null), recentFromIp: vi.fn(async () => null), recentDuplicate: vi.fn(async () => null) });
    const res = await handleDemoRequest(req(body(), "198.51.100.1"), deps(store, true));
    expect(res.status).toBe(200);
  });

  it("returns an error (never a fake success) when the lead is neither stored nor emailed", async () => {
    const store = fakeStore({ insert: vi.fn(async () => null), recentFromIp: vi.fn(async () => null), recentDuplicate: vi.fn(async () => null) });
    const res = await handleDemoRequest(req(body(), "198.51.100.2"), deps(store, false));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/@/);
  });

  it("returns field errors for invalid input without storing anything", async () => {
    const store = fakeStore();
    const res = await handleDemoRequest(req(body({ email: "nope" })), deps(store));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.email).toBeTruthy();
    expect(store.inserted).toBe(0);
  });

  it("answers spam like success but stores and sends nothing", async () => {
    const store = fakeStore();
    const d = deps(store);
    const res = await handleDemoRequest(req(body({ website: "spam.example" })), d);
    expect(res.status).toBe(200);
    expect(store.inserted).toBe(0);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("rate-limits an IP with 3 recent requests", async () => {
    const store = fakeStore({ recentFromIp: vi.fn(async () => 3) });
    const res = await handleDemoRequest(req(body()), deps(store));
    expect(res.status).toBe(429);
    expect(store.inserted).toBe(0);
  });

  it("does not store or email a duplicate submitted within the window", async () => {
    const store = fakeStore({ recentDuplicate: vi.fn(async () => true) });
    const d = deps(store);
    const res = await handleDemoRequest(req(body()), d);
    expect(await res.json()).toEqual({ ok: true, duplicate: true });
    expect(store.inserted).toBe(0);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("rejects malformed and oversized bodies", async () => {
    expect((await handleDemoRequest(req("{not json"), deps(fakeStore()))).status).toBe(400);
    expect((await handleDemoRequest(req("[1,2]"), deps(fakeStore()))).status).toBe(400);
    expect((await handleDemoRequest(req(body({ message: "x".repeat(20_000) })), deps(fakeStore()))).status).toBe(413);
  });

  it("ignores a suspicious distinct id and does not tag non-HoReCa leads as qualified", async () => {
    const store = fakeStore();
    const d = deps(store);
    await handleDemoRequest(req(body({ ph_distinct_id: "x", business_type: "Altă afacere" })), d);
    const calls = (d.capture as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.map((c) => c[1])).toEqual(["demo_form_submitted"]);
    expect(String(calls[0][0])).toMatch(/^lead_/);
  });
});
