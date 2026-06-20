import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, getKitchenOpsContext, sumRows } from "@/lib/kitchenops/metrics";
import { deletePurchases } from "@/app/actions/kitchenops";
import { PurchasesBulkTable } from "@/components/app/PurchasesBulkTable";
import { PageHint } from "@/components/app/PageHint";
import { countsTowardPurchaseSpend } from "@/lib/nir/purchase";
import { requireBusinessModule } from "@/lib/module-guard";

type SupplierRef = { name: string } | null;
type PurchaseRow = {
  id: string;
  purchase_date: string | null;
  purchased_at: string | null;
  reference: string | null;
  invoice_number: string | null;
  nir_number: string | null;
  total_amount: number | null;
  tax_total: number | null;
  status: string | null;
  suppliers: SupplierRef;
  purchase_items: { id: string }[];
};

export default async function PurchasesPage() {
  await requireBusinessModule("inventory");
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const isRO = currency === "RON";
  const purchRes = await supabase.from("purchases")
      .select("id,purchase_date,purchased_at,reference,invoice_number,nir_number,total_amount,tax_total,status,suppliers!purchases_supplier_id_fkey(name),purchase_items(id)")
      .eq("organisation_id", orgId)
      .order("purchased_at", { ascending: false })
      .limit(100);
  const purchases = (purchRes.data ?? []) as unknown as PurchaseRow[];
  const spendRows = purchases.filter((p) => countsTowardPurchaseSpend(p.status));
  const totalSpend = sumRows(spendRows, (p) => Number(p.total_amount ?? 0));
  const totalVat = sumRows(spendRows, (p) => Number(p.tax_total ?? 0));
  const activeCount = spendRows.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{isRO ? "Cumpărături / NIR" : "Purchases / NIR"}</h1>
          <p className="text-sm text-slate-500">
            {isRO ? "Recepții furnizor, NIR și facturi de achiziție." : "Supplier deliveries, NIR notes, and purchase invoices."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/purchases/import"><Button variant="outline" size="sm">{isRO ? "Import CSV" : "Import CSV"}</Button></Link>
          <Link href="/app/purchases/new"><Button>{isRO ? "NIR nou" : "New NIR"}</Button></Link>
        </div>
      </div>

      <PageHint id="purchases">
        <p className="font-medium">{isRO ? "NIR emis = stoc actualizat. Ciorna = fără modificare stoc." : "Posted NIR updates stock. Drafts do not change stock."}</p>
      </PageHint>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{isRO ? "Total achiziții" : "Total spend"}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totalSpend, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{isRO ? "Total TVA achiziții" : "Purchase VAT total"}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totalVat, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{isRO ? "NIR / cumpărări active" : "Active NIR / purchases"}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{activeCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isRO ? "Istoric cumpărături" : "Purchase history"}</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            {isRO
              ? "Selectați ciorne pentru anulare. NIR emise și cumpărările vechi sunt blocate."
              : "Select drafts to cancel. Posted NIR and legacy purchases are locked."}
          </p>
        </CardHeader>
        <CardContent>
          {!purchases.length ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">{isRO ? "Nicio cumpărare înregistrată." : "No purchases recorded yet."}</p>
              <Link href="/app/purchases/new"><Button variant="outline">{isRO ? "Primul NIR" : "Record first NIR"}</Button></Link>
            </div>
          ) : (
            <PurchasesBulkTable purchases={purchases as never} deleteAction={deletePurchases} currency={currency} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
