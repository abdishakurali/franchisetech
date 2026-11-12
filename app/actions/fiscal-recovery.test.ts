import { beforeEach, describe, expect, it, vi } from "vitest";

// Minimal fake of the Supabase query builder: records filters, returns the
// table's rows filtered by eq/in, and resolves on await / single / maybeSingle.
type Row = Record<string, unknown>;
let tables: Record<string, Row[]> = {};
let role = "owner";
const queries: Array<{ table: string; filters: Array<[string, string, unknown]> }> = [];

function builder(table: string) {
  const filters: Array<[string, string, unknown]> = [];
  queries.push({ table, filters });
  const rows = () =>
    (tables[table] ?? []).filter((r) =>
      filters.every(([op, col, v]) => {
        if (op === "eq") return r[col] === v;
        if (op === "in") return (v as unknown[]).includes(r[col]);
        return true;
      }),
    );
  const b: Record<string, unknown> = {};
  for (const m of ["select", "order", "limit"]) b[m] = () => b;
  for (const op of ["eq", "in", "gte", "lte"]) b[op] = (col: string, v: unknown) => { filters.push([op, col, v]); return b; };
  b.single = async () => ({ data: rows()[0] ?? null, error: null });
  b.maybeSingle = async () => ({ data: rows()[0] ?? null, error: null });
  b.then = (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
    Promise.resolve({ data: rows(), error: null }).then(res, rej);
  return b;
}

vi.mock("@/lib/kitchenops/data", () => ({
  getActiveOrg: async () => ({
    orgId: "org-1",
    user: { id: "user-1" },
    membership: { id: "mem-1", role },
    supabase: { from: (t: string) => builder(t) },
  }),
}));
vi.mock("@/lib/site-context", () => ({ requireActiveSite: async () => ({ siteId: "site-1", sites: [] }) }));
vi.mock("@/lib/vat-rates-server", () => ({
  listActiveVatRates: async () => [{ rate: 11, fiscalnet_vat_group: 2 }, { rate: 0, fiscalnet_vat_group: 5 }],
}));

const { listSalesMissingFiscalReceipt, getFiscalRetryPayload } = await import("./fiscal-recovery");

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const tx = (id: string, over: Row = {}): Row => ({
  id,
  organisation_id: "org-1",
  site_id: "site-1",
  transaction_number: `KO-${id}`,
  sold_at: ago(30),
  total: "27.00",
  status: "completed",
  fiscal_receipt_required: true,
  fiscal_receipt_status: "api_pending",
  payment_method_id: "pm-cash",
  payment_methods: { type: "cash", fiscalnet_code: 1 },
  ...over,
});

beforeEach(() => {
  role = "owner";
  queries.length = 0;
  tables = {
    organisations: [{ id: "org-1", country_code: "RO", fiscalnet_enabled: true, fiscalnet_mock_mode: false }],
    pos_transactions: [],
    fiscal_receipt_attempts: [],
    pos_transaction_items: [],
  };
});

describe("listSalesMissingFiscalReceipt", () => {
  it("is owner/manager only", async () => {
    role = "cashier";
    tables.pos_transactions = [tx("a")];
    expect(await listSalesMissingFiscalReceipt()).toEqual({ ok: false, sales: [] });
    role = "manager";
    expect((await listSalesMissingFiscalReceipt()).sales).toHaveLength(1);
  });

  it("returns nothing when FiscalNet is not active for the org", async () => {
    tables.organisations[0].fiscalnet_enabled = false;
    tables.pos_transactions = [tx("a")];
    expect(await listSalesMissingFiscalReceipt()).toEqual({ ok: false, sales: [] });
  });

  it("queries the active site, completed, required, recoverable statuses, 2 min to 7 days old", async () => {
    tables.pos_transactions = [tx("a")];
    await listSalesMissingFiscalReceipt();
    const q = queries.find((x) => x.table === "pos_transactions")!;
    const f = Object.fromEntries(q.filters.map(([op, col, v]) => [`${op}:${col}`, v]));
    expect(f["eq:organisation_id"]).toBe("org-1");
    expect(f["eq:site_id"]).toBe("site-1");
    expect(f["eq:status"]).toBe("completed");
    expect(f["eq:fiscal_receipt_required"]).toBe(true);
    expect(f["in:fiscal_receipt_status"]).toEqual(["api_pending", "failed"]);
    const lte = Date.parse(f["lte:sold_at"] as string);
    const gte = Date.parse(f["gte:sold_at"] as string);
    expect(Date.now() - lte).toBeGreaterThanOrEqual(2 * 60_000 - 1000);
    expect(Date.now() - gte).toBeLessThanOrEqual(7 * 24 * 60 * 60_000 + 1000);
  });

  it("drops sales that already have a real success attempt, keeps ones with only mock or failed attempts", async () => {
    tables.pos_transactions = [tx("a"), tx("b", { fiscal_receipt_status: "failed" }), tx("c", { fiscal_receipt_status: "failed" })];
    tables.fiscal_receipt_attempts = [
      { organisation_id: "org-1", transaction_id: "b", status: "success", mock_mode: false, attempt_number: 2 },
      { organisation_id: "org-1", transaction_id: "c", status: "mock_success", mock_mode: true, attempt_number: 1 },
      { organisation_id: "org-1", transaction_id: "c", status: "failed", mock_mode: false, attempt_number: 2 },
    ];
    const res = await listSalesMissingFiscalReceipt();
    expect(res.sales.map((s) => s.id)).toEqual(["a", "c"]);
    expect(res.sales[0]).toEqual({ id: "a", transaction_number: "KO-a", sold_at: tables.pos_transactions[0].sold_at, total: 27, status: "api_pending" });
  });
});

describe("getFiscalRetryPayload", () => {
  beforeEach(() => {
    tables.pos_transactions = [tx("a")];
    tables.pos_transaction_items = [
      { organisation_id: "org-1", transaction_id: "a", product_name: "Flat white", quantity: "2.000000", unit_price: "12.00", vat_rate: "11", discount_pct: "0.0000" },
      { organisation_id: "org-1", transaction_id: "a", product_name: "Lapte vegetal", quantity: "1.000000", unit_price: "3.00", vat_rate: "0", discount_pct: "0.0000" },
    ];
  });

  it("is owner/manager only", async () => {
    role = "cashier";
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: false });
  });

  it("returns the live-path payload: items, total, payment type and code, attempt 1 when none exist", async () => {
    expect(await getFiscalRetryPayload("a")).toEqual({
      ok: true,
      transactionId: "a",
      transactionNumber: "KO-a",
      items: [
        { productName: "Flat white", quantity: 2, unitPrice: 12, vatRate: 11, fiscalNetGroup: 2 },
        { productName: "Lapte vegetal", quantity: 1, unitPrice: 3, vatRate: 0, fiscalNetGroup: 5 },
      ],
      total: 27,
      paymentType: "cash",
      paymentCode: 1,
      attemptNumber: 1,
      mockMode: false,
    });
  });

  it("next attempt number is count + 1", async () => {
    tables.pos_transactions = [tx("a", { fiscal_receipt_status: "failed" })];
    tables.fiscal_receipt_attempts = [
      { organisation_id: "org-1", transaction_id: "a", status: "failed", mock_mode: false, attempt_number: 1 },
      { organisation_id: "org-1", transaction_id: "a", status: "failed", mock_mode: false, attempt_number: 2 },
    ];
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: true, attemptNumber: 3 });
  });

  it("refuses when a success attempt exists or the status moved on", async () => {
    tables.fiscal_receipt_attempts = [{ organisation_id: "org-1", transaction_id: "a", status: "success", mock_mode: false, attempt_number: 1 }];
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: false });
    tables.fiscal_receipt_attempts = [];
    for (const s of ["success", "ambiguous", "timeout", "pending"]) {
      tables.pos_transactions = [tx("a", { fiscal_receipt_status: s })];
      expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: false });
    }
  });

  it("refuses voided, too recent, and other-site sales", async () => {
    tables.pos_transactions = [tx("a", { status: "voided" })];
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: false });
    tables.pos_transactions = [tx("a", { sold_at: ago(1) })];
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: false });
    tables.pos_transactions = [tx("a", { site_id: "site-2" })];
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: false });
  });

  it("falls back to payment type 'other' and no code when the sale has no method", async () => {
    tables.pos_transactions = [tx("a", { payment_method_id: null, payment_methods: null })];
    expect(await getFiscalRetryPayload("a")).toMatchObject({ ok: true, paymentType: "other", paymentCode: null });
  });
});
