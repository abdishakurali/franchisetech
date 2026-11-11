import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  computeOpeningStockFromGroups,
  fetchOpeningStock,
  groupMovementsForOpeningStock,
} from "@/lib/ro-accounting/opening-stock";
import {
  fetchStockMovements,
  StockMovementsQueryError,
  stockMovementProduct,
  stockMovementQty,
  stockMovementUnitCost,
  type StockMovementProductRef,
  type StockMovementQueryRow,
} from "@/lib/ro-accounting/stock-movements";

const ORG = "org-1";
const PERIOD_START = "2026-10-01T00:00:00.000Z";

const PRODUCTS: Array<StockMovementProductRef & { id: string; organisation_id: string }> = [
  { id: "p-milk", organisation_id: ORG, name: "Lapte", vat_rate: 11 },
  { id: "p-beans", organisation_id: ORG, name: "Cafea boabe", vat_rate: 21 },
  { id: "p-sugar", organisation_id: ORG, name: "Zahăr", vat_rate: 5 },
  { id: "p-water", organisation_id: ORG, name: "Apă", vat_rate: 0 },
  { id: "p-novat", organisation_id: ORG, name: "Fără TVA setat", vat_rate: null },
];

type Row = StockMovementQueryRow & { id: string; organisation_id: string };

/** Deterministic pseudo-random fixture: purchases, consumption, opening
 * entries, null costs, a product missing from products, many rows sharing
 * one timestamp (a reconciliation batch), and rows on/after period start. */
function buildFixture(): Row[] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
  const productIds = [...PRODUCTS.map((p) => p.id), "p-deleted", null];
  const types = ["purchase_received", "sale_used", "sale_used", "sale_used", "manual_adjustment", "wastage", "opening"];
  const rows: Row[] = [];
  const base = Date.parse("2026-06-01T00:00:00.000Z");
  for (let i = 0; i < 2600; i++) {
    const type = types[Math.floor(rand() * types.length)];
    const qty = Math.round(rand() * 5000) / 1000;
    const sign = type === "purchase_received" || type === "opening" ? 1 : -1;
    const sameBatch = i < 1500 && i % 2 === 0; // 750 rows on one timestamp
    const ts = sameBatch
      ? "2026-07-01T00:00:00+00:00"
      : new Date(base + Math.floor(rand() * 150 * 86_400_000)).toISOString().replace("Z", "+00:00");
    rows.push({
      id: `m-${String(i).padStart(5, "0")}-${Math.floor(rand() * 1e6)}`,
      organisation_id: i === 7 ? "other-org" : ORG,
      product_id: productIds[Math.floor(rand() * productIds.length)],
      quantity_change: i % 97 === 0 ? null : sign * qty,
      unit_cost: rand() < 0.12 ? null : [1.25, 3.4, 12.9, 0.333, 47.5][Math.floor(rand() * 5)],
      movement_type: type,
      performed_at: ts,
    });
  }
  // Exactly on the boundary: must be excluded from opening stock.
  rows.push({ id: "m-boundary", organisation_id: ORG, product_id: "p-milk", quantity_change: 1000, unit_cost: 9, movement_type: "purchase_received", performed_at: "2026-10-01T00:00:00+00:00" });
  return rows;
}

/** The pre-fix computeGestiuneReport loop, verbatim, as the reference. */
function legacyOpeningStock(movementsBeforePeriod: StockMovementQueryRow[]) {
  let hasUnknownCost = false;
  const openingStock = { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };
  for (const m of movementsBeforePeriod) {
    const qty = stockMovementQty(m);
    const cost = stockMovementUnitCost(m);
    if (cost == null) {
      hasUnknownCost = true;
      continue;
    }
    const value = qty * cost;
    const prod = stockMovementProduct(m);
    const vatRate = Number(prod?.vat_rate ?? 21);

    if (vatRate === 21) openingStock.tva19 += value;
    else if (vatRate === 11) openingStock.tva9 += value;
    else if (vatRate === 5) openingStock.tva5 += value;
    else openingStock.tva0 += value;
    openingStock.total += value;
  }
  return { openingStock, hasUnknownCost };
}

function legacyBeforeRows(rows: Row[]): StockMovementQueryRow[] {
  const productMap = new Map(PRODUCTS.map((p) => [p.id, p]));
  return rows
    .filter((r) => r.organisation_id === ORG && Date.parse(r.performed_at) < Date.parse(PERIOD_START))
    .map((r) => ({ ...r, products: r.product_id ? productMap.get(r.product_id) ?? null : null }));
}

// ---------------------------------------------------------------------------
// Minimal in-memory PostgREST stand-in: supports exactly the calls the code
// under test makes (eq / in / gte / lte / lt / the keyset or=() filter /
// order / limit / range / aggregate select), and enforces a 1000-row cap
// like PostgREST's max-rows.
type Filter = (r: Record<string, unknown>) => boolean;
const ts = (v: unknown) => Date.parse(String(v));
const unquote = (v: string) => v.replace(/^"|"$/g, "");

function fakeSupabase(tables: Record<string, Array<Record<string, unknown>>>, opts: { aggregates: boolean }) {
  const calls: Array<{ table: string; select: string }> = [];
  const from = (table: string) => {
    const filters: Filter[] = [];
    const orders: string[] = [];
    let select = "*";
    let limit = Infinity;
    let offset = 0;
    const b = {
      select(s: string) { select = s; calls.push({ table, select: s }); return b; },
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
      range(a: number, z: number) { offset = a; limit = z - a + 1; return b; },
      abortSignal() { return b; },
      then(resolve: (v: unknown) => void) {
        resolve(run());
      },
    };
    const run = () => {
      const isAggregate = select.includes(".sum()");
      if (isAggregate && !opts.aggregates) {
        return { data: null, error: { code: "PGRST123", message: "Use of aggregate functions is not allowed" } };
      }
      let rows = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
      if (isAggregate) {
        const groups = new Map<string, Record<string, unknown>>();
        for (const r of rows) {
          const key = `${r.product_id}|${r.unit_cost}`;
          const g = groups.get(key) ?? { product_id: r.product_id, unit_cost: r.unit_cost, sum: null };
          if (r.quantity_change != null) g.sum = Number(g.sum ?? 0) + Number(r.quantity_change);
          groups.set(key, g);
        }
        rows = [...groups.values()];
      }
      const cmp = (a: unknown, z: unknown) => (a == null ? 1 : z == null ? -1 : a < z ? -1 : a > z ? 1 : 0);
      rows = [...rows].sort((a, z) => {
        for (const c of orders) {
          const d = c === "performed_at" ? ts(a[c]) - ts(z[c]) : cmp(a[c], z[c]);
          if (d !== 0) return d;
        }
        return 0;
      });
      return { data: rows.slice(offset, offset + Math.min(limit, 1000)), error: null };
    };
    return b;
  };
  return { client: { from } as unknown as SupabaseClient, calls };
}

function expectBucketsEqual(a: Record<string, number>, b: Record<string, number>) {
  for (const k of ["tva19", "tva9", "tva5", "tva0", "total"]) {
    expect(a[k]).toBeCloseTo(b[k], 6);
    // What the PDF prints: identical to the cent.
    expect(a[k].toFixed(2)).toBe(b[k].toFixed(2));
  }
}

describe("opening stock (Stoc inițial)", () => {
  const fixture = buildFixture();
  const legacy = legacyOpeningStock(legacyBeforeRows(fixture));

  it("fixture is non-trivial", () => {
    expect(legacyBeforeRows(fixture).length).toBeGreaterThan(2000);
    expect(legacy.hasUnknownCost).toBe(true);
    for (const k of ["tva19", "tva9", "tva5", "tva0"] as const) expect(legacy.openingStock[k]).not.toBe(0);
  });

  it("grouped computation equals the legacy row-by-row result", () => {
    const productMap = new Map(PRODUCTS.map((p) => [p.id, p]));
    const groups = groupMovementsForOpeningStock(legacyBeforeRows(fixture));
    expect(groups.length).toBeLessThan(100);
    const result = computeOpeningStockFromGroups(groups, productMap);
    expectBucketsEqual(result.openingStock, legacy.openingStock);
    expect(result.hasUnknownCost).toBe(legacy.hasUnknownCost);
  });

  for (const aggregates of [true, false]) {
    it(`fetchOpeningStock equals legacy (PostgREST aggregates ${aggregates ? "on" : "off"})`, async () => {
      const { client, calls } = fakeSupabase({ stock_movements_reconciled: fixture, products: PRODUCTS }, { aggregates });
      const result = await fetchOpeningStock(client, ORG, PERIOD_START);
      expectBucketsEqual(result.openingStock, legacy.openingStock);
      expect(result.hasUnknownCost).toBe(legacy.hasUnknownCost);
      const movementCalls = calls.filter((c) => c.table === "stock_movements_reconciled");
      // aggregate: one grouped query. fallback: 1 rejected aggregate + ceil(rows/1000) keyset pages.
      expect(movementCalls.length).toBe(aggregates ? 1 : 1 + Math.ceil(legacyBeforeRows(fixture).length / 1000));
    });
  }
});

describe("fetchStockMovements keyset pagination", () => {
  const fixture = buildFixture();

  it("returns every row exactly once, even across a 750-row shared timestamp", async () => {
    const { client } = fakeSupabase({ stock_movements_reconciled: fixture, products: PRODUCTS }, { aggregates: false });
    const rows = await fetchStockMovements(client, ORG, { before: PERIOD_START });
    const ids = rows.map((r) => (r as Row).id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(legacyBeforeRows(fixture).map((r) => (r as Row).id).sort());
  });

  it("throws instead of returning a partial list when asked to", async () => {
    const failing = {
      from: () => {
        const b: Record<string, unknown> = {};
        for (const m of ["select", "eq", "in", "gte", "lte", "lt", "or", "order", "limit", "range", "abortSignal"]) b[m] = () => b;
        b.then = (resolve: (v: unknown) => void) =>
          resolve({ data: null, error: { message: "canceling statement due to statement timeout" } });
        return b;
      },
    } as unknown as SupabaseClient;
    await expect(fetchStockMovements(failing, ORG, { before: PERIOD_START }, { throwOnError: true })).rejects.toBeInstanceOf(
      StockMovementsQueryError,
    );
    await expect(fetchOpeningStock(failing, ORG, PERIOD_START)).rejects.toBeInstanceOf(StockMovementsQueryError);
  });
});
