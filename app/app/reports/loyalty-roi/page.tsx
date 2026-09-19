import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown } from "lucide-react";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { computeLoyaltyRoiReport } from "@/lib/reports/loyalty-roi-data";

export default async function LoyaltyRoiReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  if (!await hasEntitlement(orgId, "loyalty.enabled")) redirect("/app/billing?reason=loyalty_requires_operations");

  const { data: orgRow } = await supabase
    .from("organisations")
    .select("loyalty_enabled")
    .eq("id", orgId)
    .maybeSingle();
  if (!orgRow?.loyalty_enabled) redirect("/app/settings/loyalty");

  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;

  const labels = t.reportPages.loyaltyRoi;

  const report = await computeLoyaltyRoiReport(supabase, orgId, fromDate, toDate);

  const rewardLabel = (code: string) =>
    code === "discount" ? labels.rewardTypeDiscount
    : code === "free_item" ? labels.rewardTypeFreeItem
    : code;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath="/app/reports/loyalty-roi" from={fromDate} to={toDate} />
          <Link
            href={`/api/reports/loyalty-roi/pdf?from=${fromDate}&to=${toDate}`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-secondary"
          >
            <FileDown className="h-4 w-4" />
            {labels.downloadPdf}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{labels.avgSpendLoyalty}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatMoney(report.avgSpendLoyalty, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">{labels.visitsCount(report.loyaltyVisitCount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{labels.avgSpendNonLoyalty}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatMoney(report.avgSpendNonLoyalty, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">{labels.visitsCount(report.nonLoyaltyVisitCount)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{labels.retentionRate}</CardTitle></CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{report.retentionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {labels.retentionDetail(report.customersRetained, report.customersVisited)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{labels.topRewards}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {report.topRewards.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">{labels.noData}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.reward}</TableHead>
                  <TableHead className="text-right">{labels.redemptions}</TableHead>
                  <TableHead className="text-right">{labels.stampsUsed}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.topRewards.map((r) => (
                  <TableRow key={r.reward_label}>
                    <TableCell>{rewardLabel(r.reward_label)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.redemption_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.stamps_used_total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
