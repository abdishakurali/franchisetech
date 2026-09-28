import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { AuditExportButtons } from "@/components/app/AuditExportButtons";
import { SagaExportButtons } from "@/components/app/SagaExportButtons";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";

export default async function AuditExportPage({ searchParams }: { searchParams?: Promise<{ from?: string; to?: string }> }) {
  const { orgId, countryCode, profileLocale, supabase } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const { data: orgSettings } = await supabase
    .from("organisations")
    .select("saga_export_enabled")
    .eq("id", orgId)
    .maybeSingle();

  if (!orgSettings?.saga_export_enabled) redirect("/app/settings?tab=integrations");
  if (!await hasEntitlement(orgId, "reports.accountant_pack")) redirect("/app/billing?reason=saga_requires_scale");

  const ae = t.reportPages.auditExport;
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const fromDate = params?.from ?? monthStart;
  const toDate = params?.to ?? today;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{ae.title}</h1>
        <p className="text-sm text-muted-foreground">{ae.subtitle}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{ae.dateRange}</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{ae.from}</label>
              <input type="date" name="from" defaultValue={fromDate} className="h-10 rounded-md border border-border px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{ae.to}</label>
              <input type="date" name="to" defaultValue={toDate} max={today} className="h-10 rounded-md border border-border px-3 text-sm" />
            </div>
            <button type="submit" className="h-10 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-secondary">
              {ae.applyRange}
            </button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">{ae.showing(fromDate, toDate)}</p>
        </CardContent>
      </Card>

      <AuditExportButtons orgId={orgId} fromDate={fromDate} toDate={toDate} />

      {countryCode === "RO" && <SagaExportButtons fromDate={fromDate} toDate={toDate} isRO />}

      <Card>
        <CardHeader><CardTitle>{ae.exportsIncluded}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-mid">
          {(["transactions", "items", "vat_summary", "void_log", "food_safety", "actions"] as const).map((key) => {
            const exp = ae.exports[key];
            const color =
              key === "vat_summary"
                ? "bg-reconciled/15 text-reconciled"
                : key === "void_log"
                  ? "bg-red-100 text-attention"
                  : key === "food_safety" || key === "actions"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-accent text-brass";
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
