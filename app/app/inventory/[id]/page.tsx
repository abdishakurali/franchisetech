import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryCountCell } from "@/components/app/InventoryCountCell";
import { getKitchenOpsContext, formatMoney } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import { recordInventoryCountItem, finalizeInventoryCount } from "@/app/actions/kitchenops";

export default async function InventoryCountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ finalized?: string; error?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { id } = await params;
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const search = await searchParams;

  const { data: count } = await supabase
    .from("inventory_counts")
    .select("id,status,started_at,completed_at")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .maybeSingle();
  if (!count) redirect("/app/inventory");

  const { data: products } = await supabase
    .from("products")
    .select("id,name,unit_of_measure,current_stock_qty,cost_price")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .or("is_stock_tracked.eq.true,is_ingredient.eq.true")
    .order("name");

  const { data: items } = await supabase
    .from("inventory_count_items")
    .select("product_id,expected_qty,counted_qty,counted_at")
    .eq("inventory_count_id", id)
    .eq("organisation_id", orgId);

  const itemMap = new Map((items ?? []).map((i) => [i.product_id, i]));

  const rows = (products ?? []).map((p) => {
    const item = itemMap.get(p.id);
    return {
      product: p,
      expectedQty: item ? Number(item.expected_qty) : Number(p.current_stock_qty ?? 0),
      countedQty: item?.counted_qty != null ? Number(item.counted_qty) : null,
      costPrice: Number(p.cost_price ?? 0),
    };
  });

  const countedCount = rows.filter((r) => r.countedQty != null).length;
  const variances = rows.filter(
    (r) => r.countedQty != null && Math.abs(r.countedQty - r.expectedQty) > 0.001
  );
  const varianceValue = variances.reduce(
    (sum, r) => sum + (r.countedQty! - r.expectedQty) * r.costPrice,
    0
  );

  const isDraft = count.status === "draft";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/app/inventory" className="text-sm text-slate-500 hover:text-slate-700">
            ← Toate numărătorile
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Numărătoare din {new Date(count.started_at).toLocaleDateString("ro-RO")}
          </h1>
          <Badge
            variant="secondary"
            className={`mt-1 ${isDraft ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
          >
            {isDraft ? "În curs" : "Finalizată"}
          </Badge>
        </div>
        {isDraft ? (
          <form action={finalizeInventoryCount}>
            <input type="hidden" name="inventory_count_id" value={count.id} />
            <Button type="submit" disabled={countedCount === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
              Finalizează numărătoarea ({countedCount}/{rows.length} numărate)
            </Button>
          </form>
        ) : null}
      </div>

      {search?.finalized === "1" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          ✓ Numărătoarea a fost finalizată — {variances.length} diferențe aplicate ca ajustări de stoc.
        </div>
      ) : null}
      {search?.error === "finalize_failed" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          Finalizarea a eșuat. Încercați din nou.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Numărate</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{countedCount} / {rows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Diferențe găsite</CardTitle></CardHeader>
          <CardContent className={`text-2xl font-bold ${variances.length > 0 ? "text-amber-600" : "text-green-700"}`}>
            {variances.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Valoare diferențe (CMP)</CardTitle></CardHeader>
          <CardContent className={`text-2xl font-bold ${varianceValue < 0 ? "text-red-600" : varianceValue > 0 ? "text-green-700" : "text-slate-700"}`}>
            {formatMoney(varianceValue, currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Articole</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produs</TableHead>
                <TableHead className="text-right">Sistem (curent)</TableHead>
                <TableHead className="text-right">Numărat</TableHead>
                <TableHead className="text-right">Diferență</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ product, expectedQty, countedQty }) => {
                const variance = countedQty != null ? countedQty - expectedQty : null;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right tabular-nums text-slate-500">
                      {Number(product.current_stock_qty ?? 0)} {product.unit_of_measure ?? ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {isDraft ? (
                        <InventoryCountCell
                          countId={count.id}
                          productId={product.id}
                          expectedQty={Number(product.current_stock_qty ?? 0)}
                          countedQty={countedQty}
                          unit={product.unit_of_measure ?? ""}
                          recordItem={recordInventoryCountItem}
                        />
                      ) : (
                        <span className="tabular-nums">
                          {countedQty != null ? `${countedQty} ${product.unit_of_measure ?? ""}` : "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums font-medium ${
                        variance == null ? "text-slate-300" : variance < 0 ? "text-red-600" : variance > 0 ? "text-green-700" : "text-slate-400"
                      }`}
                    >
                      {variance != null ? `${variance > 0 ? "+" : ""}${variance.toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
