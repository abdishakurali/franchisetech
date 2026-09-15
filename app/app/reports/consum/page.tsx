import Link from "next/link";
import { FileDown } from "lucide-react";
import { PrintButton } from "@/components/app/PrintButton";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { requireBusinessModule } from "@/lib/module-guard";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementProduct,
  stockMovementUnitCost,
  stockMovementUnit,
} from "@/lib/ro-accounting/stock-movements";

export default async function ConsumReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;
  const dayStart = `${fromDate}T00:00:00.000Z`;
  const dayEnd = `${toDate}T23:59:59.999Z`;

  const labels = t.reportPages.consum;

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const movements = await fetchStockMovements(supabase, orgId, {
    movementType: "sale_used",
    from: dayStart,
    to: dayEnd,
  });

  const aggregated = new Map<string, { name: string; unit: string; quantity: number; unitCost: number; totalCost: number }>();

  for (const m of movements) {
    const prod = stockMovementProduct(m);
    const productName = prod?.name ?? t.common.unknown;
    const unit = stockMovementUnit(m);
    const qty = Math.abs(stockMovementQty(m));
    const unitCost = stockMovementUnitCost(m);

    const existing = aggregated.get(productName);
    if (existing) {
      existing.quantity += qty;
      existing.totalCost += qty * unitCost;
      if (unitCost > 0) existing.unitCost = unitCost;
    } else {
      aggregated.set(productName, {
        name: productName,
        unit,
        quantity: qty,
        unitCost,
        totalCost: qty * unitCost,
      });
    }
  }

  const items = Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
  const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0);

  const { data: bcNum } = await supabase.rpc("assign_bc_number", {
    p_org_id: orgId,
    p_from: fromDate,
    p_to: toDate,
  });
  const documentNumber = (bcNum as string | null) ?? `BC-${fromDate.replace(/-/g, "")}`;

  const sans = "font-[family-name:var(--font-body)]";
  const mono = "font-[family-name:var(--font-plex-mono)]";
  const display = "font-[family-name:var(--font-display)]";

  return (
    <div className={`mx-auto max-w-4xl p-8 print:p-4 text-slate-900 ${sans}`}>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <ReportDateRangeFilter basePath="/app/reports/consum" from={fromDate} to={toDate} />
        <div className="flex gap-3 items-center">
          <Link
            href={`/api/reports/consum/pdf?from=${fromDate}&to=${toDate}`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            {t.common.downloadPdf}
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ── Header: title/subtitle left, doc number + unit right — same
          grammar as the NIR print page, so the two read as one family. ── */}
      <header className="flex items-start justify-between gap-6 border-b-4 border-slate-900 pb-4 mb-6">
        <div>
          <h1 className={`text-2xl font-semibold uppercase tracking-tight leading-tight ${display}`}>
            {labels.title}
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{labels.docCode}</p>
        </div>
        <div className={`text-right text-sm ${mono}`}>
          <p>
            {labels.docNo} <span className="font-semibold">{documentNumber}</span>
          </p>
          <p className="mt-1 text-slate-600">
            {labels.unitLabel}: <span className="font-medium text-slate-900">{org?.name ?? "—"}</span>
          </p>
        </div>
      </header>

      {/* ── Metadata grid ── */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 mb-8 text-sm">
        {[
          { label: labels.period, value: `${fromDate} — ${toDate}` },
          { label: labels.evaluationMethod, value: labels.evaluationMethodValue },
          { label: labels.totalItems, value: String(items.length) },
        ].map((f) => (
          <div key={f.label}>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 ${mono}`}>{f.label}</p>
            <p className="mt-1 font-medium text-slate-900">{f.value}</p>
          </div>
        ))}
      </section>

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">{labels.noData}</p>
          <p className="text-xs text-slate-300 mt-2">{labels.noDataHint}</p>
        </div>
      ) : (
        <table className={`w-full text-sm border-collapse mb-2 ${sans}`}>
          <thead>
            <tr className="border-t-2 border-b-2 border-slate-900">
              <th className="text-left py-2 px-1 w-8">{labels.rowNo}</th>
              <th className="text-left py-2 px-1">{labels.product}</th>
              <th className="text-center py-2 px-1">{labels.unit}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.quantity}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.unitCost}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.totalCost}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.name} className="border-b border-slate-200">
                <td className="py-2 px-1 text-slate-500">{idx + 1}</td>
                <td className="py-2 px-1">{item.name}</td>
                <td className="text-center py-2 px-1">{item.unit}</td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{item.quantity.toFixed(2)}</td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{formatMoney(item.unitCost, currency)}</td>
                <td className={`text-right py-2 px-1 tabular-nums font-medium ${mono}`}>{formatMoney(item.totalCost, currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-semibold">
              <td colSpan={5} className="py-2 px-1 text-right">{labels.total}</td>
              <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{formatMoney(totalValue, currency)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      {/* ── Signatures: three blocks — same grammar as the NIR print page ── */}
      <footer className="mt-10 border-t border-slate-300 pt-6 text-sm">
        <div className="grid gap-8 sm:grid-cols-3">
          {[labels.intocmit, labels.aprobat, labels.primit].map((role) => (
            <div key={role}>
              <p className={`text-[10px] uppercase tracking-wider text-slate-400 mb-8 ${mono}`}>{role}</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-xs text-slate-500 mt-1">{labels.signature}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[10px] text-slate-400 leading-relaxed print:text-[9px]">
          {labels.footerDisclaimer}
        </p>
      </footer>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mt-8 print:hidden">
        <p className="text-xs text-slate-500">
          <strong>{labels.dataSourceLabel}</strong> {labels.dataSource}
        </p>
      </div>
    </div>
  );
}
