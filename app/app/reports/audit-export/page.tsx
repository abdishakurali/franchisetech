import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { AuditExportButtons } from "@/components/app/AuditExportButtons";
import { SagaExportButtons } from "@/components/app/SagaExportButtons";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

export default async function AuditExportPage({ searchParams }: { searchParams?: Promise<{ from?: string; to?: string }> }) {
  const { orgId, countryCode, profileLocale } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const ae = t.reportPages.auditExport;
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const fromDate = params?.from ?? monthStart;
  const toDate = params?.to ?? today;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{ae.title}</h1>
        <p className="text-sm text-slate-500">{ae.subtitle}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{ae.dateRange}</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">{ae.from}</label>
              <input type="date" name="from" defaultValue={fromDate} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">{ae.to}</label>
              <input type="date" name="to" defaultValue={toDate} max={today} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            </div>
            <button type="submit" className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50">
              {ae.applyRange}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-400">{ae.showing(fromDate, toDate)}</p>
        </CardContent>
      </Card>

      <AuditExportButtons orgId={orgId} fromDate={fromDate} toDate={toDate} />

      {countryCode === "RO" && <SagaExportButtons fromDate={fromDate} toDate={toDate} isRO />}

      <Card>
        <CardHeader><CardTitle>{ae.exportsIncluded}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {(["transactions", "items", "vat_summary", "void_log", "food_safety", "actions"] as const).map((key) => {
            const exp = ae.exports[key];
            const color =
              key === "vat_summary"
                ? "bg-green-100 text-green-700"
                : key === "void_log"
                  ? "bg-red-100 text-red-700"
                  : key === "food_safety" || key === "actions"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700";
            return (
              <div key={key} className="flex gap-3 items-start">
                <span className={`rounded px-2 py-0.5 text-xs font-medium mt-0.5 ${color}`}>{key}.csv</span>
                <span>{exp.desc}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
