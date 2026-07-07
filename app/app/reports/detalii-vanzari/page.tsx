import Link from "next/link";
import { FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

type LineItem = {
  product_id: string | null;
  product_name: string;
  quantity: number | null;
  vat_rate: number | null;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
  line_total: number | null;
  discount_amount: number | null;
};

type TransactionRow = {
  id: string;
  status: string;
  total_gross: number | null;
  total: number | null;
  payment_method_id: string | null;
  pos_transaction_items: LineItem[];
};

export default async function DetaliiVanzariReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const labels = t.reportPages.detaliiVanzari;
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = params?.from ?? monthStart;
  const to = params?.to ?? today;

  // Filtered on pos_transactions.sold_at (the real sale date), not
  // pos_transaction_items.created_at -- for migrated historical sales,
  // created_at is the bulk-import timestamp, not the real sale date.
  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select(`
      id,
      status,
      total_gross,
      total,
      payment_method_id,
      pos_transaction_items(product_id,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,line_total,discount_amount)
    `)
    .eq("organisation_id", orgId)
    .gte("sold_at", `${from}T00:00:00Z`)
    .lte("sold_at", `${to}T23:59:59Z`);

  const rows = (transactions ?? []) as TransactionRow[];
  const completed = rows.filter((r) => r.status !== "voided");
  const voided = rows.filter((r) => r.status === "voided");

  // Resolve product -> category name for the itemized breakdown.
  const productIds = [
    ...new Set(completed.flatMap((tx) => (tx.pos_transaction_items ?? []).map((i) => i.product_id).filter(Boolean))),
  ] as string[];
  const productCategoryMap = new Map<string, string | null>();
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id,category_id")
      .in("id", productIds);
    const categoryIds = [...new Set((products ?? []).map((p) => p.category_id).filter(Boolean))] as string[];
    const categoryNameById = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("product_categories")
        .select("id,name")
        .in("id", categoryIds);
      for (const c of categories ?? []) categoryNameById.set(c.id, c.name);
    }
    for (const p of products ?? []) {
      productCategoryMap.set(p.id, p.category_id ? categoryNameById.get(p.category_id) ?? null : null);
    }
  }

  // Itemized by (category, product)
  const byProduct = new Map<
    string,
    { category: string; product: string; qty: number; net: number; vat: number; gross: number; discount: number }
  >();
  for (const tx of completed) {
    for (const item of tx.pos_transaction_items ?? []) {
      const category = (item.product_id ? productCategoryMap.get(item.product_id) : null) ?? "—";
      const key = `${category}::${item.product_name}`;
      const entry = byProduct.get(key) ?? { category, product: item.product_name, qty: 0, net: 0, vat: 0, gross: 0, discount: 0 };
      const gross = Number(item.gross_amount ?? item.line_total ?? 0);
      const vat = Number(item.vat_amount ?? 0);
      const net = Number(item.net_amount ?? gross - vat);
      entry.qty += Number(item.quantity ?? 0);
      entry.net += net;
      entry.vat += vat;
      entry.gross += gross;
      entry.discount += Number(item.discount_amount ?? 0);
      byProduct.set(key, entry);
    }
  }
  const itemizedRows = Array.from(byProduct.values()).sort(
    (a, b) => a.category.localeCompare(b.category) || b.gross - a.gross
  );

  // VAT breakdown by rate (same computation as the VAT report, for consistency)
  const byRate = new Map<number, { net: number; vat: number; gross: number; count: number }>();
  for (const tx of completed) {
    for (const item of tx.pos_transaction_items ?? []) {
      const rate = Number(item.vat_rate ?? 0);
      const gross = Number(item.gross_amount ?? item.line_total ?? 0);
      const vat = Number(item.vat_amount ?? 0);
      const net = Number(item.net_amount ?? gross - vat);
      const entry = byRate.get(rate) ?? { net: 0, vat: 0, gross: 0, count: 0 };
      entry.net += net;
      entry.vat += vat;
      entry.gross += gross;
      entry.count++;
      byRate.set(rate, entry);
    }
  }

  const totNet = itemizedRows.reduce((s, r) => s + r.net, 0);
  const totVat = itemizedRows.reduce((s, r) => s + r.vat, 0);
  const totGross = itemizedRows.reduce((s, r) => s + r.gross, 0);
  const totDiscount = itemizedRows.reduce((s, r) => s + r.discount, 0);
  const voidedValue = voided.reduce((s, tx) => s + Number(tx.total_gross ?? tx.total ?? 0), 0);

  // Payment method breakdown
  const paymentMethodIds = [...new Set(completed.map((tx) => tx.payment_method_id).filter(Boolean))] as string[];
  const paymentNameById = new Map<string, string>();
  if (paymentMethodIds.length > 0) {
    const { data: methods } = await supabase.from("payment_methods").select("id,name").in("id", paymentMethodIds);
    for (const m of methods ?? []) paymentNameById.set(m.id, m.name);
  }
  const byPayment = new Map<string, number>();
  for (const tx of completed) {
    const name = tx.payment_method_id ? paymentNameById.get(tx.payment_method_id) ?? t.common.unknown : t.common.unknown;
    byPayment.set(name, (byPayment.get(name) ?? 0) + Number(tx.total_gross ?? tx.total ?? 0));
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.title}</h1>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath="/app/reports/detalii-vanzari" from={from} to={to} />
          <Link
            href={`/api/reports/detalii-vanzari/pdf?from=${from}&to=${to}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            {t.common.downloadPdf}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.netSales}</CardTitle></CardHeader><CardContent className="text-xl font-bold">{formatMoney(totNet, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.vatCollected}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-blue-600">{formatMoney(totVat, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.grossSales}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-green-600">{formatMoney(totGross, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.discountsGiven}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-amber-600">−{formatMoney(totDiscount, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.transactionCount}</CardTitle></CardHeader><CardContent className="text-xl font-bold">{completed.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.voidedCount}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-red-600">{voided.length}</CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{labels.itemizedTitle}</CardTitle>
          <p className="text-xs text-slate-500">{from} → {to}</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {itemizedRows.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{labels.noData}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{labels.nrCrt}</TableHead>
                  <TableHead>{labels.category}</TableHead>
                  <TableHead>{labels.product}</TableHead>
                  <TableHead className="text-right">{labels.qty}</TableHead>
                  <TableHead className="text-right">{t.tables.net}</TableHead>
                  <TableHead className="text-right">{t.tables.vat}</TableHead>
                  <TableHead className="text-right">{t.tables.gross}</TableHead>
                  <TableHead className="text-right">{labels.discount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemizedRows.map((r, idx) => (
                  <TableRow key={`${r.category}-${r.product}`}>
                    <TableCell className="text-right tabular-nums text-slate-500">{idx + 1}</TableCell>
                    <TableCell className="text-slate-500">{r.category}</TableCell>
                    <TableCell className="font-medium">{r.product}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(r.net, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(r.vat, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatMoney(r.gross, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums text-amber-600">{r.discount > 0 ? `−${formatMoney(r.discount, currency)}` : "—"}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={3} className="text-right">{labels.total}:</TableCell>
                  <TableCell />
                  <TableCell className="text-right tabular-nums">{formatMoney(totNet, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totVat, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totGross, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums text-amber-600">{totDiscount > 0 ? `−${formatMoney(totDiscount, currency)}` : "—"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{labels.vatBreakdownTitle}</CardTitle></CardHeader>
        <CardContent>
          {byRate.size === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{labels.noData}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="text-left py-2">{t.reportPages.zReport.rate}</th>
                  <th className="text-right py-2">{t.tables.net}</th>
                  <th className="text-right py-2">{t.tables.vat}</th>
                  <th className="text-right py-2">{t.tables.gross}</th>
                  <th className="text-right py-2">{labels.transactionCount}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(byRate.entries()).sort(([a], [b]) => a - b).map(([rate, v]) => (
                  <tr key={rate} className="border-b last:border-0">
                    <td className="py-2"><Badge variant="outline">{rate}%</Badge></td>
                    <td className="text-right py-2">{formatMoney(v.net, currency)}</td>
                    <td className="text-right py-2 font-medium">{formatMoney(v.vat, currency)}</td>
                    <td className="text-right py-2">{formatMoney(v.gross, currency)}</td>
                    <td className="text-right py-2 text-slate-500">{v.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{labels.paymentBreakdownTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {byPayment.size === 0 ? (
              <p className="text-slate-400 text-center py-4">{labels.noData}</p>
            ) : (
              Array.from(byPayment.entries()).map(([name, total]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-slate-600">{name}</span>
                  <span className="font-semibold">{formatMoney(total, currency)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{labels.voidedTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.voidedCount}</span>
              <span className="font-semibold">{voided.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.voidedValue}</span>
              <span className="font-semibold text-red-600">{formatMoney(voidedValue, currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 pt-8 print:mt-12">
        <div>
          <p className="text-xs text-slate-500 mb-8">{labels.preparedBy}</p>
          <div className="border-t border-slate-300 pt-1 text-xs text-slate-400">{labels.nameDate}</div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-8">{labels.accountantSignature}</p>
          <div className="border-t border-slate-300 pt-1 text-xs text-slate-400">{labels.nameDate}</div>
        </div>
      </div>
    </div>
  );
}
