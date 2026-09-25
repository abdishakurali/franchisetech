import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Download, FileCheck2, RefreshCw } from "lucide-react";
import { accountantDateRange } from "@/lib/accountant/period";
import { accountantReadinessIssues } from "@/lib/accountant/export-rows";
import { ACCOUNTANT_EXPORTS } from "@/lib/accountant/export-catalog";
import { normalizeAccountantPermissions, packageSections, type PackageSection } from "@/lib/accountant/permissions";
import { createClient, getAuthUser } from "@/lib/supabase/server";

const SECTION_COPY: Record<PackageSection, { label: string; description: string; legal: string }> = {
  sales: { label: "Vânzări și TVA", description: "Bonuri POS, retururi, preț unitar și centralizare pe cote TVA.", legal: "Date de control; raportul Z fiscal rămâne documentul pentru venitul zilnic." },
  payments: { label: "Încasări", description: "Numerar, card și alte metode de plată pentru reconciliere.", legal: "Se verifică față de casa de marcat, bancă și documentele de casă." },
  cash: { label: "Casă și închideri", description: "Registru de casă operativ, sold și diferențe la închidere.", legal: "Necesită documente justificative; confirmarea Z nu este raportul Z fiscal." },
  purchases: { label: "Achiziții și NIR", description: "Furnizor, CUI, factură, recepție, cantități, cost și TVA.", legal: "NIR se folosește când recepția trebuie documentată conform procedurii firmei." },
  stock: { label: "Stoc și gestiune", description: "Stoc scriptic, diferențe, cost și mișcări de gestiune.", legal: "Fișa de magazie, bonul de consum și inventarul justifică intrările și ieșirile." },
  documents: { label: "Documente justificative", description: "Facturi și documente-sursă disponibile în platformă.", legal: "Un rând fără documentul-sursă nu este suficient pentru înregistrarea contabilă." },
};

const money = (value: number) => new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(value);
const when = (value: string | null | undefined) => value ? new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Bucharest" }).format(new Date(value)) : "Nu există date";

export default async function AccountantWorkspace({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ from?: string; to?: string; section?: string | string[] }> }) {
  const [{ orgId }, query] = await Promise.all([params, searchParams]);
  const range = accountantDateRange(query.from, query.to);
  const supabase = await createClient(); const { data: { user } } = await getAuthUser();
  const { data: membership } = await supabase.from("organisation_members").select("role,accountant_permissions,organisations(name,company_legal_name,company_address,anaf_cif)").eq("user_id", user!.id).eq("organisation_id", orgId).in("role", ["owner", "manager", "accountant"]).or("status.is.null,status.eq.active").maybeSingle();
  if (!membership) notFound();
  const permissions = membership.role === "accountant" ? normalizeAccountantPermissions(membership.accountant_permissions) : normalizeAccountantPermissions(undefined);
  const available = packageSections(permissions);
  const requested = Array.isArray(query.section) ? query.section : query.section ? [query.section] : [];
  const selected = requested.filter((value): value is PackageSection => available.includes(value as PackageSection));
  const activeSections = selected.length ? selected : available;
  const org = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;

  const [sales, closes, cashMovements, purchases, productsWithoutSalePrice, stockWithoutCost, latestStock] = await Promise.all([
    supabase.from("pos_transactions").select("id,sold_at,total,status,payment_methods(type)", { count: "exact" }).eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at", { ascending: false }),
    supabase.from("pos_sessions").select("id,closed_at,cash_difference,fiscal_z_report_done", { count: "exact" }).eq("organisation_id", orgId).not("closed_at", "is", null).gte("closed_at", range.start).lte("closed_at", range.end).order("closed_at", { ascending: false }),
    supabase.from("pos_cash_movements").select("id,reason,performed_at", { count: "exact" }).eq("organisation_id", orgId).gte("performed_at", range.start).lte("performed_at", range.end).order("performed_at", { ascending: false }),
    supabase.from("purchases").select("id,purchase_date,created_at,invoice_number,supplier,supplier_id,nir_number,total_amount,status", { count: "exact" }).eq("organisation_id", orgId).gte("purchase_date", range.from).lte("purchase_date", range.to).order("purchase_date", { ascending: false }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).is("sale_price", null),
    supabase.from("canonical_stock_balances").select("product_id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).is("cost_price", null),
    supabase.from("stock_movements").select("created_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const purchaseIds = (purchases.data ?? []).map((row) => row.id);
  const { count: purchaseLinesWithoutCost } = await supabase.from("purchase_items").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).in("purchase_id", purchaseIds.length ? purchaseIds : ["00000000-0000-0000-0000-000000000000"]).or("unit_cost.is.null,unit_cost.lte.0");
  const completedSales = (sales.data ?? []).filter((row) => row.status === "completed");
  const salesTotal = completedSales.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const activeDays = new Set(completedSales.map((row) => row.sold_at.slice(0, 10))).size;
  const cashSales = completedSales.filter((row) => { const method = Array.isArray(row.payment_methods) ? row.payment_methods[0] : row.payment_methods; return method?.type?.toLowerCase() === "cash"; }).reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const missingZ = (closes.data ?? []).filter((row) => !row.fiscal_z_report_done).length;
  const issues = accountantReadinessIssues({
    identityMissing: !org?.company_legal_name || !org?.anaf_cif,
    productsWithoutSalePrice: productsWithoutSalePrice.count ?? 0,
    purchasesWithoutDocument: (purchases.data ?? []).filter((row) => !row.invoice_number || (!row.supplier && !row.supplier_id)).length,
    purchaseLinesWithoutCost: purchaseLinesWithoutCost ?? 0,
    stockWithoutCost: stockWithoutCost.count ?? 0,
    cashDiscrepancies: (closes.data ?? []).filter((row) => Number(row.cash_difference) !== 0).length,
    missingFiscalZ: missingZ,
    cashMovementsWithoutReason: (cashMovements.data ?? []).filter((row) => !row.reason?.trim()).length,
  });
  const latestCandidates = [sales.data?.[0]?.sold_at, closes.data?.[0]?.closed_at, cashMovements.data?.[0]?.performed_at, purchases.data?.[0]?.created_at, latestStock.data?.created_at].filter(Boolean) as string[];
  const latest = latestCandidates.sort().at(-1) ?? null;
  const download = new URLSearchParams({ org: orgId, from: range.from, to: range.to }); activeSections.forEach((section) => download.append("section", section));
  const availableExports = ACCOUNTANT_EXPORTS.filter((item) => activeSections.includes(item.section));

  return <main className="mx-auto max-w-7xl p-4 pb-12 sm:p-6">
    <Link href="/accountant" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Clienții mei</Link>
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-brass">Dosar de lucru pentru contabil</p><h1 className="mt-1 text-2xl font-bold">{org?.company_legal_name || "Denumire legală necompletată"}</h1><p className="mt-1 text-sm text-muted-foreground">{org?.anaf_cif ? `CUI ${org.anaf_cif}` : "CUI necompletat"}{org?.company_address ? ` · ${org.company_address}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">Punct de lucru / marcă: {org?.name || "—"} · acces doar pentru citire</p></div><div className="rounded-lg border border-reconciled/30 bg-reconciled/5 px-4 py-3"><div className="flex items-center gap-2 text-sm font-medium text-reconciled"><RefreshCw className="size-4" />Citire directă din baza firmei</div><p className="mt-1 text-xs text-muted-foreground">Ultima operațiune găsită: {when(latest)}</p></div></header>

    <form className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex items-center gap-2"><Clock3 className="size-5 text-brass" /><h2 className="font-semibold">Alege perioada și conținutul</h2></div><div className="mt-4 grid gap-4 md:grid-cols-[170px_170px_1fr_auto]"><label className="text-xs font-medium">De la<input name="from" type="date" defaultValue={range.from} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label><label className="text-xs font-medium">Până la<input name="to" type="date" defaultValue={range.to} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label><fieldset><legend className="text-xs font-medium">Include în dosar</legend><div className="mt-2 flex flex-wrap gap-2">{available.map((section) => <label key={section} className="flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm"><input type="checkbox" name="section" value={section} defaultChecked={activeSections.includes(section)} />{SECTION_COPY[section].label}</label>)}</div></fieldset><button className="min-h-11 self-end rounded-lg bg-foreground px-5 text-sm font-semibold text-background">Aplică</button></div></form>

    <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5"><Metric label="Vânzări brute" value={money(salesTotal)} /><Metric label="Tranzacții" value={String(completedSales.length)} /><Metric label="Numerar POS" value={money(cashSales)} /><Metric label="Zile cu vânzări" value={String(activeDays)} /><Metric label="Achiziții" value={money((purchases.data ?? []).reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0))} /></section>

    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><section><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Documente disponibile</h2><p className="text-sm text-muted-foreground">Descarcă un document în formatul cerut sau întregul dosar.</p></div><a href={`/api/accountant/package?${download}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brass px-4 text-sm font-bold text-ink"><Download className="size-4" />Dosar complet ZIP</a></div><div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">{availableExports.map((item) => { const base = new URLSearchParams(download); base.set("report", item.id); return <article key={item.id} className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex gap-3"><FileCheck2 className="mt-0.5 size-5 shrink-0 text-brass" /><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.description}</p><p className="mt-1 text-xs text-muted-foreground">{SECTION_COPY[item.section].legal}</p></div></div><div className="flex shrink-0 gap-2"><a href={`/api/accountant/package?${base}&format=csv`} className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">CSV</a><a href={`/api/accountant/package?${base}&format=xlsx`} className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">Excel</a></div></article>})}</div>{activeSections.includes("purchases") || activeSections.includes("sales") ? <div className="mt-3 rounded-xl border border-border bg-card p-4"><h3 className="font-semibold">Import SAGA</h3><p className="mt-1 text-sm text-muted-foreground">XML pentru preluare în SAGA. Verifică în SAGA codurile articolelor, gestiunea și diferențele de rotunjire înainte de validare.</p><div className="mt-3 flex flex-wrap gap-2">{activeSections.includes("purchases") && <a className="rounded-lg border border-border px-3 py-2 text-sm font-semibold" href={`/api/saga-export?org=${orgId}&type=nir&from=${range.from}&to=${range.to}`}>Achiziții / NIR XML</a>}{activeSections.includes("sales") && <a className="rounded-lg border border-border px-3 py-2 text-sm font-semibold" href={`/api/saga-export?org=${orgId}&type=iesiri&from=${range.from}&to=${range.to}`}>Ieșiri XML</a>}</div></div> : null}</section>
      <aside className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><AlertTriangle className="size-5 text-attention" /><h2 className="font-semibold">De clarificat înainte de înregistrare</h2></div><p className="mt-1 text-xs text-muted-foreground">Acestea sunt controale automate, nu concluzii contabile.</p>{issues.length ? <div className="mt-3 divide-y divide-border">{issues.map((issue) => <div key={issue.label} className="flex justify-between gap-3 py-3 text-sm"><span>{issue.label}</span><strong>{issue.count}</strong></div>)}</div> : <div className="mt-4 flex gap-2 text-sm text-reconciled"><CheckCircle2 className="size-5" />Nu au fost găsite lipsuri automate.</div>}</aside></div>

    <section className="mt-6 rounded-xl border border-border bg-muted/30 p-5"><h2 className="font-semibold">Ce nu pretindem că generăm</h2><p className="mt-2 text-sm text-muted-foreground">Raportul Z fiscal este emis de aparatul de marcat. Registrul-jurnal, Registrul-inventar, Cartea mare, balanța de verificare și declarațiile fiscale se întocmesc în sistemul contabil, după verificarea documentelor-sursă.</p></section>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>;
}
