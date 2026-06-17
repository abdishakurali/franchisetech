import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { cancelPurchase } from "@/app/actions/kitchenops";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*,suppliers!purchases_supplier_id_fkey(id,name),purchase_items(id,product_id,product_name,quantity,unit_cost,total_cost,unit_of_measure)")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!purchase) redirect("/app/purchases");

  const canManage = ["owner", "manager"].includes(membership.role ?? "");
  const isCancelled = purchase.status === "cancelled";
  const dateStr = String(purchase.purchase_date ?? purchase.purchased_at ?? "").slice(0, 10);
  const supplierName = (purchase.suppliers as { name?: string } | null)?.name ?? "Direct";

  type PurchaseItem = { id: string; product_id?: string; product_name?: string; quantity: number; unit_cost: number; total_cost: number; unit_of_measure?: string };
  const items = (purchase.purchase_items ?? []) as PurchaseItem[];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/app/purchases" className="text-sm text-slate-500 hover:text-slate-700">← Purchases</Link>
          <h1 className="text-2xl font-semibold text-slate-950 mt-1">Purchase</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">{dateStr}</span>
            {isCancelled ? (
              <Badge variant="secondary" className="text-red-600 bg-red-50 border-red-200">Cancelled</Badge>
            ) : (
              <Badge variant="secondary" className="text-green-700 bg-green-50">Received</Badge>
            )}
          </div>
        </div>
        {canManage && !isCancelled && (
          <form action={cancelPurchase as unknown as (fd: FormData) => Promise<void>}>
            <input type="hidden" name="purchase_id" value={id} />
            <Button type="submit" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Cancel purchase
            </Button>
          </form>
        )}
      </div>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Supplier</p>
              <p className="font-medium text-slate-900">{supplierName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Date</p>
              <p className="font-medium text-slate-900">{dateStr}</p>
            </div>
            {purchase.reference && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Reference / Invoice</p>
                <p className="font-medium text-slate-900">{purchase.reference}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Total</p>
              <p className="text-lg font-bold text-slate-900">{money(Number(purchase.total_amount ?? 0), currency)}</p>
            </div>
          </div>
          {purchase.notes && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-slate-700">{purchase.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader><CardTitle>Items ({items.length})</CardTitle></CardHeader>
        <CardContent>
          {!items.length ? (
            <p className="text-sm text-slate-400">No items recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product_id ? (
                        <Link href={`/app/products/${item.product_id}`} className="hover:text-blue-600 hover:underline">
                          {item.product_name ?? "—"}
                        </Link>
                      ) : (
                        item.product_name ?? "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity} {item.unit_of_measure ?? ""}</TableCell>
                    <TableCell className="text-right">{money(Number(item.unit_cost ?? 0), currency)}</TableCell>
                    <TableCell className="text-right font-medium">{money(Number(item.total_cost ?? 0), currency)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-semibold">
                  <TableCell colSpan={3} className="text-right text-slate-600">Total</TableCell>
                  <TableCell className="text-right">{money(Number(purchase.total_amount ?? 0), currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isCancelled && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          This purchase has been cancelled. Stock levels were not updated when it was cancelled.
        </div>
      )}
    </div>
  );
}
