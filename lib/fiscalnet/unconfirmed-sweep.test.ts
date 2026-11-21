import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runUnconfirmedSweep } from "@/lib/fiscalnet/unconfirmed-sweep";

const req = (auth?: string) => new Request("http://x/api/cron/fiscal-unconfirmed", { headers: auth ? { authorization: auth } : {} });

beforeEach(() => { process.env.CRON_SECRET = "s3cret"; });
afterEach(() => { delete process.env.CRON_SECRET; });

describe("runUnconfirmedSweep", () => {
  it("refuses without the cron secret and touches nothing", async () => {
    const rpc = vi.fn();
    const res = await runUnconfirmedSweep(req("Bearer wrong"), { supabase: { rpc } as unknown as SupabaseClient });
    expect(res.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const res = await runUnconfirmedSweep(req("Bearer "), { supabase: { rpc: vi.fn() } as unknown as SupabaseClient });
    expect(res.status).toBe(500);
  });

  it("runs the sweep with the 30-minute threshold and reports what moved", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { api_pending: 2, printing: 1, cutoff: "t" }, error: null });
    const res = await runUnconfirmedSweep(req("Bearer s3cret"), { supabase: { rpc } as unknown as SupabaseClient });
    expect(rpc).toHaveBeenCalledWith("sweep_unconfirmed_fiscal_receipts", { p_older_than_minutes: 30 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, olderThanMinutes: 30, api_pending: 2, printing: 1, cutoff: "t" });
  });

  it("returns 500 when the database refuses", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const res = await runUnconfirmedSweep(req("Bearer s3cret"), { supabase: { rpc } as unknown as SupabaseClient });
    expect(res.status).toBe(500);
  });
});
