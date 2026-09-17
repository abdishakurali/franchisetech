import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getKitchenOpsContext, formatMoney } from "@/lib/kitchenops/metrics";
import { isModuleNavVisible } from "@/lib/business-modules";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { filterReportLinks } from "@/lib/app-report-links";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { listAccessibleSites } from "@/lib/site-context";
import { computeSalesReport } from "@/lib/reports/sales-data";
import { countsTowardPurchaseSpend } from "@/lib/nir/purchase";
import { CORE_REPORTS, selectCoreReport } from "@/lib/reports/hub-selection";
import { ReportsTrendChart, type SalesDay } from "@/components/app/ReportsTrendChart";

type Preview = { metrics: Array<[string, string]>; rows: Array<[string, string]>; error?: boolean };

export default async function ReportsHubPage({ searchParams }: { searchParams: Promise<{ report?: string; period?: string }> }) {
  const { countryCode, profileLocale, supabase, orgId, currency, membership } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const orgModules = await fetchOrgModuleFlags(supabase, orgId);
  const sub = await getSubscriptionStatus(orgId).catch(() => null);
  const hasTrial = sub?.state === "trialing" || sub?.state === "soft_trial";
  const inventoryVisible = isModuleNavVisible({ org: orgModules, module: "inventory", subscriptionPlan: sub?.plan, hasTrial });
  const recipeVisible = isModuleNavVisible({ org: orgModules, module: "recipe_costing", subscriptionPlan: sub?.plan, hasTrial });
  const { data: settings } = await supabase.from("organisations").select("saga_export_enabled,loyalty_enabled").eq("id", orgId).maybeSingle();
  const [gestiuneVisible, loyaltyEntitled] = await Promise.all([
    hasEntitlement(orgId, "reports.gestiune").catch(() => false),
    hasEntitlement(orgId, "loyalty.enabled").catch(() => false),
  ]);
  const visible = filterReportLinks(t, {
    inventoryVisible, recipeVisible, gestiuneVisible,
    accountantPackVisible: Boolean(settings?.saga_export_enabled),
    loyaltyVisible: Boolean(settings?.loyalty_enabled) && loyaltyEntitled,
  });
  const core = visible.filter((report) => CORE_REPORTS.some((key) => report.href === `/app/reports/${key}`));
  const params = await searchParams;
  const period = params.period === "today" || params.period === "week" ? params.period : "month";
  const selected = selectCoreReport(params.report, core.map((report) => report.href));
  const active = core.find((report) => report.href === `/app/reports/${selected}`) ?? core[0];
  const now = new Date();
  const from = new Date(period === "today" ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) : period === "week" ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6) : Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  const start = `${from}T00:00:00.000Z`;
  const end = `${to}T23:59:59.999Z`;
  let preview: Preview = { metrics: [], rows: [] };
  let salesDays: SalesDay[] = [];

  if (active && selected === "sales") {
    const sites = await listAccessibleSites(supabase, orgId, membership.id, membership.role);
    const siteIds = sites.map((site) => site.id);
    const data = await computeSalesReport(supabase, orgId, siteIds, start, end, t.common.unknown);
    const linesQuery = supabase.from("canonical_sales_lines").select("sold_at,gross_amount").eq("organisation_id", orgId).gte("sold_at", start).lte("sold_at", end);
    const { data: chartLines, error: chartError } = await (siteIds.length ? linesQuery.in("site_id", siteIds) : linesQuery.eq("site_id", "00000000-0000-0000-0000-000000000000"));
    const byDay = new Map<string, number>();
    for (const line of chartLines ?? []) {
      const day = String(line.sold_at ?? "").slice(0, 10);
      if (day) byDay.set(day, (byDay.get(day) ?? 0) + Number(line.gross_amount ?? 0));
    }
    salesDays = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, total]) => ({ day: new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`)), total }));
    preview = { metrics: [
      ["Vânzări", formatMoney(data.grossExTips, currency)],
      ["Tranzacții", String(data.transactionCount)],
      ["Bon mediu", formatMoney(data.transactionCount ? data.grossExTips / data.transactionCount : 0, currency)],
      ["Anulate", String(data.voidedCount)],
    ], rows: data.productRows.slice(0, 5).map((row) => [row.name, formatMoney(row.total, currency)]), error: Boolean(chartError) };
  } else if (active && selected === "z-report") {
    const { data, error } = await supabase.from("pos_sessions").select("closed_at,counted_cash,expected_cash,cash_difference").eq("organisation_id", orgId).not("closed_at", "is", null).order("closed_at", { ascending: false }).limit(5);
    const latest = data?.[0];
    preview = { error: Boolean(error), metrics: [
      ["Închideri recente", String(data?.length ?? 0)],
      ["Numerar numărat", latest ? formatMoney(latest.counted_cash, currency) : "—"],
      ["Numerar așteptat", latest ? formatMoney(latest.expected_cash, currency) : "—"],
      ["Diferență", latest ? formatMoney(latest.cash_difference, currency) : "—"],
    ], rows: (data ?? []).map((row) => [row.closed_at ? new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium" }).format(new Date(row.closed_at)) : "—", formatMoney(row.counted_cash, currency)]) };
  } else if (active && selected === "vat") {
    const { data, error } = await supabase.from("canonical_sales_lines").select("vat_rate,net_amount,vat_amount,gross_amount").eq("organisation_id", orgId).gte("sold_at", start).lte("sold_at", end);
    const rates = new Map<number, { net: number; vat: number; gross: number }>();
    for (const line of data ?? []) {
      const rate = Number(line.vat_rate ?? 0);
      const row = rates.get(rate) ?? { net: 0, vat: 0, gross: 0 };
      row.net += Number(line.net_amount ?? 0); row.vat += Number(line.vat_amount ?? 0); row.gross += Number(line.gross_amount ?? 0);
      rates.set(rate, row);
    }
    const totals = [...rates.values()].reduce((sum, row) => ({ net: sum.net + row.net, vat: sum.vat + row.vat, gross: sum.gross + row.gross }), { net: 0, vat: 0, gross: 0 });
    preview = { error: Boolean(error), metrics: [["Net", formatMoney(totals.net, currency)], ["TVA", formatMoney(totals.vat, currency)], ["Brut", formatMoney(totals.gross, currency)]], rows: [...rates.entries()].sort(([a], [b]) => a - b).map(([rate, row]) => [`Cotă ${rate}%`, formatMoney(row.vat, currency)]) };
  } else if (active && selected === "stock") {
    const { data, error } = await supabase.from("stock_items").select("name,current_qty,cost_per_unit,reorder_level,unit").eq("organisation_id", orgId).order("name");
    const items = data ?? [];
    preview = { error: Boolean(error), metrics: [
      ["Articole", String(items.length)],
      ["Sub minim", String(items.filter((item) => item.reorder_level !== null && Number(item.current_qty) <= Number(item.reorder_level)).length)],
      ["Valoare estimată", formatMoney(items.reduce((sum, item) => sum + Number(item.current_qty ?? 0) * Number(item.cost_per_unit ?? 0), 0), currency)],
    ], rows: items.slice(0, 5).map((item) => [item.name, `${Number(item.current_qty ?? 0).toLocaleString("ro-RO")} ${item.unit ?? ""}`]) };
  } else if (active && selected === "purchases") {
    const { data, error } = await supabase.from("purchases").select("purchase_date,purchased_at,invoice_number,reference,total_amount,status").eq("organisation_id", orgId).order("purchased_at", { ascending: false }).limit(100);
    const posted = (data ?? []).filter((item) => countsTowardPurchaseSpend(item.status));
    preview = { error: Boolean(error), metrics: [
      ["Recepții recente", String(posted.length)],
      ["Valoare recepționată", formatMoney(posted.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0), currency)],
    ], rows: posted.slice(0, 5).map((item) => [item.invoice_number || item.reference || item.purchase_date || "Recepție", formatMoney(item.total_amount, currency)]) };
  } else if (active && selected === "margins") {
    const { data, error } = await supabase.from("recipes").select("name,yield_qty,products(name,sale_price),recipe_items(quantity,unit_cost,total_cost)").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(100);
    const rows = (data ?? []).map((recipe): [string, string] => {
      const product = Array.isArray(recipe.products) ? recipe.products[0] : recipe.products;
      const price = Number(product?.sale_price ?? 0);
      const batchCost = (recipe.recipe_items ?? []).reduce((sum, item) => sum + (Number(item.total_cost ?? 0) > 0 ? Number(item.total_cost) : Number(item.unit_cost ?? 0) * Number(item.quantity ?? 0)), 0);
      const cost = batchCost / Math.max(Number(recipe.yield_qty ?? 1), 1);
      return [product?.name || recipe.name, price > 0 ? `${(((price - cost) / price) * 100).toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%` : "—"];
    });
    preview = { error: Boolean(error), metrics: [["Rețete recente", String(rows.length)]], rows: rows.slice(0, 5) };
  }

  return <div className="min-h-full bg-[#F3F0E8] p-4 sm:p-6">
    <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div><div className="mb-5"><h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.025em] text-[#0D0F0E]">{t.reports.pageTitle}</h1><p className="mt-1 text-sm text-[#78786F]">{core.length} rapoarte · o singură sursă de adevăr</p></div>
      <nav aria-label="Alege raportul" className="overflow-hidden rounded-[10px] border border-[#DFDCD2] bg-white">{core.map((report) => {
        const isActive = report.href === active?.href;
        return <Link key={report.href} href={`/app/reports?report=${report.href.split("/").pop()}&period=${period}`} aria-current={isActive ? "page" : undefined} className={`flex min-h-[76px] items-center justify-between gap-3 border-b border-[#DFDCD2] px-[18px] py-4 last:border-b-0 transition-colors ${isActive ? "border-l-[3px] border-l-[#165DFC] bg-[#E8EFFE] text-[#0B47CC]" : "text-[#0D0F0E] hover:bg-[#FAF8F4]"}`}>
          <span className="min-w-0"><span className="block font-semibold text-[#0D0F0E]">{report.title}</span><span className="block text-xs text-slate-600">{report.desc}</span></span>
        </Link>;
      })}</nav></div>
      <section aria-label={active?.title ?? "Previzualizare raport"} className="min-w-0 rounded-[10px] border border-[#DFDCD2] bg-white p-4 sm:p-6">
        {active ? <>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[#0D0F0E]">{active.title}</h2><p className="mt-1 text-[13px] text-[#78786F]">{active.desc}</p></div>{(selected === "sales" || selected === "vat") && <nav aria-label="Perioada raportului" className="flex gap-1.5">{([["today", "Azi"], ["week", "7 zile"], ["month", "Luna aceasta"]] as const).map(([value, label]) => <Link key={value} href={`/app/reports?report=${selected}&period=${value}`} aria-current={period === value ? "true" : undefined} className={`rounded-md border px-3 py-2 text-xs font-semibold ${period === value ? "border-[#165DFC] bg-[#E8EFFE] text-[#0B47CC]" : "border-[#DFDCD2] text-[#78786F]"}`}>{label}</Link>)}</nav>}</div>
          {preview.error ? <p role="alert" className="py-8 text-sm text-red-700">Datele raportului nu au putut fi încărcate. Deschide raportul pentru detalii.</p> : <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Date reale · {selected === "z-report" ? "ultimele 5 închideri" : selected === "stock" ? "stoc curent" : selected === "purchases" || selected === "margins" ? "ultimele 100 înregistrări" : `${from} – ${to}`}</p>
            <div className="mt-5 grid grid-cols-2 gap-px border border-[#DFDCD2] bg-[#DFDCD2] xl:grid-cols-4">{preview.metrics.map(([label, value]) => <div key={label} className="bg-white p-4"><p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#78786F]">{label}</p><p className="mt-1 break-words font-[family-name:var(--font-display)] text-[23px] font-semibold tracking-tight tabular-nums text-[#0D0F0E]">{value}</p></div>)}</div>
            {selected === "sales" && <><h3 className="mt-6 text-sm font-semibold text-[#0D0F0E]">Vânzări pe zi</h3><ReportsTrendChart days={salesDays} currency={currency} /></>}
            <h3 className="mt-6 text-sm font-semibold text-[#0D0F0E]">{selected === "sales" ? "Top produse" : "Detalii recente"}</h3>
            {preview.rows.length ? <div className="mt-2 divide-y divide-[#DFDCD2]">{preview.rows.map(([label, value], index) => <div key={`${label}-${index}`} className="flex justify-between gap-3 py-3 text-sm"><span className="text-slate-700">{label}</span><span className="text-right font-mono font-medium tabular-nums text-[#0D0F0E]">{value}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">Nu există date pentru această perioadă.</p>}
          </>}
          <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[#DFDCD2] pt-4">{selected === "sales" && <a href={`/api/reports/sales/pdf?from=${from}&to=${to}`} className="inline-flex min-h-[42px] items-center rounded-lg bg-[#165DFC] px-[18px] text-sm font-bold text-white">Descarcă PDF</a>}<Link href={`${active.href}?from=${from}&to=${to}`} className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#DFDCD2] px-[18px] text-sm font-semibold text-[#0D0F0E]">Deschide raportul <ArrowUpRight className="size-4" /></Link></div>
        </> : <p className="text-sm text-slate-600">Nu există rapoarte disponibile pentru acest cont.</p>}
      </section>
    </div>
  </div>;
}
