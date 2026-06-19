import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { cancelPurchase, postNirPurchase } from "@/app/actions/kitchenops";
import {
  formatDateDisplay,
  isPurchaseLocked,
  NIR_RO_CODE,
  NIR_RO_TITLE,
  purchaseStatusBadge,
} from "@/lib/nir/purchase";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

function dateOnly(value: string | null | undefined, isRO: boolean) {
  return formatDateDisplay(value, isRO);
}

export default async function PurchaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ posted?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const isRO = currency === "RON";
  const taxLabel = isRO ? "TVA" : "VAT";

  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      *,
      suppliers!purchases_supplier_id_fkey(id,name),
      purchase_items(id,product_id,product_name,item_name,quantity,unit_cost,total_cost,tax_rate,tax_amount,unit_of_measure)
    `)
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!purchase) redirect("/app/purchases");

  let siteName: string | null = null;
  if (purchase.site_id) {
    const { data: site } = await supabase.from("sites").select("name").eq("id", purchase.site_id).single();
    siteName = site?.name ?? null;
  }

  let receivedByName: string | null = null;
  if (purchase.received_by_user_id) {
    const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", purchase.received_by_user_id).single();
    receivedByName = profile?.full_name || profile?.email || null;
  }

  let postedByName: string | null = null;
  if (purchase.posted_by) {
    const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", purchase.posted_by).single();
    postedByName = profile?.full_name || profile?.email || null;
  }

  const canManage = ["owner", "manager"].includes(membership.role ?? "");
  const isDraft = purchase.status === "draft";
  const locked = isPurchaseLocked(purchase.status, purchase.posted_at);
  const badge = purchaseStatusBadge(purchase.status, purchase.nir_number, isRO);
  const dateStr = dateOnly(purchase.purchase_date ?? purchase.purchased_at, isRO);
  const supplierName = (purchase.suppliers as { name?: string } | null)?.name ?? (isRO ? "Direct" : "Direct");
  const invoiceNo = purchase.invoice_number ?? purchase.reference;

  type PurchaseItem = {
    id: string;
    product_id?: string;
    product_name?: string;
    item_name?: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    tax_rate?: number;
    tax_amount?: number;
    unit_of_measure?: string;
  };
  const items = (purchase.purchase_items ?? []) as PurchaseItem[];
  const netTotal = Number(purchase.subtotal_amount ?? items.reduce((s, i) => s + Number(i.total_cost ?? 0), 0));
  const taxTotal = Number(purchase.tax_total ?? items.reduce((s, i) => s + Number(i.tax_amount ?? 0), 0));
  const grossTotal = Number(purchase.total_amount ?? netTotal + taxTotal);

  const errorMsg = query.error === "already_posted"
    ? (isRO ? "NIR-ul a fost deja emis." : "This NIR was already posted.")
    : query.error === "cannot_cancel"
      ? (isRO ? "Doar ciornele pot fi anulate." : "Only drafts can be cancelled.")
      : query.error === "nir_number"
        ? (isRO ? "Nu s-a putut genera numărul NIR. Verificați migrarea 037." : "Could not generate NIR number. Check migration 037.")
        : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 print:max-w-none print:p-4">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link href="/app/purchases" className="text-sm text-slate-500 hover:text-slate-700">
            ← {isRO ? "Cumpărături" : "Purchases"}
          </Link>
          <h1 className="text-2xl font-semibold text-slate-950 mt-1">
            {purchase.nir_number ?? (isRO ? "Cumpărare" : "Purchase")}
          </h1>
          {isRO && purchase.nir_number && (
            <p className="text-xs text-slate-500 mt-1">
              {NIR_RO_TITLE} · Cod {NIR_RO_CODE}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-slate-500">{dateStr}</span>
            <Badge variant="secondary" className={`text-xs border ${badge.className}`}>{badge.label}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {(purchase.status === "posted" || purchase.status === "received") && (
            <Link href={`/app/purchases/${id}/print`}>
              <Button variant="outline">{isRO ? "Tipărește NIR" : "Print NIR"}</Button>
            </Link>
          )}
          {canManage && isDraft && (
            <Link href={`/app/purchases/${id}/edit`}>
              <Button variant="outline">{isRO ? "Editează ciorna" : "Edit draft"}</Button>
            </Link>
          )}
        </div>
      </div>

      {query.posted === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 print:hidden">
          {isRO ? "NIR emis cu succes. Stocul a fost actualizat." : "NIR posted successfully. Stock has been updated."}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 print:hidden">{errorMsg}</div>
      )}

      <div id="nir-print-area" className="space-y-6">
        <div className="hidden print:block border-b pb-4 mb-2">
          <h1 className="text-xl font-bold">
            {isRO
              ? purchase.nir_number
                ? NIR_RO_TITLE
                : "Notă de recepție marfă (cumpărare veche)"
              : purchase.nir_number
                ? "Goods Receiving Note (NIR)"
                : "Legacy purchase receipt"}
          </h1>
          {purchase.nir_number && <p className="text-lg font-semibold mt-1">{purchase.nir_number}</p>}
        </div>

        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="print:pb-2">
            <CardTitle>{isRO ? "Detalii NIR" : "NIR details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {purchase.nir_number && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Nr. NIR" : "NIR number"}</p>
                  <p className="font-medium text-slate-900">{purchase.nir_number}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Data NIR" : "NIR date"}</p>
                <p className="font-medium text-slate-900">{dateOnly(purchase.nir_date ?? purchase.purchase_date, isRO)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Furnizor" : "Supplier"}</p>
                <p className="font-medium text-slate-900">{supplierName}</p>
              </div>
              {invoiceNo && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Nr. factură furnizor" : "Supplier invoice no."}</p>
                  <p className="font-medium text-slate-900">{invoiceNo}</p>
                </div>
              )}
              {purchase.supplier_invoice_date && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Data factură" : "Invoice date"}</p>
                  <p className="font-medium text-slate-900">{dateOnly(purchase.supplier_invoice_date, isRO)}</p>
                </div>
              )}
              {siteName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Gestiune / Locație" : "Location"}</p>
                  <p className="font-medium text-slate-900">{siteName}</p>
                </div>
              )}
              {receivedByName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Recepționat de" : "Received by"}</p>
                  <p className="font-medium text-slate-900">{receivedByName}</p>
                </div>
              )}
              {postedByName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{isRO ? "Emis de" : "Posted by"}</p>
                  <p className="font-medium text-slate-900">{postedByName}</p>
                </div>
              )}
            </div>
            {(purchase.notes || isDraft) && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-400 mb-1">{isRO ? "Observații / diferențe" : "Observations / differences"}</p>
                <p className="text-slate-700">{purchase.notes || (isRO ? "—" : "—")}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">{isRO ? "Total net" : "Net total"}</p>
                <p className="font-semibold text-slate-900">{money(netTotal, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{isRO ? `Total ${taxLabel}` : `Total ${taxLabel}`}</p>
                <p className="font-semibold text-slate-900">{money(taxTotal, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{isRO ? "Total brut" : "Gross total"}</p>
                <p className="font-semibold text-slate-900">{money(grossTotal, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="print:pb-2">
            <CardTitle>{isRO ? "Articole primite" : "Received items"} ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {!items.length ? (
              <p className="text-sm text-slate-400">{isRO ? "Niciun articol." : "No items recorded."}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRO ? "Articol" : "Item"}</TableHead>
                    <TableHead className="text-right">{isRO ? "Cantitate" : "Qty"}</TableHead>
                    <TableHead className="text-right">{isRO ? "Cost net" : "Net cost"}</TableHead>
                    <TableHead className="text-right">{taxLabel} %</TableHead>
                    <TableHead className="text-right">{isRO ? "Total net" : "Net total"}</TableHead>
                    <TableHead className="text-right">{taxLabel}</TableHead>
                    <TableHead className="text-right">{isRO ? "Total brut" : "Gross"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const lineNet = Number(item.total_cost ?? 0);
                    const lineTax = Number(item.tax_amount ?? 0);
                    const lineGross = lineNet + lineTax;
                    const name = item.product_name ?? item.item_name ?? "—";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product_id && !locked ? (
                            <Link href={`/app/products/${item.product_id}`} className="hover:text-blue-600 hover:underline print:no-underline print:text-black">
                              {name}
                            </Link>
                          ) : name}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit_of_measure ?? ""}</TableCell>
                        <TableCell className="text-right">{money(Number(item.unit_cost ?? 0), currency)}</TableCell>
                        <TableCell className="text-right">{Number(item.tax_rate ?? 0)}%</TableCell>
                        <TableCell className="text-right">{money(lineNet, currency)}</TableCell>
                        <TableCell className="text-right">{money(lineTax, currency)}</TableCell>
                        <TableCell className="text-right font-medium">{money(lineGross, currency)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell colSpan={4} className="text-right text-slate-600">{isRO ? "Total net" : "Net total"}</TableCell>
                    <TableCell className="text-right">{money(netTotal, currency)}</TableCell>
                    <TableCell className="text-right">{money(taxTotal, currency)}</TableCell>
                    <TableCell className="text-right">{money(grossTotal, currency)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {canManage && isDraft && (
        <div className="flex flex-wrap gap-3 print:hidden">
          <form action={postNirPurchase as unknown as (fd: FormData) => Promise<void>}>
            <input type="hidden" name="purchase_id" value={id} />
            <input type="hidden" name="purchase_date" value={(purchase.purchase_date ?? new Date().toISOString().slice(0, 10)).toString().slice(0, 10)} />
            <input type="hidden" name="nir_date" value={(purchase.nir_date ?? purchase.purchase_date ?? new Date().toISOString().slice(0, 10)).toString().slice(0, 10)} />
            <input type="hidden" name="invoice_number" value={purchase.invoice_number ?? ""} />
            <input type="hidden" name="supplier_invoice_date" value={purchase.supplier_invoice_date ? String(purchase.supplier_invoice_date).slice(0, 10) : ""} />
            {purchase.supplier_id && <input type="hidden" name="supplier_id" value={purchase.supplier_id} />}
            {purchase.site_id && <input type="hidden" name="site_id" value={purchase.site_id} />}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              {isRO ? "Generează NIR" : "Post NIR"}
            </Button>
          </form>
          <form action={cancelPurchase as unknown as (fd: FormData) => Promise<void>}>
            <input type="hidden" name="purchase_id" value={id} />
            <Button type="submit" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              {isRO ? "Anulează ciorna" : "Cancel draft"}
            </Button>
          </form>
        </div>
      )}

      {purchase.status === "cancelled" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 print:hidden">
          {isRO ? "Această ciornă a fost anulată." : "This draft was cancelled."}
        </div>
      )}

      {locked && purchase.status === "received" && !purchase.nir_number && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:hidden">
          <p className="font-medium">{isRO ? "Cumpărare veche / fără NIR" : "Legacy purchase / no NIR"}</p>
          <p className="mt-1 opacity-90">
            {isRO
              ? "Înregistrată înainte de NIR. Stocul a fost deja actualizat. Poate fi tipărită ca notă de recepție marfă, fără număr NIR oficial."
              : "Recorded before NIR workflow. Stock was already updated. Printable as a purchase receipt, not an official NIR number."}
          </p>
        </div>
      )}
    </div>
  );
}
