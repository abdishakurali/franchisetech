import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown } from "lucide-react";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { requireBusinessModule } from "@/lib/module-guard";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { computeGestiuneReport } from "@/lib/ro-accounting/gestiune-data";

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  stoc_initial: "bg-accent text-foreground",
  nir: "bg-reconciled/15 text-reconciled",
  consum: "bg-red-100 text-red-800",
  vanzare: "bg-purple-100 text-purple-800",
  stoc_final: "bg-accent text-foreground",
  ajustare: "bg-amber-100 text-amber-800",
};

export default async function GestiuneReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  if (!await hasEntitlement(orgId, "reports.gestiune")) redirect("/app/billing?reason=gestiune_requires_pro");
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;

  const labels = t.reportPages.gestiune;

  const { org, movements, totals, openingStock, closingStock, hasUnknownCost } = await computeGestiuneReport(
    supabase,
    orgId,
    fromDate,
    toDate,
    {
      openingBalance: labels.openingBalance,
      unknownSupplier: labels.unknownSupplier,
      rawConsumption: labels.rawConsumption,
      zReportItems: labels.zReportItems,
    },
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath="/app/reports/gestiune" from={fromDate} to={toDate} />
          <Link
            href={`/api/reports/gestiune/pdf?from=${fromDate}&to=${toDate}`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-secondary"
          >
            <FileDown className="h-4 w-4" />
            {labels.downloadPdf}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 print:border-0">
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-muted-foreground">{labels.unitLabel}</p>
            <p className="font-semibold text-foreground">{org?.name ?? "franchisetech"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{labels.period}</p>
            <p className="font-semibold text-foreground">{fromDate} — {toDate}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">{labels.openingStock}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMoney(openingStock.total, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-reconciled">{labels.totalEntries}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-reconciled">{formatMoney(totals.intrariTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-attention">{labels.totalExits}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-attention">{formatMoney(totals.iesiriTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-brass">{labels.closingStock}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-brass">{formatMoney(closingStock.total, currency)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {movements.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">{labels.noData}</p>
              <p className="text-xs text-muted-foreground mt-2">{labels.noDataHint}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{labels.nrCrt}</TableHead>
                  <TableHead>{labels.date}</TableHead>
                  <TableHead>{labels.docType}</TableHead>
                  <TableHead>{labels.docNo}</TableHead>
                  <TableHead>{labels.description}</TableHead>
                  <TableHead className="text-right">{labels.tva19}</TableHead>
                  <TableHead className="text-right">{labels.tva9}</TableHead>
                  <TableHead className="text-right">{labels.tva5}</TableHead>
                  <TableHead className="text-right">{labels.tva0}</TableHead>
                  <TableHead className="text-right">{labels.total}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m, idx) => (
                  <TableRow key={`${m.documentType}-${idx}`} className={m.documentType === "stoc_initial" ? "bg-accent" : ""}>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="tabular-nums">{new Date(m.date).toLocaleDateString("ro-RO")}</TableCell>
                    <TableCell>
                      <Badge className={DOCUMENT_TYPE_COLORS[m.documentType] ?? "bg-secondary text-foreground"}>
                        {labels.docTypes[m.documentType as keyof typeof labels.docTypes] ?? m.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{m.documentNumber ?? "—"}</TableCell>
                    <TableCell>{m.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva19, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva9, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva5, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva0, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatMoney(m.total, currency)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-reconciled/10 font-semibold">
                  <TableCell colSpan={5} className="text-right">{labels.totalEntries}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari19, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari9, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari5, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari0, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrariTotal, currency)}</TableCell>
                </TableRow>
                <TableRow className="bg-attention/10 font-semibold">
                  <TableCell colSpan={5} className="text-right">{labels.totalExits}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri19, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri9, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri5, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri0, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiriTotal, currency)}</TableCell>
                </TableRow>
                <TableRow className="bg-accent font-bold">
                  <TableCell colSpan={5} className="text-right">{labels.closingStock}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva19, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva9, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva5, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva0, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.total, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">{labels.stock}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">{labels.openingStock}:</span>
              <span className="font-semibold">{formatMoney(openingStock.total, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid">{labels.closingStock}:</span>
              <span className="font-bold text-brass">{formatMoney(closingStock.total, currency)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-reconciled">{labels.entriesShort}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">{labels.purchases}:</span>
              <span className="font-semibold">{formatMoney(movements.filter((m) => m.documentType === "nir").reduce((s, m) => s + m.total, 0), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid">{labels.totalEntries}:</span>
              <span className="font-bold text-reconciled">{formatMoney(totals.intrariTotal, currency)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-attention">{labels.exitsShort}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">{labels.consumption}:</span>
              <span className="font-semibold">{formatMoney(movements.filter((m) => m.documentType === "consum").reduce((s, m) => s + m.total, 0), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid">{labels.sales}:</span>
              <span className="font-semibold">{formatMoney(movements.filter((m) => m.documentType === "vanzare").reduce((s, m) => s + m.total, 0), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid">{labels.totalExits}:</span>
              <span className="font-bold text-attention">{formatMoney(totals.iesiriTotal, currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 print:hidden space-y-2">
        <p className="text-xs text-amber-800">
          <strong>{labels.important}</strong> {labels.dataSource}
        </p>
        {closingStock.total < 0 && (
          <p className="text-xs text-amber-800">
            {labels.negativeStockWarning}
          </p>
        )}
        {hasUnknownCost && (
          <p className="text-xs text-amber-800">
            {labels.costGapWarning}
          </p>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 pt-8 print:mt-12">
        <div>
          <p className="text-xs text-muted-foreground mb-8">{labels.preparedBy}</p>
          <div className="border-t border-border pt-1 text-xs text-muted-foreground">{labels.nameDate}</div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-8">{labels.accountantSignature}</p>
          <div className="border-t border-border pt-1 text-xs text-muted-foreground">{labels.nameDate}</div>
        </div>
      </div>
    </div>
  );
}
