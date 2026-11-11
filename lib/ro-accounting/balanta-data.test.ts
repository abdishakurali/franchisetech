import { describe, expect, it } from "vitest";
import { fakePostgrest } from "@/lib/supabase/fake-postgrest";
import { computeBalantaReport } from "@/lib/ro-accounting/balanta-data";
import { fetchLedgerQtyByProduct } from "@/lib/ro-accounting/opening-stock";

const ORG = "org-1";
const FROM = "2026-10-01";
const TO = "2026-10-31";

const PRODUCTS = [
  { id: "p-milk", organisation_id: ORG, name: "Lapte", unit_of_measure: "l", current_stock_qty: 12, vat_rate: 11, active: true, is_stock_tracked: true, is_ingredient: true },
  { id: "p-beans", organisation_id: ORG, name: "Cafea boabe", unit_of_measure: "kg", current_stock_qty: 3, vat_rate: 21, active: true, is_stock_tracked: true, is_ingredient: true },
  { id: "p-sugar", organisation_id: ORG, name: "Zahăr", unit_of_measure: "kg", current_stock_qty: 0, vat_rate: 5, active: false, is_stock_tracked: true, is_ingredient: false },
];

type Mv = { id: string; organisation_id: string; product_id: string | null; quantity_change: number | null; unit_cost: number | null; movement_type: string; performed_at: string };

/** ~6,000 movements before, during and after October, with null costs,
 * null quantities, a product missing from the catalogue and a 700-row batch
 * on one timestamp. */
function movements(): Mv[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const products = ["p-milk", "p-beans", "p-sugar", "p-gone", null];
  const types = ["purchase_received", "sale_used", "sale_used", "manual_adjustment", "wastage", "opening", "return"];
  const base = Date.parse("2026-05-01T00:00:00.000Z");
  const rows: Mv[] = [];
  for (let i = 0; i < 6000; i += 1) {
    const type = types[Math.floor(rand() * types.length)];
    const inbound = ["purchase_received", "opening", "return"].includes(type) || (type === "manual_adjustment" && rand() < 0.5);
    const qty = Math.round(rand() * 4000) / 1000;
    rows.push({
      id: `m-${String(Math.floor(rand() * 1e6)).padStart(7, "0")}-${i}`,
      organisation_id: i % 333 === 0 ? "org-2" : ORG,
      product_id: products[Math.floor(rand() * products.length)],
      quantity_change: i % 211 === 0 ? null : inbound ? qty : -qty,
      unit_cost: rand() < 0.1 ? null : [2.5, 4.1, 39.9, 0.75][Math.floor(rand() * 4)],
      movement_type: type,
      performed_at: i < 1400 && i % 2 === 0 ? "2026-08-01T00:00:00+00:00" : new Date(base + Math.floor(rand() * 240 * 86_400_000)).toISOString(),
    });
  }
  return rows;
}

/** The pre-change opening-balance and ledger loops, run over every row. */
function legacy(rows: Mv[]) {
  const own = rows.filter((r) => r.organisation_id === ORG);
  const before = own.filter((r) => Date.parse(r.performed_at) < Date.parse(`${FROM}T00:00:00.000Z`));
  const opening = new Map<string, { qty: number; value: number; unknown: boolean }>();
  for (const m of before) {
    if (!m.product_id) continue;
    const o = opening.get(m.product_id) ?? { qty: 0, value: 0, unknown: false };
    const qty = Number(m.quantity_change ?? 0);
    o.qty += qty;
    if (m.unit_cost != null) o.value += qty * m.unit_cost;
    else o.unknown = true;
    opening.set(m.product_id, o);
  }
  const ledger = new Map<string, number>();
  for (const m of own) if (m.product_id) ledger.set(m.product_id, (ledger.get(m.product_id) ?? 0) + Number(m.quantity_change ?? 0));
  return { opening, ledger };
}

describe("balanța: opening balance and ledger quantity from aggregates", () => {
  const rows = movements();
  const ref = legacy(rows);

  for (const aggregates of [true, false]) {
    it(`fetchLedgerQtyByProduct sums the whole history (aggregates ${aggregates ? "on" : "off"})`, async () => {
      const { client } = fakePostgrest({ stock_movements_reconciled: rows }, { aggregates });
      const ledger = await fetchLedgerQtyByProduct(client, ORG);
      expect([...ledger.keys()].sort()).toEqual([...ref.ledger.keys()].sort());
      for (const [id, qty] of ref.ledger) expect(ledger.get(id)).toBeCloseTo(qty, 6);
    });

    it(`report matches the row-by-row result without downloading history (aggregates ${aggregates ? "on" : "off"})`, async () => {
      const { client, calls } = fakePostgrest({ stock_movements_reconciled: rows, products: PRODUCTS }, { aggregates });
      const report = await computeBalantaReport(client, ORG, FROM, TO, "?");
      expect(report.items.length).toBeGreaterThan(0);
      for (const item of report.items) {
        const id = String(item.productId);
        const o = ref.opening.get(id) ?? { qty: 0, value: 0, unknown: false };
        expect(item.openingQty).toBeCloseTo(o.qty, 6);
        expect(item.openingValue.toFixed(2)).toBe(o.value.toFixed(2));
        expect(item.ledgerQty).toBeCloseTo(ref.ledger.get(id) ?? 0, 6);
      }
      expect(report.hasUnknownCost).toBe(true);
      // Row pages fetched without a period filter would mean a whole-history read.
      const rowReads = calls.filter((c) => c.table === "stock_movements_reconciled" && !c.select.includes(".sum()"));
      if (aggregates) expect(rowReads.every((c) => c.filters.includes("performed_at=gte"))).toBe(true);
    });
  }
});
