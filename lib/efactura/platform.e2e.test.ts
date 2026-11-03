// End-to-end test of SALUT TECH's e-Factura pipeline on a real Supabase
// (local stack: Postgres + PostgREST + the real migrations) with:
//   • the real queue, numbering RPC (issue_sales_invoice), unique indexes,
//   • ANAF's REAL public validator for the invoices read back from the DB,
//   • a stand-in ANAF server for upload / status / download / token check.
// Skipped unless E2E_SUPABASE_URL and E2E_SUPABASE_SERVICE_KEY point at a
// throwaway database. Never run it against production.

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const URL_ = process.env.E2E_SUPABASE_URL;
const KEY = process.env.E2E_SUPABASE_SERVICE_KEY;
const run = URL_ && KEY ? describe : describe.skip;

// Stand-in ANAF: counts uploads per invoice number so a double send is visible.
const uploads = new Map<string, number>();
let nextIndex = 5000;
let anaf: Server;

function standInAnaf(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) {
  const url = new globalThis.URL(req.url ?? "/", "http://x");
  const auth = req.headers.authorization ?? "";
  if (auth !== "Bearer good-token") { res.writeHead(401); res.end("unauthorized"); return; }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (url.pathname.endsWith("/upload")) {
      const number = body.match(/<cbc:ID>([^<]+)<\/cbc:ID>/)?.[1] ?? "?";
      uploads.set(number, (uploads.get(number) ?? 0) + 1);
      res.writeHead(200); res.end(`<header ExecutionStatus="0" index_incarcare="${nextIndex++}"/>`); return;
    }
    if (url.pathname.endsWith("/stareMesaj")) {
      res.writeHead(200); res.end(`<header stare="ok" id_descarcare="${url.searchParams.get("id_incarcare")}"/>`); return;
    }
    if (url.pathname.endsWith("/descarcare")) { res.writeHead(200); res.end("PK-fake-zip"); return; }
    if (url.pathname.endsWith("/listaMesajeFactura")) { res.writeHead(200); res.end('{"mesaje":[]}'); return; }
    res.writeHead(404); res.end();
  });
}

let db: SupabaseClient;
let orgId: string;

const paid = (id: string, over: Record<string, unknown> = {}) => ({
  id, livemode: true, currency: "eur", amount_paid: 4900,
  customer_name: "CLIENT E2E S.R.L.",
  customer_address: { line1: "Str. Test 1", line2: "Sector 2", city: "București", country: "RO" },
  customer_tax_ids: [{ type: "ro_tin", value: "28279356" }],
  status_transitions: { paid_at: 1793700000 },
  lines: { data: [{ description: "franchisetech Pro — noiembrie 2026", amount: 7900, quantity: 1, discount_amounts: [{ amount: 3000 }] }] },
  ...over,
});

run("SALUT TECH e-Factura, end to end on a real database", () => {
  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", URL_!);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", KEY!);
    anaf = createServer(standInAnaf);
    await new Promise<void>((r) => anaf.listen(0, "127.0.0.1", r));
    vi.stubEnv("ANAF_API_BASE_OVERRIDE", `http://127.0.0.1:${(anaf.address() as AddressInfo).port}`);

    db = createClient(URL_!, KEY!, { auth: { persistSession: false } });
    const { data, error } = await db.from("organisations")
      .insert({ name: "SALUT TECH E2E", business_type: "internal", anaf_cif: "49702253", invoice_series: "SLT" })
      .select("id").single();
    if (error) throw error;
    orgId = data.id;
    vi.stubEnv("PLATFORM_BILLING_ORG_ID", orgId);
    vi.stubEnv("PLATFORM_INVOICING", "1");
  });

  afterAll(async () => {
    await new Promise<void>((r) => anaf.close(() => r()));
    vi.unstubAllEnvs();
  });

  async function deps() {
    const { platformInvoiceDeps } = await import("@/lib/billing/platform-invoice-store");
    const d = platformInvoiceDeps(db)!;
    return { ...d, alert: vi.fn().mockResolvedValue(undefined) };
  }
  const rows = async () => (await db.from("efactura_invoices").select("*").eq("organisation_id", orgId).order("created_at")).data ?? [];

  it("replaying one payment 5 times (also concurrently) creates one numbered invoice", async () => {
    const { queuePlatformInvoice } = await import("@/lib/billing/platform-invoice-queue");
    const d = await deps();
    await queuePlatformInvoice(paid("in_e2e_1"), d);
    await Promise.all(Array.from({ length: 4 }, () => queuePlatformInvoice(paid("in_e2e_1"), d)));
    const mine = (await rows()).filter((r) => r.stripe_invoice_id === "in_e2e_1");
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ invoice_number: "SLT1", upload_status: "ready" });
    expect(mine[0].xml_content).toContain("<cbc:ID>SLT1</cbc:ID>");
  });

  it("20 concurrent payments get 20 numbers from the real locked counter, no gaps or duplicates", async () => {
    const { queuePlatformInvoice } = await import("@/lib/billing/platform-invoice-queue");
    const d = await deps();
    await Promise.all(Array.from({ length: 20 }, (_, i) => queuePlatformInvoice(paid(`in_e2e_c${i}`), d)));
    const numbers = (await rows()).filter((r) => r.stripe_invoice_id?.startsWith("in_e2e_c"))
      .map((r) => Number(String(r.invoice_number).replace("SLT", ""))).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => i + 2));
  });

  it("invoices read back from the database pass ANAF's real validator", async () => {
    const { validateXml } = await import("@/lib/anaf/client");
    const sample = (await rows()).filter((r) => r.xml_content).slice(0, 3);
    for (const r of sample) {
      const v = await validateXml(r.xml_content);
      expect(v, `${r.invoice_number}: ${v.errors.join(" | ")}`).toEqual({ valid: true, errors: [] });
    }
  }, 60_000);

  it("missing buyer data is held without a number and never numbered later by accident", async () => {
    const { queuePlatformInvoice } = await import("@/lib/billing/platform-invoice-queue");
    const d = await deps();
    await queuePlatformInvoice(paid("in_e2e_bad", { customer_tax_ids: [] }), d);
    await queuePlatformInvoice(paid("in_e2e_bad", { customer_tax_ids: [] }), d);
    const held = (await rows()).filter((r) => r.stripe_invoice_id === "in_e2e_bad");
    expect(held).toHaveLength(1);
    expect(held[0]).toMatchObject({ upload_status: "needs_data", issued_at: null });
    expect(held[0].invoice_number).toMatch(/^CIORNA-/);
    expect(d.alert).toHaveBeenCalledTimes(1);
  });

  it("without an ANAF token nothing is sent; an expired accountant token says so plainly", async () => {
    const { getOrgAccessToken } = await import("@/lib/anaf/auth");
    await expect(getOrgAccessToken(orgId)).rejects.toThrow();
    await db.from("anaf_oauth_tokens").insert({ organisation_id: orgId, cif: "49702253", access_token: "old", refresh_token: "", expires_at: "2026-01-01T00:00:00Z" });
    await expect(getOrgAccessToken(orgId)).rejects.toThrow(/contabil a expirat/);
    await db.from("anaf_oauth_tokens").update({ access_token: "good-token", expires_at: "2027-01-01T00:00:00Z" }).eq("organisation_id", orgId);
    expect(await getOrgAccessToken(orgId)).toBe("good-token");
  });

  it("the daily run uploads each invoice exactly once, even with two runs at the same time, then marks them accepted", async () => {
    vi.stubEnv("PLATFORM_EFACTURA_UPLOAD", "1");
    const { runPlatformEfactura } = await import("@/lib/efactura/platform-run");
    await Promise.all([runPlatformEfactura(), runPlatformEfactura()]);
    await runPlatformEfactura(); // polls whatever the first runs uploaded
    for (const [number, count] of uploads) expect(count, number).toBe(1);
    const all = await rows();
    const sent = all.filter((r) => r.upload_status !== "needs_data");
    expect(sent.length).toBe(21);
    expect(sent.every((r) => r.upload_status === "accepted")).toBe(true);
    expect(sent.every((r) => r.zip_content)).toBe(true);
  }, 120_000);

  it("a refund produces one storno, sent only after the original was accepted", async () => {
    const { queuePlatformStorno } = await import("@/lib/billing/platform-invoice-queue");
    const d = await deps();
    await Promise.all([queuePlatformStorno("in_e2e_1", d), queuePlatformStorno("in_e2e_1", d)]);
    const stornos = (await rows()).filter((r) => r.storno_of);
    expect(stornos).toHaveLength(1);
    expect(stornos[0].note).toBe("Stornare factura SLT1");
    const { validateXml } = await import("@/lib/anaf/client");
    expect((await validateXml(stornos[0].xml_content)).valid).toBe(true);
    const { runPlatformEfactura } = await import("@/lib/efactura/platform-run");
    await runPlatformEfactura();
    await runPlatformEfactura();
    expect(uploads.get(stornos[0].invoice_number)).toBe(1);
    expect((await rows()).find((r) => r.id === stornos[0].id)?.upload_status).toBe("accepted");
  }, 120_000);

  it("an upload interrupted mid-way is parked for a human and never re-sent", async () => {
    const { queuePlatformInvoice } = await import("@/lib/billing/platform-invoice-queue");
    await queuePlatformInvoice(paid("in_e2e_crash"), await deps());
    const row = (await rows()).find((r) => r.stripe_invoice_id === "in_e2e_crash")!;
    await db.from("efactura_invoices").update({ upload_status: "uploading", updated_at: "2026-01-01T00:00:00Z" }).eq("id", row.id);
    const { runPlatformEfactura } = await import("@/lib/efactura/platform-run");
    await runPlatformEfactura();
    const after = (await rows()).find((r) => r.id === row.id)!;
    expect(after.upload_status).toBe("upload_unknown");
    expect(uploads.get(row.invoice_number)).toBeUndefined();
  }, 60_000);
});
