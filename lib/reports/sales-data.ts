import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll, PAYMENT_EVENT_KEYS, SALES_LINE_KEYS } from "@/lib/supabase/fetch-all";

type SalesReportItem = {
  transaction_id: string;
  product_name: string;
  quantity: number | null;
  vat_rate: number | null;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
  direction: number;
};

export type SalesReportData = {
  productRows: Array<{ name: string; qty: number; total: number }>;
  byPayment: Map<string, number>;
  vatByRate: Map<number, { net: number; vat: number; gross: number }>;
  totalGross: number;
  totalNet: number;
  totalVat: number;
  totalTips: number;
  totalDiscounts: number;
  grossExTips: number;
  transactionCount: number;
  voidedCount: number;
};

/** Shared Sales report aggregation, used by both the page and the PDF export. */
export async function computeSalesReport(
  supabase: SupabaseClient,
  orgId: string,
  siteIds: string[],
  periodStart: string,
  periodEnd: string,
  unknownLabel: string,
): Promise<SalesReportData> {
  const hasSites = siteIds.length > 0;
  const { data: lineRows } = await fetchAll<SalesReportItem>(() => {
    const linesBaseQuery = supabase
      .from("canonical_sales_lines")
      .select("transaction_id,transaction_item_id,transaction_number,sold_at,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,direction")
      .eq("organisation_id", orgId)
      .gte("sold_at", periodStart)
      .lte("sold_at", periodEnd);
    return hasSites ? linesBaseQuery.in("site_id", siteIds) : linesBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000");
  }, { keys: SALES_LINE_KEYS });
  const items = lineRows ?? [];

  const byProduct = new Map<string, { qty: number; total: number }>();
  for (const item of items) {
    const row = byProduct.get(item.product_name) ?? { qty: 0, total: 0 };
    row.qty += Number(item.quantity ?? 0);
    row.total += Number(item.gross_amount ?? 0);
    byProduct.set(item.product_name, row);
  }
  const productRows = [...byProduct.entries()].map(([name, row]) => ({ name, ...row })).sort((a, b) => b.total - a.total);

  const { data: paymentRows } = await fetchAll<{ method: string | null; amount: number | null }>(() => {
    const paymentBaseQuery = supabase
      .from("canonical_payment_events")
      .select("method,amount,occurred_at,idempotency_key")
      .eq("organisation_id", orgId)
      .gte("occurred_at", periodStart)
      .lte("occurred_at", periodEnd);
    return hasSites ? paymentBaseQuery.in("site_id", siteIds) : paymentBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000");
  }, { keys: PAYMENT_EVENT_KEYS });
  const byPayment = new Map<string, number>();
  for (const payment of paymentRows ?? []) {
    const methodName = payment.method || unknownLabel;
    byPayment.set(methodName, (byPayment.get(methodName) ?? 0) + Number(payment.amount ?? 0));
  }

  const vatByRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const item of items) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = vatByRate.get(rate) ?? { net: 0, vat: 0, gross: 0 };
    entry.net += net;
    entry.vat += vat;
    entry.gross += gross;
    vatByRate.set(rate, entry);
  }

  const { data: transactions } = await fetchAll<{ id: string; tip_amount: number | null; discount_total: number | null }>(() => {
    const txBaseQuery = supabase
      .from("pos_transactions")
      .select("id,sold_at,tip_amount,discount_total")
      .eq("organisation_id", orgId)
      .neq("status", "voided")
      .gte("sold_at", periodStart)
      .lte("sold_at", periodEnd);
    return hasSites ? txBaseQuery.in("site_id", siteIds) : txBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000");
  }, { keys: ["sold_at", "id"] });
  const totalNet = items.reduce((sum, item) => sum + Number(item.net_amount ?? 0), 0);
  const totalVat = items.reduce((sum, item) => sum + Number(item.vat_amount ?? 0), 0);
  const grossExTips = items.reduce((sum, item) => sum + Number(item.gross_amount ?? 0), 0);
  const totalTips = (transactions ?? []).reduce((sum, tx) => sum + Number(tx.tip_amount ?? 0), 0);
  const totalDiscounts = (transactions ?? []).reduce((sum, tx) => sum + Number(tx.discount_total ?? 0), 0);
  const totalGross = grossExTips + totalTips;

  const { count: voidedCount } = await supabase
    .from("pos_transactions")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("status", "voided")
    .gte("sold_at", periodStart)
    .lte("sold_at", periodEnd);

  return {
    productRows,
    byPayment,
    vatByRate,
    totalGross,
    totalNet,
    totalVat,
    totalTips,
    totalDiscounts,
    grossExTips,
    transactionCount: new Set(items.filter((item) => item.direction > 0).map((item) => item.transaction_id)).size,
    voidedCount: voidedCount ?? 0,
  };
}
