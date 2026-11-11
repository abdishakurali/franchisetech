import { describe, expect, it } from "vitest";
import { fakePostgrest } from "@/lib/supabase/fake-postgrest";
import { computeSalesReport } from "@/lib/reports/sales-data";

const ORG = "org-1";
const SITE = "site-1";

/** A busy month: 4,500 receipts, ~11,000 lines, returns, two payment methods. */
function month() {
  const lines: Array<Record<string, unknown>> = [];
  const payments: Array<Record<string, unknown>> = [];
  const txs: Array<Record<string, unknown>> = [];
  const base = Date.parse("2026-10-01T07:00:00.000Z");
  let item = 0;
  for (let t = 0; t < 4500; t += 1) {
    const at = new Date(base + Math.floor(t / 150) * 86_400_000 + (t % 150) * 240_000).toISOString();
    const n = 1 + (t % 4);
    let gross = 0;
    for (let k = 0; k < n; k += 1) {
      const g = 7 + ((t + k) % 9);
      gross += g;
      lines.push({ organisation_id: ORG, site_id: SITE, transaction_id: `tx-${t}`, transaction_item_id: `it-${String(item).padStart(6, "0")}`, transaction_number: `B${t}`, sold_at: at, product_name: `P${(t + k) % 23}`, quantity: 1, vat_rate: k % 2 ? 21 : 11, net_amount: g / 1.11, vat_amount: g - g / 1.11, gross_amount: g, direction: 1 });
      if (t % 97 === 0 && k === 0) {
        lines.push({ organisation_id: ORG, site_id: SITE, transaction_id: `tx-${t}`, transaction_item_id: `it-${String(item).padStart(6, "0")}`, transaction_number: `R${t}`, sold_at: at, product_name: `P${(t + k) % 23}`, quantity: -1, vat_rate: 11, net_amount: -g / 1.11, vat_amount: -(g - g / 1.11), gross_amount: -g, direction: -1 });
      }
      item += 1;
    }
    payments.push({ organisation_id: ORG, site_id: SITE, method: t % 3 ? "card" : "cash", amount: gross, occurred_at: at, idempotency_key: `pay-${t}` });
    txs.push({ id: `tx-${String(t).padStart(5, "0")}`, organisation_id: ORG, site_id: SITE, status: "completed", sold_at: at, tip_amount: t % 10 === 0 ? 2 : 0, discount_total: t % 25 === 0 ? 1.5 : 0 });
  }
  return { lines, payments, txs };
}

describe("computeSalesReport over more than 1000 rows", () => {
  it("counts every line, payment and receipt of a busy month", async () => {
    const { lines, payments, txs } = month();
    expect(lines.length).toBeGreaterThan(10_000);
    const { client } = fakePostgrest({ canonical_sales_lines: lines, canonical_payment_events: payments, pos_transactions: txs });
    const r = await computeSalesReport(client, ORG, [SITE], "2026-10-01T00:00:00.000Z", "2026-10-31T23:59:59.999Z", "?");

    const sum = (rows: Array<Record<string, unknown>>, col: string) => rows.reduce((s, x) => s + Number(x[col] ?? 0), 0);
    expect(r.grossExTips.toFixed(2)).toBe(sum(lines, "gross_amount").toFixed(2));
    expect(r.transactionCount).toBe(4500);
    expect(r.totalTips.toFixed(2)).toBe(sum(txs, "tip_amount").toFixed(2));
    expect(r.totalDiscounts.toFixed(2)).toBe(sum(txs, "discount_total").toFixed(2));
    const paid = [...r.byPayment.values()].reduce((s, v) => s + v, 0);
    expect(paid.toFixed(2)).toBe(sum(payments, "amount").toFixed(2));
    const vatGross = [...r.vatByRate.values()].reduce((s, v) => s + v.gross, 0);
    expect(vatGross.toFixed(2)).toBe(sum(lines, "gross_amount").toFixed(2));
  });
});
