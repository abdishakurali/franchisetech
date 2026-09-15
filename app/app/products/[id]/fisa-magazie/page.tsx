import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/app/PrintButton";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { requireBusinessModule } from "@/lib/module-guard";

type MovementRow = {
  id: string;
  movement_type: string;
  quantity_change: number;
  unit_cost: number | null;
  reason: string | null;
  performed_at: string;
  source: "observed" | "reconciled";
};

export default async function FisaMagaziePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { id } = await params;
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const labels = t.reportPages.fisaMagazie;

  const { data: product } = await supabase
    .from("products")
    .select("id,name,unit_of_measure,current_stock_qty")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!product) redirect("/app/products");

  const { data: org } = await supabase
    .from("organisations")
    .select("name")
    .eq("id", orgId)
    .single();

  const searchP = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = searchP?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = searchP?.to ?? today;
  const windowStart = `${fromDate}T00:00:00.000Z`;
  const windowEnd = `${toDate}T23:59:59.999Z`;

  // Opening balance for the window: sum every movement before it started.
  // The running "Stoc" column inside the table only needs to be correct
  // relative to this anchor, not to reconstruct the product's entire history
  // from zero on every page load.
  const { data: priorMovements } = await supabase
    .from("stock_movements_reconciled")
    .select("quantity_change")
    .eq("organisation_id", orgId)
    .eq("product_id", id)
    .lt("performed_at", windowStart);
  const openingBalance = (priorMovements ?? []).reduce((sum, m) => sum + Number(m.quantity_change ?? 0), 0);

  const { data: movements } = await supabase
    .from("stock_movements_reconciled")
    .select("id,movement_type,quantity_change,unit_cost,reason,performed_at,source")
    .eq("organisation_id", orgId)
    .eq("product_id", id)
    .gte("performed_at", windowStart)
    .lte("performed_at", windowEnd)
    .order("performed_at", { ascending: true });

  const rows = (movements ?? []) as MovementRow[];

  // Running balance is a straight cumulative sum of quantity_change, which
  // is never null on any row — a complete, exact reconstruction, not an
  // estimate. Cost is a different matter: shown only when the row itself
  // carries a unit_cost. A blank cost here is never filled in from today's
  // product price — see labels.costGapNote.
  const rendered = rows.reduce<Array<MovementRow & {
    qtyIn: number | null;
    qtyOut: number | null;
    balanceAfter: number;
    costLabel: string;
    lineValue: number | null;
  }>>((acc, m) => {
    const qty = Number(m.quantity_change);
    const isIn = qty >= 0;
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].balanceAfter : openingBalance;
    acc.push({
      ...m,
      qtyIn: isIn ? qty : null,
      qtyOut: isIn ? null : Math.abs(qty),
      balanceAfter: previousBalance + qty,
      // For a reception, unit_cost is the price paid, not the resulting
      // average — different quantities, so labeled differently rather than
      // both called "Cost" as if interchangeable.
      costLabel: m.movement_type === "purchase_received" ? labels.costPurchase : labels.costCmp,
      lineValue: m.unit_cost != null ? Math.abs(qty) * Number(m.unit_cost) : null,
    });
    return acc;
  }, []);

  const sans = "font-[family-name:var(--font-body)]";
  const mono = "font-[family-name:var(--font-plex-mono)]";
  const display = "font-[family-name:var(--font-display)]";
  const movementTypeLabels = labels.movementTypeLabels as Record<string, string>;

  return (
    <div className={`mx-auto max-w-4xl p-8 print:p-4 text-slate-900 ${sans}`}>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap print:hidden">
        <Link href={`/app/products/${id}`}>
          <Button variant="outline">{t.common.back}</Button>
        </Link>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath={`/app/products/${id}/fisa-magazie`} from={fromDate} to={toDate} />
          <PrintButton />
        </div>
      </div>

      {/* ── Header: same grammar as NIR / Bon de Consum ──
          labels.docCode below ("Formular 14-3-8") is UNVERIFIED. Unlike
          NIR's 14-3-1A and Bon de Consum's 14-3-4/aA, which were already in
          use elsewhere in this codebase (settings page, blog content) when
          those documents were built, 14-3-8 is only best-knowledge — it was
          not found anywhere else in this repo and has not been confirmed
          against OMFP 2634/2015 Annex 1 by anyone. Do not treat it as
          settled; get accountant sign-off before relying on it. ── */}
      <header className="flex items-start justify-between gap-6 border-b-4 border-slate-900 pb-4 mb-6">
        <div>
          <h1 className={`text-2xl font-semibold uppercase tracking-tight leading-tight ${display}`}>
            {labels.title}
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{labels.docCode}</p>
        </div>
        <div className={`text-right text-sm ${mono}`}>
          <p className="font-semibold text-slate-900">{product.name}</p>
          <p className="mt-1 text-slate-600">
            {labels.unitLabel}: <span className="font-medium text-slate-900">{org?.name ?? "—"}</span>
          </p>
        </div>
      </header>

      {/* ── Metadata grid ── */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 mb-8 text-sm">
        {[
          { label: labels.unit, value: product.unit_of_measure ?? "—" },
          { label: labels.currentStock, value: `${Number(product.current_stock_qty ?? 0)} ${product.unit_of_measure ?? ""}` },
          { label: labels.period, value: `${fromDate} — ${toDate}` },
          { label: labels.evaluationMethod, value: labels.evaluationMethodValue },
        ].map((f) => (
          <div key={f.label}>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 ${mono}`}>{f.label}</p>
            <p className="mt-1 font-medium text-slate-900">{f.value}</p>
          </div>
        ))}
      </section>

      {rendered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">{labels.noData}</p>
        </div>
      ) : (
        <table className={`w-full text-sm border-collapse mb-2 ${sans}`}>
          <thead>
            <tr className="border-t-2 border-b-2 border-slate-900">
              <th className="text-left py-2 px-1 w-8">{labels.rowNo}</th>
              <th className="text-left py-2 px-1">{labels.date}</th>
              <th className="text-left py-2 px-1">{labels.document}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.in}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.out}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.balance}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.cost}</th>
              <th className={`text-right py-2 px-1 ${mono}`}>{labels.value}</th>
            </tr>
          </thead>
          <tbody>
            {rendered.map((m, i) => (
              <tr key={m.id} className="border-b border-slate-200">
                <td className="py-2 px-1 text-slate-500">{i + 1}</td>
                <td className="py-2 px-1 whitespace-nowrap">{m.performed_at.slice(0, 10)}</td>
                <td className="py-2 px-1">
                  {movementTypeLabels[m.movement_type] ?? m.movement_type}
                  {m.reason ? <span className="text-slate-400"> — {m.reason}</span> : null}
                  {m.source === "reconciled" ? (
                    <span className="ml-1 text-[10px] uppercase tracking-wide text-amber-600">
                      ({labels.reconciledTag})
                    </span>
                  ) : null}
                </td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono} ${m.qtyIn != null ? "text-green-700" : ""}`}>
                  {m.qtyIn != null ? m.qtyIn.toFixed(2) : ""}
                </td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono} ${m.qtyOut != null ? "text-red-600" : ""}`}>
                  {m.qtyOut != null ? m.qtyOut.toFixed(2) : ""}
                </td>
                <td className={`text-right py-2 px-1 tabular-nums font-medium ${mono}`}>{m.balanceAfter.toFixed(2)}</td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>
                  {m.unit_cost != null ? (
                    <>
                      {formatMoney(Number(m.unit_cost), currency)}
                      <span className="ml-1 text-[9px] text-slate-400">{m.costLabel}</span>
                    </>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>
                  {m.lineValue != null ? formatMoney(m.lineValue, currency) : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed mb-8 print:text-[9px]">{labels.cmpNote}</p>
      <p className="text-[10px] text-slate-400 leading-relaxed mb-8 print:text-[9px]">{labels.costGapNote}</p>

      {/* ── Signature: one block — this is a running ledger the gestionar
          maintains, not a per-transaction voucher signed by multiple
          parties like NIR/Bon de Consum. ── */}
      <footer className="mt-10 border-t border-slate-300 pt-6 text-sm">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 mb-8 ${mono}`}>
              {labels.gestionar}
            </p>
            <div className="border-b border-slate-400 w-full" />
          </div>
        </div>
      </footer>
    </div>
  );
}
