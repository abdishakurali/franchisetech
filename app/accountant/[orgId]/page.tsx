import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Download, FileCheck2, FileWarning, Package, RefreshCw, ShieldCheck } from "lucide-react";
import { accountantDateRange } from "@/lib/accountant/period";
import { accountantReadinessIssues } from "@/lib/accountant/export-rows";
import { ACCOUNTANT_EXPORTS } from "@/lib/accountant/export-catalog";
import { normalizeAccountantPermissions, packageSections, type PackageSection } from "@/lib/accountant/permissions";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { hasAccountantPartnerAccess } from "@/lib/accountant/permissions";
import {
  fetchStockMovements,
  stockMovementProduct,
  stockMovementQty,
  stockMovementUnit,
  stockMovementUnitCost,
} from "@/lib/ro-accounting/stock-movements";
import { AccountantWorkspaceTabs, type MovementRow, type NirRow, type ProductRow } from "@/components/app/AccountantWorkspaceTabs";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  purchase_received: "Intrare",
  sale_used: "Consum",
  manual_adjustment: "Ajustare",
  wastage: "Pierdere",
  return: "Retur",
  opening: "Stoc inițial",
};

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

export default async function AccountantWorkspace({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ from?: string; to?: string; section?: string | string[] }>;
}) {
  const [{ orgId }, query] = await Promise.all([params, searchParams]);
  const range = accountantDateRange(query.from, query.to);
  const supabase = await createClient();
  const { data: { user } } = await getAuthUser();
  const { data: membership } = await supabase
    .from("organisation_members")
    .select("role,accountant_permissions,organisations(name,company_legal_name,company_address,anaf_cif,saga_export_enabled)")
    .eq("user_id", user!.id)
    .eq("organisation_id", orgId)
    .in("role", ["owner", "manager", "accountant"])
    .or("status.is.null,status.eq.active")
    .maybeSingle();
  if (!membership) notFound();

  // Never redirects the viewer away — an accountant (or an owner previewing
  // their own portal) always sees their sales/cash/purchases/stock exports.
  // saftEntitled only gates the ONE extra ANAF-schema SAF-T/SAGA XML button
  // below; a Free-plan org simply doesn't see that button, same as any other
  // plan-gated feature elsewhere in the app — it never blocks the page.
  const saftEntitled = await hasEntitlement(orgId, "reports.accountant_pack").catch(() => false) || await hasAccountantPartnerAccess(supabase, orgId);

  const permissions = membership.role === "accountant" ? normalizeAccountantPermissions(membership.accountant_permissions) : normalizeAccountantPermissions(undefined);
  const available = packageSections(permissions);
  const requested = Array.isArray(query.section) ? query.section : query.section ? [query.section] : [];
  const selected = requested.filter((value): value is PackageSection => available.includes(value as PackageSection));
  const activeSections = selected.length ? selected : available;
  const org = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;

  // "Produse" (current stock levels) is derived state from stock movements —
  // same permission domain as "Mișcări de stoc", not a separate grant.
  const canSeeStock = available.includes("stock");
  const canSeePurchases = available.includes("purchases");

  const [sales, closes, cashMovements, purchases, productsWithoutSalePrice, stockWithoutCost, latestStock, movementRows, productResult] = await Promise.all([
    supabase.from("pos_transactions").select("id,sold_at,total,status,payment_methods(type)", { count: "exact" }).eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at", { ascending: false }),
    supabase.from("pos_sessions").select("id,closed_at,cash_difference,fiscal_z_report_done", { count: "exact" }).eq("organisation_id", orgId).not("closed_at", "is", null).gte("closed_at", range.start).lte("closed_at", range.end).order("closed_at", { ascending: false }),
    supabase.from("pos_cash_movements").select("id,reason,performed_at", { count: "exact" }).eq("organisation_id", orgId).gte("performed_at", range.start).lte("performed_at", range.end).order("performed_at", { ascending: false }),
    supabase.from("purchases").select("id,purchase_date,created_at,invoice_number,supplier,supplier_id,nir_number,total_amount,status", { count: "exact" }).eq("organisation_id", orgId).in("status", ["posted", "received"]).gte("purchase_date", range.from).lte("purchase_date", range.to).order("purchase_date", { ascending: false }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).is("sale_price", null),
    supabase.from("canonical_stock_balances").select("product_id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).is("cost_price", null),
    supabase.from("stock_movements").select("created_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    canSeeStock ? fetchStockMovements(supabase, orgId, { from: range.start, to: range.end }) : Promise.resolve([]),
    canSeeStock
      ? supabase
          .from("products")
          .select("id,name,sku,unit_of_measure,current_stock_qty,cost_price")
          .eq("organisation_id", orgId)
          .eq("active", true)
          .order("name")
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; sku: string | null; unit_of_measure: string | null; current_stock_qty: number | null; cost_price: number | null }> }),
  ]);
  const { data: productRows } = productResult;
  const purchaseIds = (purchases.data ?? []).map((row) => row.id);
  const { count: purchaseLinesWithoutCost } = await supabase.from("purchase_items").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).in("purchase_id", purchaseIds.length ? purchaseIds : ["00000000-0000-0000-0000-000000000000"]).or("unit_cost.is.null,unit_cost.lte.0");
  const { data: purchaseItemRows } = purchaseIds.length
    ? await supabase.from("purchase_items").select("purchase_id").in("purchase_id", purchaseIds)
    : { data: [] as Array<{ purchase_id: string | null }> };
  const lineCountByPurchase = new Map<string, number>();
  for (const row of purchaseItemRows ?? []) {
    if (!row.purchase_id) continue;
    lineCountByPurchase.set(row.purchase_id, (lineCountByPurchase.get(row.purchase_id) ?? 0) + 1);
  }

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

  const movements: MovementRow[] = movementRows.map((row, index) => {
    const product = stockMovementProduct(row);
    const quantity = stockMovementQty(row);
    const unitCost = stockMovementUnitCost(row);
    return {
      id: `${row.performed_at}-${index}`,
      date: row.performed_at,
      type: MOVEMENT_TYPE_LABELS[row.movement_type ?? ""] ?? row.movement_type ?? "—",
      product: product?.name ?? "Produs șters",
      quantity,
      unit: stockMovementUnit(row),
      value: unitCost != null ? Math.abs(quantity) * unitCost : null,
    };
  });
  const nirs: NirRow[] = (purchases.data ?? []).map((p) => ({
    id: p.id,
    number: p.nir_number || "—",
    date: p.purchase_date,
    supplier: p.supplier || "—",
    lineCount: lineCountByPurchase.get(p.id) ?? 0,
    total: Number(p.total_amount ?? 0),
  }));
  const products: ProductRow[] = (productRows ?? []).map((p) => ({
    id: p.id,
    code: p.sku || "—",
    name: p.name,
    stock: Number(p.current_stock_qty ?? 0),
    unit: p.unit_of_measure ?? "buc",
    value: p.cost_price != null ? Number(p.current_stock_qty ?? 0) * Number(p.cost_price) : null,
  }));

  const canExportSaft = saftEntitled && canSeePurchases;
  const canExportSaga = canExportSaft && Boolean(org?.saga_export_enabled);
  const saftHref = `/api/saft-export?org=${orgId}&ym=${range.to.slice(0, 7)}`;
  const sagaHref = `/api/saga-export?org=${orgId}&from=${range.from}&to=${range.to}&type=nir`;

  return (
    <main className="mx-auto max-w-7xl p-4 pb-16 sm:p-6">
      <Link href="/accountant" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-4" />Clienții mei
      </Link>

      <header className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1D33]/60">Portal Contabil</p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B1D33]">{org?.company_legal_name || org?.name || "Denumire legală necompletată"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {org?.anaf_cif ? `CUI ${org.anaf_cif}` : "CUI necompletat"}{org?.company_address ? ` · ${org.company_address}` : ""} · acces doar pentru citire
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <RefreshCw className="size-4" />Citire directă din baza firmei
            </div>
            <p className="mt-1 text-xs text-slate-500">Ultima operațiune găsită: {when(latest)}</p>
          </div>
        </div>
      </header>

      <form className="mt-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2"><Clock3 className="size-5 text-[#D9A94E]" /><h2 className="font-semibold text-[#0B1D33]">Alege perioada și conținutul</h2></div>
        <div className="mt-4 grid gap-4 md:grid-cols-[170px_170px_1fr_auto]">
          <label className="text-xs font-medium text-slate-600">De la<input name="from" type="date" defaultValue={range.from} className="mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900" /></label>
          <label className="text-xs font-medium text-slate-600">Până la<input name="to" type="date" defaultValue={range.to} className="mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900" /></label>
          <fieldset>
            <legend className="text-xs font-medium text-slate-600">Include în dosar</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {available.map((section) => (
                <label key={section} className="flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-700">
                  <input type="checkbox" name="section" value={section} defaultChecked={activeSections.includes(section)} />{SECTION_COPY[section].label}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="min-h-11 self-end rounded-md bg-[#0B1D33] px-5 text-sm font-semibold text-white hover:bg-[#0B1D33]/90">Aplică</button>
        </div>
      </form>

      {available.length === 0 && (
        <p className="mt-5 rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Acest cont de contabil nu are nicio categorie de acces activată pentru această firmă.
        </p>
      )}

      {available.length > 0 && (
        <>
          <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {activeSections.includes("sales") && <Metric label="Vânzări brute" value={money(salesTotal)} />}
            {activeSections.includes("sales") && <Metric label="Tranzacții" value={String(completedSales.length)} />}
            {activeSections.includes("cash") && <Metric label="Numerar POS" value={money(cashSales)} />}
            {activeSections.includes("sales") && <Metric label="Zile cu vânzări" value={String(activeDays)} />}
            {activeSections.includes("purchases") && <Metric label="Achiziții" value={money((purchases.data ?? []).reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0))} />}
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#0B1D33]">Documente disponibile</h2>
                  <p className="text-sm text-slate-500">Alege raportul și formatul. Fișierele folosesc exact perioada și categoriile selectate mai sus.</p>
                </div>
                <a href={`/api/accountant/package?${download}`} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#D9A94E] px-4 text-sm font-bold text-[#0B1D33] hover:bg-[#D9A94E]/90">
                  <Download className="size-4" />Descarcă toate · ZIP
                </a>
              </div>
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {availableExports.map((item) => {
                  const base = new URLSearchParams(download); base.set("report", item.id);
                  return (
                    <article key={item.id} className="flex flex-col gap-3 border-b border-slate-200 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="flex gap-3">
                        <FileCheck2 className="mt-0.5 size-5 shrink-0 text-[#D9A94E]" />
                        <div><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-500">{item.description}</p></div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <a href={`/api/accountant/package?${base}&format=csv`} className="inline-flex min-h-10 items-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">CSV</a>
                        <a href={`/api/accountant/package?${base}&format=xlsx`} className="inline-flex min-h-10 items-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Excel</a>
                      </div>
                    </article>
                  );
                })}
                {canExportSaft ? (
                  <article className="flex flex-col gap-3 border-t-2 border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="flex gap-3">
                      <FileWarning className="mt-0.5 size-5 shrink-0 text-[#D9A94E]" />
                      <div><h3 className="font-semibold text-slate-900">SAF-T D406 — mișcări de stoc (XML)</h3><p className="mt-1 text-sm text-slate-500">Recepții (NIR), vânzări, scăzăminte, ajustări, retururi și sold inițial pe lună, în formatul ANAF.</p></div>
                    </div>
                    <div className={`flex flex-wrap gap-2 ${canExportSaga ? "" : ""}`}>
                      <a href={saftHref} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-white"><Download className="size-4" />SAF-T D406 (XML)</a>
                      {canExportSaga && <a href={sagaHref} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-white"><FileCheck2 className="size-4" />Export SAGA</a>}
                    </div>
                    {!canExportSaga && <p className="text-xs text-slate-500">Exportul SAGA necesită activarea modulului din Setări → Contabilitate (firma).</p>}
                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="size-3.5 shrink-0" />XML generat conform schemei ANAF · Structura MovementOfGoods</p>
                    <p className="text-xs text-amber-700">Validat cu validatorul oficial ANAF (DUKIntegrator) pe structura Header/Company. Un singur câmp (HeaderComment) rămâne necompletat — nu am putut confirma valoarea corectă din documentația ANAF. A se verifica cu contabilul înainte de depunere.</p>
                  </article>
                ) : canSeePurchases ? (
                  <p className="border-t-2 border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 sm:p-5">
                    Exportul SAF-T D406 (XML, formatul ANAF) este disponibil din planul Pro. Situația de stoc de mai sus rămâne disponibilă acum, ca CSV/Excel.
                  </p>
                ) : null}
              </div>
            </section>

            <aside className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-amber-500" /><h2 className="font-semibold text-[#0B1D33]">De clarificat înainte de înregistrare</h2></div>
              <p className="mt-1 text-xs text-slate-500">Acestea sunt controale automate, nu concluzii contabile.</p>
              {issues.length ? (
                <div className="mt-3 divide-y divide-slate-200">{issues.map((issue) => <div key={issue.label} className="flex justify-between gap-3 py-3 text-sm text-slate-700"><span>{issue.label}</span><strong>{issue.count}</strong></div>)}</div>
              ) : (
                <div className="mt-4 flex gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-5" />Nu au fost găsite lipsuri automate.</div>
              )}
            </aside>
          </div>

          {(canSeeStock || canSeePurchases) && (
            <section className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-[#0B1D33]">Vezi datele direct în browser</h2>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {canSeeStock && <StatCard label="Mișcări de stoc" value={movements.length} />}
                {canSeePurchases && <StatCard label="Notă de intrare-recepție" value={nirs.length} />}
                {canSeeStock && <StatCard label="Produse active" value={products.length} icon={Package} />}
              </div>
              <AccountantWorkspaceTabs
                movements={canSeeStock ? movements : null}
                nirs={canSeePurchases ? nirs : null}
                products={canSeeStock ? products : null}
              />
            </section>
          )}
        </>
      )}

      <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-semibold text-[#0B1D33]">Ce nu pretindem că generăm</h2>
        <p className="mt-2 text-sm text-slate-500">Raportul Z fiscal este emis de aparatul de marcat. Registrul-jurnal, Registrul-inventar, Cartea mare, balanța de verificare și declarațiile fiscale se întocmesc în sistemul contabil, după verificarea documentelor-sursă.</p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums text-[#0B1D33]">{value}</p></div>;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon?: typeof Package }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-[#0B1D33]">{value}</p></div>
      {Icon && <Icon className="size-6 text-slate-300" strokeWidth={1.5} />}
    </div>
  );
}
