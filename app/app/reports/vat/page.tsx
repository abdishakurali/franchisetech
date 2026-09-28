import Link from "next/link";
import { FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

export default async function VatReportPage({ searchParams }: { searchParams?: Promise<{from?:string;to?:string}> }) {
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const vp = t.reportPages.vat;
  const params = await searchParams;
  const today = new Date().toISOString().slice(0,10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  const from = params?.from ?? monthStart;
  const to = params?.to ?? today;

  const { data: lines } = await supabase
    .from("canonical_sales_lines")
    .select("vat_rate,net_amount,vat_amount,gross_amount")
    .eq("organisation_id", orgId)
    .gte("sold_at", `${from}T00:00:00Z`)
    .lte("sold_at", `${to}T23:59:59Z`);

  const byRate = new Map<number, { net: number; vat: number; gross: number; count: number }>();
  for (const item of lines ?? []) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = byRate.get(rate) ?? { net: 0, vat: 0, gross: 0, count: 0 };
    entry.net += net; entry.vat += vat; entry.gross += gross; entry.count++;
    byRate.set(rate, entry);
  }
  const totNet = Array.from(byRate.values()).reduce((s,v) => s + v.net, 0);
  const totVat = Array.from(byRate.values()).reduce((s,v) => s + v.vat, 0);
  const totGross = Array.from(byRate.values()).reduce((s,v) => s + v.gross, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">{vp.title}</h1>
          <p className="text-sm text-muted-foreground">{vp.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath="/app/reports/vat" from={from} to={to} />
          <Link
            href={`/api/reports/vat/pdf?from=${from}&to=${to}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-secondary"
          >
            <FileDown className="h-4 w-4" />
            {t.common.downloadPdf}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{vp.netSales}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(totNet, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{vp.vatCollected}</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-brass">{formatMoney(totVat, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{vp.grossSales}</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-reconciled">{formatMoney(totGross, currency)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{vp.breakdownByRate}</CardTitle><p className="text-xs text-muted-foreground">{from} → {to}</p></CardHeader>
        <CardContent>
          {byRate.size === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{vp.noData}</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2">{t.reportPages.zReport.rate}</th><th className="text-right py-2">{t.tables.net}</th><th className="text-right py-2">{t.tables.vat}</th><th className="text-right py-2">{t.tables.gross}</th><th className="text-right py-2">{vp.transactions}</th></tr></thead>
              <tbody>
                {Array.from(byRate.entries()).sort(([a],[b])=>a-b).map(([rate, v]) => (
                  <tr key={rate} className="border-b last:border-0">
                    <td className="py-2"><Badge variant="outline">{rate}%</Badge></td>
                    <td className="text-right py-2">{formatMoney(v.net, currency)}</td>
                    <td className="text-right py-2 font-medium">{formatMoney(v.vat, currency)}</td>
                    <td className="text-right py-2">{formatMoney(v.gross, currency)}</td>
                    <td className="text-right py-2 text-muted-foreground">{v.count}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t-2">
                  <td className="py-2">{vp.total}</td>
                  <td className="text-right py-2">{formatMoney(totNet, currency)}</td>
                  <td className="text-right py-2">{formatMoney(totVat, currency)}</td>
                  <td className="text-right py-2">{formatMoney(totGross, currency)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 sm:grid-cols-2 pt-8 print:mt-12">
        <div>
          <p className="text-xs text-muted-foreground mb-8">{vp.preparedBy}</p>
          <div className="border-t border-border pt-1 text-xs text-muted-foreground">{vp.nameDate}</div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-8">{vp.accountantSignature}</p>
          <div className="border-t border-border pt-1 text-xs text-muted-foreground">{vp.nameDate}</div>
        </div>
      </div>
    </div>
  );
}
