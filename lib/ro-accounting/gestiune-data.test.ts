import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { computeGestiuneReport } from "@/lib/ro-accounting/gestiune-data";
import { fetchOpeningStock, type VatBucket } from "@/lib/ro-accounting/opening-stock";

const ORG = "org-1";
const LABELS = {
  openingBalance: "Sold la începutul perioadei",
  unknownSupplier: "Furnizor necunoscut",
  rawConsumption: "Consum materii prime",
  zReportItems: (n: number) => `Raport Z (${n} articole)`,
};

const PRODUCTS = [
  { id: "p-milk", organisation_id: ORG, name: "Lapte", vat_rate: 11 },
  { id: "p-beans", organisation_id: ORG, name: "Cafea boabe", vat_rate: 21 },
  { id: "p-sugar", organisation_id: ORG, name: "Zahăr", vat_rate: 5 },
  { id: "p-water", organisation_id: ORG, name: "Apă", vat_rate: 0 },
];

type Row = Record<string, unknown>;
let seq = 0;
const mv = (product_id: string | null, movement_type: string, quantity_change: number | null, unit_cost: number | null, performed_at: string): Row => ({
  id: `m-${String(seq++).padStart(5, "0")}`,
  organisation_id: ORG,
  product_id,
  movement_type,
  quantity_change,
  unit_cost,
  performed_at,
});

/**
 * Two consecutive months with every movement type the ledger holds, plus the
 * NIR-vs-ledger mismatches seen in real data: a NIR dated 30 Sep but posted
 * 2 Oct, a NIR with received quantity below invoiced, and a purchase VAT rate
 * different from the product's sale VAT rate.
 */
function buildFixture() {
  seq = 0;
  const movements: Row[] = [
    // History before October.
    mv("p-beans", "opening", 10, 80, "2026-08-01T08:00:00+00:00"),
    mv("p-milk", "purchase_received", 40, 4.5, "2026-09-05T09:00:00+00:00"),
    mv("p-milk", "sale_used", -12, 4.5, "2026-09-20T10:00:00+00:00"),
    mv("p-sugar", "purchase_received", 20, 3, "2026-09-10T09:00:00+00:00"),
    // NIR dated 2026-09-30 (September purchases table) but posted 2 Oct.
    mv("p-beans", "purchase_received", 5, 82, "2026-10-02T07:30:00+00:00"),
    // October.
    mv("p-milk", "purchase_received", 30, 4.6, "2026-10-06T09:00:00+00:00"),
    // Invoiced 10 kg sugar, received 8.
    mv("p-sugar", "purchase_received", 8, 3.2, "2026-10-08T09:00:00+00:00"),
    mv("p-milk", "sale_used", -9.5, 4.55, "2026-10-07T12:00:00+00:00"),
    mv("p-beans", "sale_used", -2.25, 80.7, "2026-10-07T13:00:00+00:00"),
    mv("p-beans", "sale_used", 0.25, 80.7, "2026-10-07T13:05:00+00:00"), // reversal
    mv("p-milk", "manual_adjustment", 6, 4.55, "2026-10-15T18:00:00+00:00"), // stock count found more
    mv("p-sugar", "manual_adjustment", -1.5, 3.1, "2026-10-15T18:00:00+00:00"),
    mv("p-milk", "wastage", -2, 4.55, "2026-10-20T21:00:00+00:00"),
    mv("p-water", "opening", 24, 1.2, "2026-10-21T08:00:00+00:00"),
    mv("p-milk", "return", 1, 4.55, "2026-10-22T11:00:00+00:00"),
    mv("p-beans", "invoice_sale", -1, 80.7, "2026-10-23T11:00:00+00:00"),
    mv("p-beans", "invoice_return", 0.5, 80.7, "2026-10-24T11:00:00+00:00"),
    mv("p-water", "free_issue", -6, 1.2, "2026-10-25T11:00:00+00:00"),
    mv("p-milk", "sale_used", -3, null, "2026-10-26T11:00:00+00:00"), // unknown cost
    mv("p-sugar", "sale_used", -0.4, 3.13, "2026-10-31T23:59:59.999+00:00"),
    // November (boundary row first).
    mv("p-milk", "manual_adjustment", 2, 4.58, "2026-11-01T00:00:00+00:00"),
    mv("p-milk", "sale_used", -11, 4.58, "2026-11-03T12:00:00+00:00"),
    mv("p-beans", "purchase_received", 3, 85, "2026-11-04T09:00:00+00:00"),
    mv("p-beans", "wastage", -0.3, 81.4, "2026-11-12T22:00:00+00:00"),
    mv("p-water", "manual_adjustment", -18, 1.2, "2026-11-29T20:00:00+00:00"),
  ];

  const purchases: Row[] = [
    { id: "pu-sep-a", organisation_id: ORG, status: "posted", purchase_date: "2026-09-05", supplier: "Lactate SRL", invoice_number: "F1", total_amount: 180, tax_total: 0, purchase_items: [{ tax_rate: 11, total_cost: 180 }] },
    { id: "pu-sep-b", organisation_id: ORG, status: "posted", purchase_date: "2026-09-10", supplier: "Dulce SRL", invoice_number: "F2", total_amount: 60, tax_total: 0, purchase_items: [{ tax_rate: 5, total_cost: 60 }] },
    { id: "pu-sep-c", organisation_id: ORG, status: "posted", purchase_date: "2026-09-30", supplier: "Prăjitoria SRL", invoice_number: "F3", total_amount: 410, tax_total: 0, purchase_items: [{ tax_rate: 21, total_cost: 410 }] },
    // Bought milk at 21% VAT while the product sells at 11%.
    { id: "pu-oct-a", organisation_id: ORG, status: "posted", purchase_date: "2026-10-06", supplier: "Lactate SRL", invoice_number: "F4", total_amount: 138, tax_total: 0, purchase_items: [{ tax_rate: 21, total_cost: 138 }] },
    { id: "pu-oct-b", organisation_id: ORG, status: "received", purchase_date: "2026-10-08", supplier: null, invoice_number: null, total_amount: 32, tax_total: 0, purchase_items: [{ tax_rate: 5, total_cost: 32 }] },
    { id: "pu-oct-draft", organisation_id: ORG, status: "draft", purchase_date: "2026-10-09", supplier: "Ciornă", invoice_number: "X", total_amount: 999, tax_total: 0, purchase_items: [{ tax_rate: 21, total_cost: 999 }] },
    { id: "pu-nov-a", organisation_id: ORG, status: "posted", purchase_date: "2026-11-04", supplier: "Prăjitoria SRL", invoice_number: "F5", total_amount: 255, tax_total: 0, purchase_items: [{ tax_rate: 21, total_cost: 255 }] },
  ];

  return { movements, purchases };
}

// Minimal in-memory PostgREST stand-in for exactly the calls the report makes.
const ts = (v: unknown) => Date.parse(String(v));
const unquote = (v: string) => v.replace(/^"|"$/g, "");

function fakeSupabase(tables: Record<string, Row[]>) {
  let bc = 0;
  const from = (table: string) => {
    const filters: Array<(r: Row) => boolean> = [];
    const orders: string[] = [];
    let select = "*";
    let limit = Infinity;
    let single = false;
    const run = () => {
      if (select.includes(".sum()")) {
        return { data: null, error: { code: "PGRST123", message: "Use of aggregate functions is not allowed" } };
      }
      let rows = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
      rows = [...rows].sort((a, z) => {
        for (const c of orders) {
          const d = c === "performed_at" || c === "purchase_date" ? ts(a[c]) - ts(z[c]) : String(a[c]).localeCompare(String(z[c]));
          if (d !== 0) return d;
        }
        return 0;
      });
      rows = rows.slice(0, Math.min(limit, 1000));
      if (single) return { data: rows[0] ?? null, error: null };
      return { data: rows, error: null };
    };
    const b = {
      select(s: string) { select = s; return b; },
      eq(c: string, v: unknown) { filters.push((r) => r[c] === v); return b; },
      in(c: string, vs: unknown[]) { filters.push((r) => vs.includes(r[c])); return b; },
      gte(c: string, v: string) { filters.push((r) => ts(r[c]) >= ts(v)); return b; },
      lte(c: string, v: string) { filters.push((r) => ts(r[c]) <= ts(v)); return b; },
      lt(c: string, v: string) { filters.push((r) => ts(r[c]) < ts(v)); return b; },
      or(expr: string) {
        const m = expr.match(/^performed_at\.gt\.("[^"]*"),and\(performed_at\.eq\.("[^"]*"),id\.gt\.("[^"]*")\)$/);
        if (!m) throw new Error(`unsupported or(): ${expr}`);
        const [t, id] = [unquote(m[1]), unquote(m[3])];
        filters.push((r) => ts(r.performed_at) > ts(t) || (ts(r.performed_at) === ts(t) && String(r.id) > id));
        return b;
      },
      order(c: string) { orders.push(c); return b; },
      limit(n: number) { limit = n; return b; },
      range(a: number, z: number) { limit = z - a + 1; return b; },
      abortSignal() { return b; },
      maybeSingle() { single = true; return b; },
      single() { single = true; return b; },
      then(resolve: (v: unknown) => void) { resolve(run()); },
    };
    return b;
  };
  const rpc = async () => ({ data: `BC-2026-${String(++bc).padStart(6, "0")}`, error: null });
  return { from, rpc } as unknown as SupabaseClient;
}

function expectSameToTheCent(a: VatBucket, b: VatBucket) {
  for (const k of ["tva19", "tva9", "tva5", "tva0", "total"] as const) {
    expect(a[k]).toBeCloseTo(b[k], 6);
    expect(a[k].toFixed(2)).toBe(b[k].toFixed(2));
  }
}

describe("Raport de gestiune: period continuity", () => {
  const { movements, purchases } = buildFixture();
  const supabase = fakeSupabase({
    stock_movements_reconciled: movements,
    products: PRODUCTS,
    purchases,
    organisations: [{ id: ORG, name: "Cafenea Test", fiscalnet_cif: "RO123" }],
  });

  it("closing stock of October equals opening stock of November", async () => {
    const oct = await computeGestiuneReport(supabase, ORG, "2026-10-01", "2026-10-31", LABELS);
    const nov = await computeGestiuneReport(supabase, ORG, "2026-11-01", "2026-11-30", LABELS);
    expectSameToTheCent(oct.closingStock, nov.openingStock);
    expect(oct.hasUnknownCost).toBe(true);

    // The pre-fix formula (opening + NIR - sale_used only) misses on this data.
    const sum = (type: string) => oct.movements.filter((m) => m.documentType === type).reduce((s, m) => s + m.total, 0);
    const legacyClosing = oct.openingStock.total + sum("nir") - sum("consum");
    expect(Math.abs(legacyClosing - nov.openingStock.total)).toBeGreaterThan(1);
  });

  it("closing stock of November equals the ledger balance on 1 December", async () => {
    const nov = await computeGestiuneReport(supabase, ORG, "2026-11-01", "2026-11-30", LABELS);
    const dec = await fetchOpeningStock(supabase, ORG, "2026-12-01T00:00:00.000Z");
    expectSameToTheCent(nov.closingStock, dec.openingStock);
  });

  it("closing = opening + total intrări - total ieșiri, per VAT bucket", async () => {
    const oct = await computeGestiuneReport(supabase, ORG, "2026-10-01", "2026-10-31", LABELS);
    const t = oct.totals;
    expect(oct.closingStock.tva19).toBeCloseTo(oct.openingStock.tva19 + t.intrari19 - t.iesiri19, 6);
    expect(oct.closingStock.tva9).toBeCloseTo(oct.openingStock.tva9 + t.intrari9 - t.iesiri9, 6);
    expect(oct.closingStock.tva5).toBeCloseTo(oct.openingStock.tva5 + t.intrari5 - t.iesiri5, 6);
    expect(oct.closingStock.tva0).toBeCloseTo(oct.openingStock.tva0 + t.intrari0 - t.iesiri0, 6);
    expect(oct.closingStock.total).toBeCloseTo(oct.openingStock.total + t.intrariTotal - t.iesiriTotal, 6);
  });

  it("keeps NIR rows valued from the purchase documents, unchanged", async () => {
    const oct = await computeGestiuneReport(supabase, ORG, "2026-10-01", "2026-10-31", LABELS);
    const nir = oct.movements.filter((m) => m.documentType === "nir");
    expect(nir.map((m) => m.total)).toEqual([138, 32]); // drafts excluded, as before
    expect(nir[0].tva19).toBe(138); // bucketed by the purchase VAT rate, as before
    expect(nir[1].description).toBe(LABELS.unknownSupplier);
  });

  it("shows the movements that used to be missing as labelled Ajustare rows", async () => {
    const oct = await computeGestiuneReport(supabase, ORG, "2026-10-01", "2026-10-31", LABELS);
    const adj = oct.movements.filter((m) => m.documentType === "ajustare");
    const byDesc = new Map(adj.map((m) => [m.description, m]));
    expect(byDesc.get("Ajustare manuală stoc (plus)")?.tva9).toBeCloseTo(6 * 4.55, 6);
    expect(byDesc.get("Ajustare manuală stoc (minus)")?.tva5).toBeCloseTo(1.5 * 3.1, 6);
    expect(byDesc.get("Pierderi / casare")?.total).toBeCloseTo(2 * 4.55, 6);
    expect(byDesc.get("Sold inițial introdus în perioadă")?.tva0).toBeCloseTo(24 * 1.2, 6);
    expect(byDesc.get("Retur reintrat în stoc")?.total).toBeCloseTo(4.55, 6);
    expect(byDesc.get("Ieșire pe factură")?.total).toBeCloseTo(80.7, 6);
    expect(byDesc.get("Stornare factură (reintrare în stoc)")?.total).toBeCloseTo(0.5 * 80.7, 6);
    expect(byDesc.get("Transfer gratuit")?.total).toBeCloseTo(6 * 1.2, 6);
    for (const m of adj) {
      expect(m.direction === "in" || m.direction === "out").toBe(true);
      for (const k of ["tva19", "tva9", "tva5", "tva0", "total"] as const) expect(m[k]).toBeGreaterThanOrEqual(0);
    }
  });

  it("reconciles NIR documents with what was actually received into stock", async () => {
    const oct = await computeGestiuneReport(supabase, ORG, "2026-10-01", "2026-10-31", LABELS);
    const diffIn = oct.movements.find((m) => m.description === "Diferență recepție în stoc față de NIR (plus)");
    const diffOut = oct.movements.find((m) => m.description === "Diferență recepție în stoc față de NIR (minus)");
    // Ledger: beans 5*82 (posted 2 Oct, NIR dated 30 Sep) @21%, milk 30*4.6 @11%, sugar 8*3.2 @5%.
    // NIR:    milk 138 @21%, sugar 32 @5%.
    expect(diffIn?.tva19).toBeCloseTo(5 * 82 - 138, 6);
    expect(diffIn?.tva9).toBeCloseTo(30 * 4.6, 6);
    expect(diffOut?.tva5).toBeCloseTo(32 - 8 * 3.2, 6);
    expect(diffIn?.date).toBe("2026-10-31");
  });

  it("nets a sale_used reversal against consumption and numbers each consumption day", async () => {
    const oct = await computeGestiuneReport(supabase, ORG, "2026-10-01", "2026-10-31", LABELS);
    const day7 = oct.movements.find((m) => m.documentType === "consum" && m.date === "2026-10-07");
    expect(day7?.tva19).toBeCloseTo(2 * 80.7, 6);
    expect(day7?.tva9).toBeCloseTo(9.5 * 4.55, 6);
    expect(day7?.documentNumber).toMatch(/^BC-2026-/);
    const lastDay = oct.movements.find((m) => m.documentType === "consum" && m.date === "2026-10-31");
    expect(lastDay?.tva5).toBeCloseTo(0.4 * 3.13, 6);
  });
});
