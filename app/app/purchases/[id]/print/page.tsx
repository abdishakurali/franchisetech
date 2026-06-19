import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/app/PrintButton";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { formatDateDisplay, NIR_RO_CODE, NIR_RO_TITLE } from "@/lib/nir/purchase";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

export default async function PurchasePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const isRO = currency === "RON";
  const taxLabel = isRO ? "TVA" : "VAT";

  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      *,
      suppliers!purchases_supplier_id_fkey(name),
      purchase_items(product_name,item_name,quantity,unit_cost,total_cost,tax_rate,tax_amount,unit_of_measure)
    `)
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!purchase) redirect("/app/purchases");
  if (purchase.status !== "posted" && purchase.status !== "received") redirect(`/app/purchases/${id}`);

  const hasNirNumber = Boolean(purchase.nir_number);

  const { data: org } = await supabase
    .from("organisations")
    .select("name, country, country_code, fiscalnet_cif")
    .eq("id", orgId)
    .single();

  let siteName: string | null = null;
  let siteAddress: string | null = null;
  if (purchase.site_id) {
    const { data: site } = await supabase
      .from("sites")
      .select("name, address, city")
      .eq("id", purchase.site_id)
      .single();
    siteName = site?.name ?? null;
    siteAddress = [site?.address, site?.city].filter(Boolean).join(", ") || null;
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
    unit_cost: number;
    total_cost: number;
    tax_rate?: number;
    tax_amount?: number;
    unit_of_measure?: string;
  };
  const items = (purchase.purchase_items ?? []) as Item[];
  const netTotal = Number(purchase.subtotal_amount ?? 0);
  const taxTotal = Number(purchase.tax_total ?? 0);
  const grossTotal = Number(purchase.total_amount ?? netTotal + taxTotal);
  const supplierName = (purchase.suppliers as { name?: string } | null)?.name ?? "Direct";
  const invoiceNo = purchase.invoice_number ?? purchase.reference;
  const orgCui = org?.fiscalnet_cif?.trim() || null;
  const nirDate = formatDateDisplay(purchase.nir_date ?? purchase.purchase_date, isRO);
  const invoiceDate = formatDateDisplay(purchase.supplier_invoice_date, isRO);

  const docTitle = isRO
    ? hasNirNumber
      ? NIR_RO_TITLE
      : "NOTĂ DE RECEPȚIE MARFĂ (cumpărare veche)"
    : hasNirNumber
      ? "Goods Receiving Note"
      : "Legacy purchase receipt";

  return (
    <div className="mx-auto max-w-4xl p-8 print:p-4 text-slate-900">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/app/purchases/${id}`}>
          <Button variant="outline">{isRO ? "← Înapoi" : "← Back"}</Button>
        </Link>
        <PrintButton label={isRO ? "Tipărește NIR" : "Print"} />
      </div>

      <header className="border-b-2 border-slate-900 pb-4 mb-6 text-center sm:text-left">
        <h1 className="text-lg font-bold uppercase tracking-wide leading-tight">{docTitle}</h1>
        {isRO && hasNirNumber && (
          <p className="text-sm text-slate-600 mt-1">{isRO ? "Cod document" : "Document code"}: {NIR_RO_CODE}</p>
        )}
        {hasNirNumber ? (
          <div className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-500">{isRO ? "Nr. NIR:" : "NIR no.:"} </span>
              <span className="font-semibold">{purchase.nir_number}</span>
            </p>
            <p>
              <span className="text-slate-500">{isRO ? "Data NIR:" : "NIR date:"} </span>
              <span className="font-medium">{nirDate}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500 mt-2">
            {isRO
              ? "Cumpărare veche (fără număr NIR). Document informativ — nu înlocuiește NIR oficial."
              : "Legacy purchase (no NIR number). Informational receipt only."}
          </p>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 text-sm mb-6">
        <div className="rounded border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
            {isRO ? "Societate / Entitate" : "Business entity"}
          </p>
          <p className="font-medium">{org?.name ?? "—"}</p>
          {orgCui && (
            <p className="mt-1">
              <span className="text-slate-500">{isRO ? "CUI:" : "Tax ID:"} </span>
              {orgCui}
            </p>
          )}
          {org?.country && (
            <p className="mt-1 text-slate-600">{org.country}</p>
          )}
          {(siteName || siteAddress) && (
            <p className="mt-2">
              <span className="text-slate-500">{isRO ? "Gestiune / Locație:" : "Location:"} </span>
              {[siteName, siteAddress].filter(Boolean).join(" — ")}
            </p>
          )}
        </div>
        <div className="rounded border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
            {isRO ? "Furnizor" : "Supplier"}
          </p>
          <p className="font-medium">{supplierName}</p>
          {invoiceNo && (
            <p className="mt-2">
              <span className="text-slate-500">{isRO ? "Nr. factură furnizor:" : "Supplier invoice no.:"} </span>
              {invoiceNo}
            </p>
          )}
          {purchase.supplier_invoice_date && (
            <p className="mt-1">
              <span className="text-slate-500">{isRO ? "Data factură:" : "Invoice date:"} </span>
              {invoiceDate}
            </p>
          )}
        </div>
      </section>

      <table className="w-full text-xs sm:text-sm border-collapse mb-4">
        <thead>
          <tr className="border-b-2 border-slate-900 bg-slate-50">
            <th className="text-left py-2 px-1 w-8">{isRO ? "Nr. crt." : "No."}</th>
            <th className="text-left py-2 px-1">{isRO ? "Denumire articol" : "Item"}</th>
            <th className="text-center py-2 px-1">{isRO ? "UM" : "UoM"}</th>
            <th className="text-right py-2 px-1">{isRO ? "Cantitate" : "Qty"}</th>
            <th className="text-right py-2 px-1">{isRO ? "Preț unitar net" : "Net unit"}</th>
            <th className="text-right py-2 px-1">{isRO ? "Valoare netă" : "Net"}</th>
            <th className="text-right py-2 px-1">{taxLabel} %</th>
            <th className="text-right py-2 px-1">{taxLabel}</th>
            <th className="text-right py-2 px-1">{isRO ? "Valoare brută" : "Gross"}</th>
            <th className="text-left py-2 px-1">{isRO ? "Diferențe / Observații" : "Notes"}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const name = item.product_name ?? item.item_name ?? "—";
            const lineNet = Number(item.total_cost ?? 0);
            const lineTax = Number(item.tax_amount ?? 0);
            const lineGross = lineNet + lineTax;
            return (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 px-1 text-slate-500">{i + 1}</td>
                <td className="py-2 px-1">{name}</td>
                <td className="text-center py-2 px-1">{item.unit_of_measure ?? "—"}</td>
                <td className="text-right py-2 px-1">{item.quantity}</td>
                <td className="text-right py-2 px-1">{money(Number(item.unit_cost ?? 0), currency)}</td>
                <td className="text-right py-2 px-1">{money(lineNet, currency)}</td>
                <td className="text-right py-2 px-1">{Number(item.tax_rate ?? 0)}%</td>
                <td className="text-right py-2 px-1">{money(lineTax, currency)}</td>
                <td className="text-right py-2 px-1 font-medium">{money(lineGross, currency)}</td>
                <td className="py-2 px-1 text-slate-500">—</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-semibold">
            <td colSpan={5} className="py-2 px-1 text-right">{isRO ? "Total net" : "Net total"}</td>
            <td className="text-right py-2 px-1">{money(netTotal, currency)}</td>
            <td />
            <td className="text-right py-2 px-1">{money(taxTotal, currency)}</td>
            <td className="text-right py-2 px-1">{money(grossTotal, currency)}</td>
            <td />
          </tr>
        </tfoot>
      </table>

      {purchase.notes && (
        <section className="mb-6 rounded border border-slate-200 p-3 text-sm">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">
            {isRO ? "Diferențe / Observații" : "Observations / differences"}
          </p>
          <p className="text-slate-800 whitespace-pre-wrap">{purchase.notes}</p>
        </section>
      )}

      <footer className="mt-8 border-t border-slate-300 pt-6 text-sm">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 mb-6">
              {isRO ? "Recepționat de" : "Received by"}
            </p>
            <p className="font-medium min-h-[1.25rem]">{receivedByName ?? ""}</p>
            <div className="mt-8 border-b border-slate-400 w-full" />
            <p className="text-xs text-slate-500 mt-1">{isRO ? "Semnătură" : "Signature"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 mb-6">
              {isRO ? "Gestionar / Responsabil" : "Store manager / responsible"}
            </p>
            <div className="mt-14 border-b border-slate-400 w-full" />
            <p className="text-xs text-slate-500 mt-1">{isRO ? "Semnătură" : "Signature"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 mb-6">
              {isRO ? "Comisie recepție" : "Receiving committee"}
            </p>
            <div className="mt-14 border-b border-slate-400 w-full" />
            <p className="text-xs text-slate-500 mt-1">{isRO ? "Semnătură" : "Signature"}</p>
          </div>
        </div>
        <p className="mt-8 text-[10px] text-slate-400 leading-relaxed print:text-[9px]">
          {isRO
            ? "Document generat de software. Layout-ul este suport operațional — contabilul/proprietarul trebuie să confirme forma finală. Nu constituie certificare legală sau contabilă."
            : "Software-generated receiving document. Layout is operational support only — owner/accountant should confirm final form. Not a legal or accounting certification."}
        </p>
      </footer>
    </div>
  );
}
