import Link from "next/link";
import { StockAdjustCell } from "@/components/app/StockAdjustCell";
import { updateProductStock } from "@/app/actions/kitchenops";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";

export default async function StockPage() {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  let products: Array<{id:string;name:string;current_stock_qty:number|null;reorder_level:number|null;unit_of_measure:string|null;cost_price:number|null;product_categories?:{name:string}|null}> = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("id,name,current_stock_qty,reorder_level,unit_of_measure,cost_price,product_categories(name)")
      .eq("organisation_id", orgId)
      .or("is_stock_tracked.eq.true,is_ingredient.eq.true")
      .order("name");
    products = (data ?? []) as unknown as typeof products;
  } catch {
    // Columns may not exist before migration — show empty state
    products = [];
  }

  const rows = products;

  const lowStock = rows.filter((r) => Number(r.current_stock_qty ?? 0) <= Number(r.reorder_level ?? 0));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Stock</h1>
          <p className="text-sm text-slate-500">Ingredient and product stock levels. Updated by purchases and sales.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/products?type=all" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">All stock</Link>
          <Link href="/app/products?type=ingredient" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">Ingredients</Link>
          <Link href="/app/products/import-ingredients" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">Import ingredients</Link>
          <Link href="/app/products/import-ingredients" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Import stock items</Link>
          <Link href="/app/purchases" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">Purchases</Link>
          <Link href="/app/suppliers" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">Suppliers</Link>
          <Link href="/app/purchases/new" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">Record purchase</Link>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800 mb-2">⚠ {lowStock.length} item{lowStock.length !== 1 ? "s" : ""} low in stock</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((r) => (
              <Badge key={r.id} variant="outline" className="text-red-700 border-red-300 bg-white">
                {r.name} — {Number(r.current_stock_qty ?? 0)} {r.unit_of_measure ?? "units"} (min {Number(r.reorder_level ?? 0)})
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Stock levels ({rows.length} tracked products)</CardTitle></CardHeader>
        <CardContent>
          {!rows.length ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-slate-500">No stock-tracked products yet.</p>
              <p className="text-sm text-slate-400 mt-1">Enable &quot;Track stock&quot; on a product to monitor it here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead className="text-right">Reorder at</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Cost/unit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const qty = Number(r.current_stock_qty ?? 0);
                  const reorder = Number(r.reorder_level ?? 0);
                  const isLow = qty <= reorder;
                  return (
                    <TableRow key={r.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium"><Link className="block hover:text-blue-600" href={`/app/products/${r.id}`}>{r.name}</Link></TableCell>
                      <TableCell><Link className="block" href={`/app/products/${r.id}`}>{(r.product_categories as {name:string}|null)?.name ?? "—"}</Link></TableCell>
                      <TableCell className={`text-right font-semibold ${isLow ? "text-red-600" : "text-green-700"}`}>
                        <StockAdjustCell productId={r.id} currentQty={qty} updateStock={updateProductStock} />
                      </TableCell>
                      <TableCell className="text-right text-slate-500"><Link className="block" href={`/app/products/${r.id}`}>{reorder}</Link></TableCell>
                      <TableCell><Link className="block" href={`/app/products/${r.id}`}>{r.unit_of_measure ?? "each"}</Link></TableCell>
                      <TableCell className="text-right"><Link className="block" href={`/app/products/${r.id}`}>{r.cost_price ? formatMoney(Number(r.cost_price), currency) : "—"}</Link></TableCell>
                      <TableCell>
                        {isLow
                          ? <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Low</Badge>
                          : <Badge variant="secondary">OK</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
