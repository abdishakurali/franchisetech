import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileSpreadsheet } from "lucide-react";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { monthRange, normalizeMonth } from "@/lib/accountant/period";
import { normalizeAccountantPermissions } from "@/lib/accountant/permissions";
import { accountantReadinessIssues } from "@/lib/accountant/export-rows";

export default async function AccountantWorkspace({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ month?: string }> }) {
  const [{ orgId }, query] = await Promise.all([params, searchParams]);
  const month = normalizeMonth(query.month); const range = monthRange(month);
  const supabase = await createClient(); const { data: { user } } = await getAuthUser();
  const { data: membership } = await supabase.from("organisation_members").select("accountant_permissions,organisations(name,company_legal_name,anaf_cif)").eq("user_id", user!.id).eq("organisation_id", orgId).eq("role", "accountant").or("status.is.null,status.eq.active").maybeSingle();
  if (!membership) notFound();
  const permissions = normalizeAccountantPermissions(membership.accountant_permissions);
  const org = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;
  const [sales, closes, purchases, discrepancies, productsWithoutSalePrice, stockWithoutCost] = await Promise.all([
    supabase.from("pos_transactions").select("id,sold_at", { count: "exact" }).eq("organisation_id", orgId).eq("status", "completed").gte("sold_at", range.start).lte("sold_at", range.end),
    supabase.from("pos_sessions").select("id,closed_at,cash_difference", { count: "exact" }).eq("organisation_id", orgId).not("closed_at", "is", null).gte("closed_at", range.start).lte("closed_at", range.end),
    supabase.from("purchases").select("id,invoice_number,supplier,nir_number", { count: "exact" }).eq("organisation_id", orgId).gte("purchase_date", range.from).lte("purchase_date", range.to).in("status", ["posted", "received"]),
    supabase.from("pos_sessions").select("id,closed_at,cash_difference").eq("organisation_id", orgId).not("closed_at", "is", null).gte("closed_at", range.start).lte("closed_at", range.end).neq("cash_difference", 0).order("closed_at", { ascending: false }).limit(10),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).is("sale_price", null),
    supabase.from("canonical_stock_balances").select("product_id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).is("cost_price", null),
  ]);
  const purchaseIds = (purchases.data ?? []).map((row) => row.id);
  const { count: purchaseLinesWithoutCost } = await supabase.from("purchase_items").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).in("purchase_id", purchaseIds.length ? purchaseIds : ["00000000-0000-0000-0000-000000000000"]).or("unit_cost.is.null,unit_cost.lte.0");
  const purchasesWithoutDocument = (purchases.data ?? []).filter((row) => !row.invoice_number?.trim() || !row.supplier?.trim()).length;
  const activeDays = new Set((sales.data ?? []).map((row) => String(row.sold_at).slice(0, 10))).size;
  const cards = [
    permissions.includes("sales") && ["Zile cu vânzări", `${activeDays} / ${range.days}`],
    permissions.includes("sales") && ["Tranzacții", String(sales.count ?? 0)],
    permissions.includes("cash") && ["Închideri", String(closes.count ?? 0)],
    permissions.includes("purchases") && ["Achiziții", String(purchases.count ?? 0)],
  ].filter(Boolean) as string[][];
  const issues = accountantReadinessIssues({ identityMissing: !org?.company_legal_name || !org?.anaf_cif, productsWithoutSalePrice: permissions.includes("sales") ? productsWithoutSalePrice.count ?? 0 : 0, purchasesWithoutDocument: permissions.includes("purchases") ? purchasesWithoutDocument : 0, purchaseLinesWithoutCost: permissions.includes("purchases") ? purchaseLinesWithoutCost ?? 0 : 0, stockWithoutCost: permissions.includes("stock") ? stockWithoutCost.count ?? 0 : 0, cashDiscrepancies: permissions.includes("cash") ? discrepancies.data?.length ?? 0 : 0 });
  const complete = issues.length === 0 && (!permissions.includes("sales") || (sales.count ?? 0) > 0) && (!permissions.includes("cash") || (closes.count ?? 0) >= activeDays);
  const areas = [
    permissions.includes("sales") && ["Vânzări și TVA", `${sales.count ?? 0} tranzacții · cote TVA și metode de plată`],
    permissions.includes("cash") && ["Casă și închideri", `${closes.count ?? 0} închideri · reconciliere numerar`],
    permissions.includes("stock") && ["Stoc și gestiune", "Balanță de stoc și diferențe înregistrate"],
    permissions.includes("purchases") && ["Achiziții", `${purchases.count ?? 0} documente de furnizor`],
  ].filter(Boolean) as string[][];
  return <main className="mx-auto max-w-7xl p-4 sm:p-6"><Link href="/accountant" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Clienții mei</Link><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-brass">{org?.anaf_cif ? `CUI ${org.anaf_cif}` : "Date POS"}</p><h1 className="mt-1 text-2xl font-bold">{org?.company_legal_name || org?.name}</h1><p className="text-sm text-muted-foreground">Pachet contabil — {new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))}</p></div><form><label className="text-xs text-muted-foreground">Luna<input name="month" type="month" defaultValue={month} className="ml-2 rounded-md border border-border bg-card px-3 py-2 text-sm" /></label></form></div>
  <section className={`mt-6 rounded-xl border p-5 ${complete ? "border-reconciled/30 bg-reconciled/5" : "border-attention/30 bg-attention/5"}`}><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3">{complete ? <CheckCircle2 className="mt-0.5 size-5 text-reconciled" /> : <AlertTriangle className="mt-0.5 size-5 text-attention" />}<div><h2 className="font-semibold">{complete ? "Date POS complete" : "Necesită verificare"}</h2><p className="text-sm text-muted-foreground">Indicator operațional; nu reprezintă închidere contabilă oficială.</p></div></div><a href={`/api/accountant/package?org=${orgId}&month=${month}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brass px-4 text-sm font-bold text-ink"><Download className="size-4" />Descarcă pachetul</a></div></section>
  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div>)}</div>
  <section className="mt-6 grid gap-3 sm:grid-cols-2">{areas.map(([title, description]) => <div key={title} className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>)}</section>
  <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Necesită atenție înainte de predare</h2>{issues.length ? <div className="mt-3 divide-y divide-border">{issues.map((issue) => <div key={issue.label} className="flex justify-between gap-3 py-3 text-sm"><span>{issue.label}</span><strong>{issue.count}</strong></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Nu au fost găsite lipsuri în categoriile disponibile.</p>}</section><section className="rounded-xl border border-border bg-card p-5"><FileSpreadsheet className="size-5 text-brass" /><h2 className="mt-3 font-semibold">Conținutul pachetului</h2><p className="mt-1 text-sm text-muted-foreground">Vânzări și retururi cu preț unitar, nomenclator cu preț de vânzare, achiziții detaliate cu preț furnizor, TVA, NIR, casă și stoc.</p></section></div></main>;
}
