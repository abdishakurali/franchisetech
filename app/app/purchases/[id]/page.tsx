import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { cancelPurchase, postNirPurchase } from "@/app/actions/kitchenops";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
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

export default async function PurchaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ posted?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { countryCode, profileLocale, supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const { locale, t } = await getAppLocaleAndText(countryCode, profileLocale);
  const d = t.purchases.detail;
  const f = t.purchases.form;
  const taxLabel = f.vat;

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
  const badge = purchaseStatusBadge(t, purchase.status, purchase.nir_number);
  const dateStr = formatDateDisplay(purchase.purchase_date ?? purchase.purchased_at, locale);
  const supplierName = (purchase.suppliers as { name?: string } | null)?.name ?? d.direct;
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
    ? d.errors.alreadyPosted
    : query.error === "cannot_cancel"
      ? d.errors.cannotCancel
      : query.error === "nir_number"
        ? d.errors.nirNumber
        : null;

  const printTitle = purchase.nir_number
    ? locale === "ro"
      ? NIR_RO_TITLE
      : d.printTitleWithNir
    : d.printTitleLegacyFull;
  const observationsLabel = locale === "ro" ? "Observații / diferențe" : d.observations;
  const legacyTitle = locale === "ro" ? "Cumpărare veche / fără NIR" : d.legacyTitle;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 print:max-w-none print:p-4">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link href="/app/purchases" className="text-sm text-slate-500 hover:text-slate-700">
            ← {t.nav.purchases}
          </Link>
          <h1 className="text-2xl font-semibold text-slate-950 mt-1">
            {purchase.nir_number ?? d.purchase}
          </h1>
          {locale === "ro" && purchase.nir_number && (
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
          {canManage && countryCode === "RO" && items.length > 0 && (
            <Link href={`/app/invoices/new?purchaseId=${id}`}>
              <Button variant="outline">Creează factură din NIR</Button>
            </Link>
          )}
          {(purchase.status === "posted" || purchase.status === "received") && (
            <Link href={`/app/purchases/${id}/print`}>
              <Button variant="outline">{d.printNir}</Button>
            </Link>
          )}
          {canManage && isDraft && (
            <Link href={`/app/purchases/${id}/edit`}>
              <Button variant="outline">{d.editDraft}</Button>
            </Link>
          )}
        </div>
      </div>

      {query.posted === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 print:hidden">
          {d.postedSuccess}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 print:hidden">{errorMsg}</div>
      )}

      <div id="nir-print-area" className="space-y-6">
        <div className="hidden print:block border-b pb-4 mb-2">
          <h1 className="text-xl font-bold">{printTitle}</h1>
          {purchase.nir_number && <p className="text-lg font-semibold mt-1">{purchase.nir_number}</p>}
        </div>

        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="print:pb-2">
            <CardTitle>{d.detailsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {purchase.nir_number && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{t.tables.nirNo}</p>
                  <p className="font-medium text-slate-900">{purchase.nir_number}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{f.nirDate}</p>
                <p className="font-medium text-slate-900">{formatDateDisplay(purchase.nir_date ?? purchase.purchase_date, locale)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{f.supplier}</p>
                <p className="font-medium text-slate-900">{supplierName}</p>
              </div>
              {invoiceNo && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{f.invoiceNo}</p>
                  <p className="font-medium text-slate-900">{invoiceNo}</p>
                </div>
              )}
              {purchase.supplier_invoice_date && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{f.invoiceDate}</p>
                  <p className="font-medium text-slate-900">{formatDateDisplay(purchase.supplier_invoice_date, locale)}</p>
                </div>
              )}
              {siteName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{f.site}</p>
                  <p className="font-medium text-slate-900">{siteName}</p>
                </div>
              )}
              {receivedByName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{d.receivedBy}</p>
                  <p className="font-medium text-slate-900">{receivedByName}</p>
                </div>
              )}
              {postedByName && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{d.postedBy}</p>
                  <p className="font-medium text-slate-900">{postedByName}</p>
                </div>
              )}
            </div>
            {(purchase.notes || isDraft) && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-400 mb-1">{observationsLabel}</p>
                <p className="text-slate-700">{purchase.notes || "—"}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">{d.netTotal}</p>
                <p className="font-semibold text-slate-900">{money(netTotal, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{`Total ${taxLabel}`}</p>
                <p className="font-semibold text-slate-900">{money(taxTotal, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{d.grossTotal}</p>
                <p className="font-semibold text-slate-900">{money(grossTotal, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="print:pb-2">
            <CardTitle>{d.receivedItems} ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {!items.length ? (
              <p className="text-sm text-slate-400">{d.noItems}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{d.item}</TableHead>
                    <TableHead className="text-right">{f.qty}</TableHead>
                    <TableHead className="text-right">{d.netCost}</TableHead>
                    <TableHead className="text-right">{taxLabel}</TableHead>
                    <TableHead className="text-right">{d.netTotal}</TableHead>
                    <TableHead className="text-right">{taxLabel}</TableHead>
                    <TableHead className="text-right">{t.purchases.gross}</TableHead>
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
                    <TableCell colSpan={4} className="text-right text-slate-600">{d.netTotal}</TableCell>
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
              {d.generateNir}
            </Button>
          </form>
          <form action={cancelPurchase as unknown as (fd: FormData) => Promise<void>}>
            <input type="hidden" name="purchase_id" value={id} />
            <Button type="submit" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              {d.cancelDraft}
            </Button>
          </form>
        </div>
      )}

      {purchase.status === "cancelled" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 print:hidden">
          {d.draftCancelled}
        </div>
      )}

      {locked && purchase.status === "received" && !purchase.nir_number && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:hidden">
          <p className="font-medium">{legacyTitle}</p>
          <p className="mt-1 opacity-90">{d.legacyDesc}</p>
        </div>
      )}
    </div>
  );
}
