import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAccessibleSites } from "@/lib/site-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMoney, getKitchenOpsContext, sumRows } from "@/lib/kitchenops/metrics";
import { GrowthReportViewTracker } from "@/components/app/GrowthReportViewTracker";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

export default async function SalesReportPage() {
  const { countryCode, supabase, orgId, currency, membership } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode);
  const rp = t.reportPages.sales;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const week = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Scope report to sites the user can access (owner sees all, restricted users see assigned only)
  const accessibleSites = await listAccessibleSites(supabase, orgId, membership.id, membership.role);
  const siteIds = accessibleSites.map((s) => s.id);

  // Build queries — if user has accessible sites, filter to them; else return empty
  const hasSites = siteIds.length > 0;
  const txBaseQuery = supabase.from("pos_transactions")
    .select("*,payment_methods(name)")
    .eq("organisation_id", orgId)
    .neq("status", "voided")
    .gte("sold_at", month);
  const itemsBaseQuery = supabase.from("pos_transaction_items")
    .select("product_name,quantity,line_total,vat_rate,net_amount,vat_amount,gross_amount,created_at")
    .eq("organisation_id", orgId)
    .gte("created_at", month);

  const txQuery = hasSites ? txBaseQuery.in("site_id", siteIds) : txBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000");
  const itemsQuery = hasSites ? itemsBaseQuery.in("site_id", siteIds) : itemsBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000");
  const [{ data: transactions }, { data: items }] = await Promise.all([txQuery, itemsQuery]);

  const todayTx = (transactions ?? []).filter((tx) => String(tx.sold_at) >= today);
  const weekTx = (transactions ?? []).filter((tx) => String(tx.sold_at) >= week);

  // Product summary
  const byProduct = new Map<string, { qty: number; total: number }>();
  for (const item of items ?? []) {
    const row = byProduct.get(item.product_name) ?? { qty: 0, total: 0 };
    row.qty += Number(item.quantity ?? 0);
    row.total += Number(item.gross_amount ?? item.line_total ?? 0);
    byProduct.set(item.product_name, row);
  }
  const productRows = [...byProduct.entries()].map(([name, row]) => ({ name, ...row })).sort((a, b) => b.total - a.total);

  // Payment method breakdown
  const byPayment = new Map<string, number>();
  for (const tx of transactions ?? []) {
    const methodName = (tx.payment_methods as {name?:string}|null)?.name ?? "Unknown";
    byPayment.set(methodName, (byPayment.get(methodName) ?? 0) + Number(tx.total ?? 0));
  }

  // VAT breakdown by rate
  const vatByRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const item of items ?? []) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = vatByRate.get(rate) ?? { net: 0, vat: 0, gross: 0 };
    entry.net += net; entry.vat += vat; entry.gross += gross;
    vatByRate.set(rate, entry);
  }

  const totalGross = sumRows(transactions, (tx) => Number(tx.total_gross ?? tx.total ?? 0));
  const totalNet = sumRows(transactions, (tx) => Number(tx.subtotal_net ?? 0));
  const totalVat = sumRows(transactions, (tx) => Number(tx.tax_total ?? 0));
  const totalTips = sumRows(transactions, (tx) => Number(tx.tip_amount ?? 0));
  const totalDiscounts = sumRows(transactions, (tx) => Number(tx.discount_total ?? 0));
  const grossExTips = totalGross - totalTips;

  // Voided count for the month
  const { count: voidedCount } = await supabase
    .from("pos_transactions")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("status", "voided")
    .gte("sold_at", month);

  return (
    <div className="space-y-6 p-6">
      <GrowthReportViewTracker />
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{rp.title}</h1>
        <p className="text-sm text-slate-500">{rp.subtitle}</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.today}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(sumRows(todayTx, (tx) => Number(tx.total ?? 0)), currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.thisWeek}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(sumRows(weekTx, (tx) => Number(tx.total ?? 0)), currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.grossExTips}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(grossExTips, currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{t.transactions.title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{transactions?.length ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.voided}</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-red-600">{voidedCount ?? 0}</CardContent></Card>
      </div>

      {totalTips > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap gap-8 text-sm">
            <div><p className="text-slate-500">{rp.grossExTipsShort}</p><p className="text-xl font-semibold text-slate-900">{formatMoney(grossExTips, currency)}</p></div>
            <div><p className="text-slate-500">{rp.tipsCollected}</p><p className="text-xl font-semibold text-amber-700">{formatMoney(totalTips, currency)}</p></div>
            <div><p className="text-slate-500">{rp.totalCollected}</p><p className="text-xl font-bold text-slate-900">{formatMoney(totalGross, currency)}</p></div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>{rp.vatSummary}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{rp.netSales}</p>
              <p className="text-xl font-bold text-slate-900">{formatMoney(totalNet || (grossExTips - totalVat), currency)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-slate-500">{rp.vatCollected}</p>
              <p className="text-xl font-bold text-blue-700">{formatMoney(totalVat, currency)}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-slate-500">{rp.grossInclVat}</p>
              <p className="text-xl font-bold text-green-700">{formatMoney(grossExTips, currency)}</p>
            </div>
          </div>
          {totalDiscounts > 0 && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <p className="text-slate-600">{rp.discountsGiven}</p>
              <p className="text-xl font-bold text-blue-700 mt-1">−{formatMoney(totalDiscounts, currency)}</p>
            </div>
          )}
          {vatByRate.size > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.tables.vatRate}</TableHead>
                  <TableHead className="text-right">{t.tables.net}</TableHead>
                  <TableHead className="text-right">{t.tables.vat}</TableHead>
                  <TableHead className="text-right">{t.tables.gross}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(vatByRate.entries()).sort(([a],[b]) => a - b).map(([rate, v]) => (
                  <TableRow key={rate}>
                    <TableCell><Badge variant="outline">{rate}%</Badge></TableCell>
                    <TableCell className="text-right">{formatMoney(v.net, currency)}</TableCell>
                    <TableCell className="text-right">{formatMoney(v.vat, currency)}</TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(v.gross, currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <Card>
          <CardHeader><CardTitle>{rp.topProducts}</CardTitle></CardHeader>
          <CardContent>
            {productRows.length === 0 ? (
              <p className="text-sm text-slate-400">{rp.noSalesData}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tables.product}</TableHead>
                    <TableHead className="text-right">{t.tables.qty}</TableHead>
                    <TableHead className="text-right">{t.tables.gross}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productRows.slice(0, 10).map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right">{row.qty}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(row.total, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment methods */}
        <Card>
          <CardHeader><CardTitle>{rp.paymentBreakdown}</CardTitle></CardHeader>
          <CardContent>
            {byPayment.size === 0 ? (
              <p className="text-sm text-slate-400">{rp.noSalesData}</p>
            ) : (
              [...byPayment.entries()].map(([name, total]) => (
                <div key={name} className="flex justify-between border-b py-3 text-sm last:border-0">
                  <span className="text-slate-700">{name}</span>
                  <strong className="text-slate-900">{formatMoney(total, currency)}</strong>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
