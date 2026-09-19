import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/app/PrintButton";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import {
  formatDateDisplay,
  formatNirMoney,
  formatNirNumber3dp,
  nirLineValue,
  nirUnitCostForDisplay,
  NIR_DOC_TITLE,
  NIR_DOC_SUBTITLE,
  NIR_RO_CODE,
  NIR_LABELS,
} from "@/lib/nir/purchase";

export default async function PurchasePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { locale, t } = await getAppLocaleAndText(countryCode, profileLocale);
  const p = t.purchases.print;

  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      *,
      suppliers!purchases_supplier_id_fkey(name, tax_id),
      purchase_items(product_name,item_name,quantity,received_quantity,unit_cost,total_cost,tax_rate,tax_amount,unit_of_measure)
    `)
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!purchase) redirect("/app/purchases");
  if (purchase.status !== "posted" && purchase.status !== "received") redirect(`/app/purchases/${id}`);

  const hasNirNumber = Boolean(purchase.nir_number);

  const { data: org } = await supabase
    .from("organisations")
    .select("name, company_legal_name, anaf_vat_registered")
    .eq("id", orgId)
    .single();
  const buyerVatRegistered = Boolean(org?.anaf_vat_registered);

  let siteName: string | null = null;
  if (purchase.site_id) {
    const { data: site } = await supabase.from("sites").select("name").eq("id", purchase.site_id).single();
    siteName = site?.name ?? null;
  }

  let receivedByName: string | null = null;
  if (purchase.received_by_user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", purchase.received_by_user_id)
      .single();
    receivedByName = profile?.full_name || profile?.email || null;
  }

  type Item = {
    product_name?: string;
    item_name?: string;
    quantity: number;
    received_quantity: number | null;
    unit_cost: number;
    total_cost: number;
    tax_rate?: number;
    tax_amount?: number;
    unit_of_measure?: string;
  };
  const items = (purchase.purchase_items ?? []) as Item[];

  // A "difference" only exists where a received quantity was actually
  // recorded and it differs from invoiced — null (not separately recorded)
  // is not a difference, it's the absence of a check, and must render
  // identically to today's data rather than implying a discrepancy that was
  // never observed.
  const linesWithDiff = items.map((item) => {
    const invoiced = Number(item.quantity ?? 0);
    const receivedRecorded = item.received_quantity != null;
    const received = receivedRecorded ? Number(item.received_quantity) : invoiced;
    const hasDifference = receivedRecorded && Math.abs(received - invoiced) > 0.0005;
    return { item, invoiced, received, receivedRecorded, hasDifference };
  });
  const differences = linesWithDiff.filter((l) => l.hasDifference);

  const netTotal = Number(purchase.subtotal_amount ?? 0);
  const taxTotal = Number(purchase.tax_total ?? 0);
  const grossTotal = Number(purchase.total_amount ?? netTotal + taxTotal);
  const supplierRow = purchase.suppliers as { name?: string; tax_id?: string } | null;
  const supplierName = supplierRow?.name ?? t.purchases.detail.direct;
  const supplierCui = supplierRow?.tax_id?.trim() || null;
  const invoiceNo = purchase.invoice_number ?? purchase.reference;
  const nirDate = formatDateDisplay(purchase.nir_date ?? purchase.purchase_date, locale);
  const invoiceDate = formatDateDisplay(purchase.supplier_invoice_date, locale);
  const legalName = org?.company_legal_name?.trim() || org?.name || "—";

  const legacyNote = locale === "ro" ? "Cumpărare veche fără număr NIR. Document informativ." : p.legacyNote;
  const footerDisclaimer = locale === "ro"
    ? "Document generat de franchisetech pentru evidență operațională. Nu reprezintă certificare legală sau contabilă."
    : p.footerDisclaimer;

  const sans = "font-[family-name:var(--font-body)]";
  const mono = "font-[family-name:var(--font-space-mono)]";
  const display = "font-[family-name:var(--font-display)]";

  return (
    <div className={`mx-auto max-w-4xl p-8 print:p-4 text-slate-900 ${sans}`}>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/app/purchases/${id}`}>
          <Button variant="outline">{p.back}</Button>
        </Link>
        <PrintButton label={p.print} />
      </div>

      {!hasNirNumber && (
        <p className="mb-4 text-sm text-slate-500 print:hidden">{legacyNote}</p>
      )}

      {/* ── Header: title/subtitle left, doc number + gestiune right ── */}
      <header className="flex items-start justify-between gap-6 border-b-4 border-slate-900 pb-4 mb-6">
        <div>
          <h1 className={`text-2xl font-semibold uppercase tracking-tight leading-tight ${display}`}>
            {NIR_DOC_TITLE}
          </h1>
          <p className="mt-1 text-sm italic text-slate-600">{NIR_DOC_SUBTITLE}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Cod {NIR_RO_CODE}</p>
        </div>
        <div className={`text-right text-sm ${mono}`}>
          <p>
            {NIR_LABELS.nr} <span className="font-semibold">{hasNirNumber ? purchase.nir_number : "—"}</span>
            {" / "}
            {nirDate}
          </p>
          <p className="mt-1 text-slate-600">
            {NIR_LABELS.gestiune}: <span className="font-medium text-slate-900">{siteName ?? legalName}</span>
          </p>
        </div>
      </header>

      {/* ── Metadata grid: 6 fields, label above value ── */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 mb-8 text-sm">
        {[
          { label: NIR_LABELS.furnizor, value: supplierName },
          { label: NIR_LABELS.cuiFurnizor, value: supplierCui ?? "—" },
          { label: NIR_LABELS.factura, value: invoiceNo ? `${invoiceNo} / ${invoiceDate}` : "—" },
          { label: NIR_LABELS.aviz, value: "—" },
          { label: NIR_LABELS.comisie, value: "—" },
          {
            label: NIR_LABELS.regimTva,
            value: buyerVatRegistered ? NIR_LABELS.platitor : NIR_LABELS.neplatitor,
          },
        ].map((f) => (
          <div key={f.label}>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 ${mono}`}>{f.label}</p>
            <p className="mt-1 font-medium text-slate-900">{f.value}</p>
          </div>
        ))}
      </section>

      {/* ── Line table ── */}
      <table className={`w-full text-sm border-collapse mb-2 ${sans}`}>
        <thead>
          <tr className="border-t-2 border-b-2 border-slate-900">
            <th className="text-left py-2 px-1 w-8">{NIR_LABELS.rowNo}</th>
            <th className="text-left py-2 px-1">{NIR_LABELS.denumire}</th>
            <th className="text-center py-2 px-1">{NIR_LABELS.um}</th>
            <th className={`text-right py-2 px-1 ${mono}`}>{NIR_LABELS.cantFacturata}</th>
            <th className={`text-right py-2 px-1 ${mono}`}>{NIR_LABELS.cantReceptionata}</th>
            {buyerVatRegistered ? (
              <>
                <th className={`text-right py-2 px-1 ${mono}`}>{t.purchases.form.vat}</th>
                <th className={`text-right py-2 px-1 ${mono}`}>{p.netUnit}</th>
              </>
            ) : (
              <th className={`text-right py-2 px-1 ${mono}`}>{NIR_LABELS.pretUnitar}</th>
            )}
            <th className={`text-right py-2 px-1 ${mono}`}>{NIR_LABELS.valoare}</th>
          </tr>
        </thead>
        <tbody>
          {linesWithDiff.map(({ item, invoiced, received, hasDifference }, i) => {
            const name = item.product_name ?? item.item_name ?? "—";
            const netUnitCost = Number(item.unit_cost ?? 0);
            const taxRate = Number(item.tax_rate ?? 0);
            const lineNet = Number(item.total_cost ?? 0);
            const lineTax = Number(item.tax_amount ?? 0);
            const lineValue = nirLineValue({ buyerVatRegistered, netAmount: lineNet, taxAmount: lineTax });
            const grossUnitCost = nirUnitCostForDisplay({ buyerVatRegistered, netUnitCost, taxRatePct: taxRate });
            return (
              <tr key={i} className="border-b border-slate-200">
                <td className="py-2 px-1 text-slate-500">{i + 1}</td>
                <td className="py-2 px-1">{name}</td>
                <td className="text-center py-2 px-1">{item.unit_of_measure ?? "—"}</td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{formatNirNumber3dp(invoiced)}</td>
                <td className={`text-right py-2 px-1 tabular-nums ${mono} ${hasDifference ? "font-semibold text-red-600" : ""}`}>
                  {formatNirNumber3dp(received)}
                </td>
                {buyerVatRegistered ? (
                  <>
                    <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{taxRate}%</td>
                    <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{formatNirMoney(netUnitCost)}</td>
                  </>
                ) : (
                  <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{formatNirMoney(grossUnitCost)}</td>
                )}
                <td className={`text-right py-2 px-1 tabular-nums font-medium ${mono}`}>{formatNirMoney(lineValue)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-semibold">
            <td colSpan={buyerVatRegistered ? 6 : 5} className="py-2 px-1 text-right">{NIR_LABELS.total}</td>
            {buyerVatRegistered && (
              <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>{formatNirMoney(taxTotal)}</td>
            )}
            <td className={`text-right py-2 px-1 tabular-nums ${mono}`}>
              {formatNirMoney(buyerVatRegistered ? netTotal : grossTotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Difference block: only when a difference was actually recorded ── */}
      {differences.length > 0 && (
        <section className="mt-6 mb-8 border-2 border-red-600 rounded-lg p-4">
          <span className={`inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-bold tracking-wide text-white ${mono}`}>
            {NIR_LABELS.diferentaTag}
          </span>
          <ul className="mt-3 space-y-2 text-sm text-slate-800">
            {differences.map(({ item, invoiced, received }, i) => {
              const name = item.product_name ?? item.item_name ?? "—";
              const delta = received - invoiced;
              const netUnitCost = Number(item.unit_cost ?? 0);
              const taxRate = Number(item.tax_rate ?? 0);
              const valuationUnitCost = nirUnitCostForDisplay({ buyerVatRegistered, netUnitCost, taxRatePct: taxRate });
              const deltaValue = delta * valuationUnitCost;
              return (
                <li key={i}>
                  <span className="font-medium">{name}</span>: facturat{" "}
                  <span className={mono}>{formatNirNumber3dp(invoiced)}</span> {item.unit_of_measure}, recepționat{" "}
                  <span className={`font-semibold text-red-600 ${mono}`}>{formatNirNumber3dp(received)}</span>{" "}
                  {item.unit_of_measure} — diferență{" "}
                  <span className={`font-semibold ${mono}`}>
                    {delta > 0 ? "+" : ""}
                    {formatNirNumber3dp(delta)}
                  </span>{" "}
                  ({delta > 0 ? "+" : ""}
                  {formatNirMoney(deltaValue)} {currency === "RON" ? "lei" : currency})
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Signatures ── */}
      <footer className="mt-10 border-t border-slate-300 pt-6 text-sm">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 mb-8 ${mono}`}>
              {NIR_LABELS.predat} — {NIR_LABELS.delegatFurnizor}
            </p>
            <div className="border-b border-slate-400 w-full" />
            <p className="text-xs text-slate-500 mt-1">{NIR_LABELS.semnatura}</p>
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 mb-8 ${mono}`}>
              {NIR_LABELS.primit} — {NIR_LABELS.gestionar}
            </p>
            <p className="font-medium min-h-[1.25rem]">{receivedByName ?? ""}</p>
            <div className="mt-2 border-b border-slate-400 w-full" />
            <p className="text-xs text-slate-500 mt-1">{NIR_LABELS.semnatura}</p>
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider text-slate-400 mb-8 ${mono}`}>
              {NIR_LABELS.comisiaReceptie}
            </p>
            <div className="border-b border-slate-400 w-full" />
            <p className="text-xs text-slate-500 mt-1">{NIR_LABELS.semnatura}</p>
          </div>
        </div>
        <p className="mt-8 text-[10px] text-slate-400 leading-relaxed print:text-[9px]">
          {footerDisclaimer}
        </p>
      </footer>
    </div>
  );
}
