import Link from "next/link";
import { FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAccessibleSites } from "@/lib/site-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext, sumRows } from "@/lib/kitchenops/metrics";
import { GrowthReportViewTracker } from "@/components/app/GrowthReportViewTracker";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { computeSalesReport } from "@/lib/reports/sales-data";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { countryCode, profileLocale, supabase, orgId, currency, membership } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const rp = t.reportPages.sales;
  const params = await searchParams;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const week = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const todayIso = now.toISOString().slice(0, 10);
  const monthStartIso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const from = params?.from ?? monthStartIso;
  const to = params?.to ?? todayIso;
  const periodStart = `${from}T00:00:00.000Z`;
  const periodEnd = `${to}T23:59:59.999Z`;

  // Scope report to sites the user can access (owner sees all, restricted users see assigned only)
  const accessibleSites = await listAccessibleSites(supabase, orgId, membership.id, membership.role);
  const siteIds = accessibleSites.map((s) => s.id);
  const hasSites = siteIds.length > 0;

  const {
    productRows, byPayment, vatByRate,
    totalGross, totalNet, totalVat, totalTips, totalDiscounts, grossExTips,
    transactionCount, voidedCount,
  } = await computeSalesReport(supabase, orgId, siteIds, periodStart, periodEnd, t.common.unknown);

  // "Today" / "This week" are always live snapshots of the real current
  // day/week, independent of the selected report range -- filtering an
  // already range-scoped dataset would silently show 0 whenever the chosen
  // range doesn't include today.
  const todayBaseQuery = supabase.from("pos_transactions").select("total").eq("organisation_id", orgId).neq("status", "voided").gte("sold_at", today);
  const weekBaseQuery = supabase.from("pos_transactions").select("total").eq("organisation_id", orgId).neq("status", "voided").gte("sold_at", week);
  const { data: todayTx } = await (hasSites ? todayBaseQuery.in("site_id", siteIds) : todayBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000"));
  const { data: weekTx } = await (hasSites ? weekBaseQuery.in("site_id", siteIds) : weekBaseQuery.eq("site_id", "00000000-0000-0000-0000-000000000000"));

  return (
    <div className="space-y-6 p-6">
      <GrowthReportViewTracker />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{rp.title}</h1>
          <p className="text-sm text-slate-500">{rp.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath="/app/reports/sales" from={from} to={to} />
          <Link
            href={`/api/reports/sales/pdf?from=${from}&to=${to}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            {t.common.downloadPdf}
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.today}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(sumRows(todayTx, (tx) => Number(tx.total ?? 0)), currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.thisWeek}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(sumRows(weekTx, (tx) => Number(tx.total ?? 0)), currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.grossExTips}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(grossExTips, currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{t.transactions.title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{transactionCount}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-500">{rp.voided}</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-red-600">{voidedCount}</CardContent></Card>
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
