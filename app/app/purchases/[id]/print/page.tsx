import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/app/PrintButton";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

function dateOnly(value: string | null | undefined) {
  if (!value) return "—";
  return String(value).slice(0, 10);
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

  const { data: org } = await supabase.from("organisations").select("name").eq("id", orgId).single();
  let siteName: string | null = null;
  if (purchase.site_id) {
    const { data: site } = await supabase.from("sites").select("name").eq("id", purchase.site_id).single();
    siteName = site?.name ?? null;
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

  return (
    <div className="mx-auto max-w-3xl p-8 print:p-4 text-slate-900">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/app/purchases/${id}`}>
          <Button variant="outline">{isRO ? "← Înapoi" : "← Back"}</Button>
        </Link>
        <PrintButton label={isRO ? "Tipărește" : "Print"} />
      </div>

      <header className="border-b-2 border-slate-900 pb-4 mb-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">{org?.name ?? ""}</p>
        <h1 className="text-2xl font-bold mt-1">{isRO ? "Notă de Intrare Recepție" : "Goods Receiving Note"}</h1>
        {purchase.nir_number ? (
          <p className="text-xl font-semibold mt-2">{purchase.nir_number}</p>
        ) : (
          <p className="text-sm text-slate-500 mt-2">{isRO ? "Cumpărare veche (fără număr NIR)" : "Legacy purchase (no NIR number)"}</p>
        )}
      </header>

      <section className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-slate-500">{isRO ? "Furnizor" : "Supplier"}</p>
          <p className="font-medium">{supplierName}</p>
        </div>
        <div>
          <p className="text-slate-500">{isRO ? "Data NIR" : "NIR date"}</p>
          <p className="font-medium">{dateOnly(purchase.nir_date ?? purchase.purchase_date)}</p>
        </div>
        {invoiceNo && (
          <div>
            <p className="text-slate-500">{isRO ? "Nr. factură furnizor" : "Supplier invoice no."}</p>
            <p className="font-medium">{invoiceNo}</p>
          </div>
        )}
        {purchase.supplier_invoice_date && (
          <div>
            <p className="text-slate-500">{isRO ? "Data factură" : "Invoice date"}</p>
            <p className="font-medium">{dateOnly(purchase.supplier_invoice_date)}</p>
          </div>
        )}
        {siteName && (
          <div>
            <p className="text-slate-500">{isRO ? "Locație" : "Location"}</p>
            <p className="font-medium">{siteName}</p>
          </div>
        )}
      </section>

      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-left py-2">{isRO ? "Articol" : "Item"}</th>
            <th className="text-right py-2">{isRO ? "Cant." : "Qty"}</th>
            <th className="text-right py-2">{isRO ? "Cost net" : "Net"}</th>
            <th className="text-right py-2">{taxLabel}</th>
            <th className="text-right py-2">{isRO ? "Brut" : "Gross"}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const name = item.product_name ?? item.item_name ?? "—";
            const lineNet = Number(item.total_cost ?? 0);
            const lineTax = Number(item.tax_amount ?? 0);
            return (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2">{name}</td>
                <td className="text-right py-2">{item.quantity} {item.unit_of_measure ?? ""}</td>
                <td className="text-right py-2">{money(Number(item.unit_cost ?? 0), currency)}</td>
                <td className="text-right py-2">{money(lineTax, currency)}</td>
                <td className="text-right py-2">{money(lineNet + lineTax, currency)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-semibold">
            <td colSpan={2} className="py-2 text-right">{isRO ? "Total net" : "Net total"}</td>
            <td className="text-right py-2">{money(netTotal, currency)}</td>
            <td className="text-right py-2">{money(taxTotal, currency)}</td>
            <td className="text-right py-2">{money(grossTotal, currency)}</td>
          </tr>
        </tfoot>
      </table>

      {purchase.notes && (
        <p className="text-sm text-slate-600">
          <span className="font-medium">{isRO ? "Notițe: " : "Notes: "}</span>
          {purchase.notes}
        </p>
      )}
    </div>
  );
}
