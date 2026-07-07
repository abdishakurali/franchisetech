import type { SupabaseClient } from "@supabase/supabase-js";

type SalesReportItem = {
  product_name: string;
  quantity: number | null;
  line_total: number | null;
  vat_rate: number | null;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
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
  const txBaseQuery = supabase
    .from("pos_transactions")
    .select("*,payment_methods(name),pos_transaction_items(product_name,quantity,line_total,vat_rate,net_amount,vat_amount,gross_amount)")
    .eq("organisation_id", orgId)
    .neq("status", "voided")
    .gte("sold_at", periodStart)
    .lte("sold_at", periodEnd);
  const txQuery = hasSites ? txBaseQuery.in("site_id", siteIds) : txBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000");
  const { data: transactions } = await txQuery;

  const items: SalesReportItem[] = (transactions ?? []).flatMap(
    (tx) => (tx as unknown as { pos_transaction_items?: SalesReportItem[] }).pos_transaction_items ?? []
  );

  const byProduct = new Map<string, { qty: number; total: number }>();
  for (const item of items) {
    const row = byProduct.get(item.product_name) ?? { qty: 0, total: 0 };
    row.qty += Number(item.quantity ?? 0);
    row.total += Number(item.gross_amount ?? item.line_total ?? 0);
    byProduct.set(item.product_name, row);
  }
  const productRows = [...byProduct.entries()].map(([name, row]) => ({ name, ...row })).sort((a, b) => b.total - a.total);

  const byPayment = new Map<string, number>();
  for (const tx of transactions ?? []) {
    const methodName = (tx.payment_methods as { name?: string } | null)?.name ?? unknownLabel;
    byPayment.set(methodName, (byPayment.get(methodName) ?? 0) + Number(tx.total ?? 0));
  }

  const vatByRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const item of items) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = vatByRate.get(rate) ?? { net: 0, vat: 0, gross: 0 };
    entry.net += net;
    entry.vat += vat;
    entry.gross += gross;
    vatByRate.set(rate, entry);
  }

  const sum = (getter: (tx: NonNullable<typeof transactions>[number]) => number) => (transactions ?? []).reduce((s, tx) => s + getter(tx), 0);
  const totalGross = sum((tx) => Number(tx.total_gross ?? tx.total ?? 0));
  const totalNet = sum((tx) => Number(tx.subtotal_net ?? 0));
  const totalVat = sum((tx) => Number(tx.tax_total ?? 0));
  const totalTips = sum((tx) => Number(tx.tip_amount ?? 0));
  const totalDiscounts = sum((tx) => Number(tx.discount_total ?? 0));

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
    grossExTips: totalGross - totalTips,
    transactionCount: transactions?.length ?? 0,
    voidedCount: voidedCount ?? 0,
  };
}
