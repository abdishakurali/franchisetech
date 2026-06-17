import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, getKitchenOpsContext, sumRows } from "@/lib/kitchenops/metrics";
import { deletePurchases } from "@/app/actions/kitchenops";
import { PurchasesBulkTable } from "@/components/app/PurchasesBulkTable";
import { PageHint } from "@/components/app/PageHint";

type SupplierRef = { name: string } | null;
type PurchaseRow = {
  id: string; purchase_date: string | null; purchased_at: string | null; reference: string | null;
  total_amount: number | null; status: string | null; suppliers: SupplierRef; purchase_items: { id: string }[];
};

export default async function PurchasesPage() {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const [suppRes, purchRes] = await Promise.all([
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    supabase.from("purchases")
      .select("id,purchase_date,purchased_at,reference,total_amount,status,suppliers!purchases_supplier_id_fkey(name),purchase_items(id)")
      .eq("organisation_id", orgId)
      .order("purchased_at", { ascending: false })
      .limit(100),
  ]);
  const purchases = (purchRes.data ?? []) as unknown as PurchaseRow[];
  const totalSpend = sumRows(purchases.filter((p) => p.status !== "cancelled"), (p) => Number(p.total_amount ?? 0));
  const activeCount = purchases.filter((p) => p.status !== "cancelled").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Purchases</h1>
          <p className="text-sm text-slate-500">Stock deliveries and supplier invoices.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/purchases/import"><Button variant="outline" size="sm">Import CSV</Button></Link>
          <Link href="/app/purchases/new"><Button>Record purchase</Button></Link>
        </div>
      </div>

      <PageHint id="purchases">
        <p className="font-medium">Recording a purchase increases your stock.</p>
      </PageHint>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total spend</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totalSpend, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Purchases recorded</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Suppliers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{suppRes.data?.length ?? 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase history</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Check boxes to select, then cancel/delete selected. Click a row to view details.</p>
        </CardHeader>
        <CardContent>
          {!purchases.length ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No purchases recorded yet.</p>
              <Link href="/app/purchases/new"><Button variant="outline">Record first purchase</Button></Link>
            </div>
          ) : (
            <PurchasesBulkTable purchases={purchases as never} deleteAction={deletePurchases} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
