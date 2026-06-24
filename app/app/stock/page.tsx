import Link from "next/link";
import { StockAdjustCell } from "@/components/app/StockAdjustCell";
import { StockFilterBar } from "@/components/app/StockFilterBar";
import { StockLowStockPanel } from "@/components/app/StockLowStockPanel";
import { updateProductStock } from "@/app/actions/kitchenops";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { STOCK_PRODUCT_SELECT } from "@/lib/supabase/product-selects";

export default async function StockPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string; archived?: string }>;
}) {
  await requireBusinessModule("inventory");
  const params = await searchParams;
  const filter = params?.filter === "low" ? "low" : "all";
  const showArchived = params?.archived === "1";
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  let products: Array<{id:string;name:string;current_stock_qty:number|null;reorder_level:number|null;unit_of_measure:string|null;cost_price:number|null;active?:boolean|null;inventory_category?:{name:string}|null}> = [];
  try {
    let query = supabase
      .from("products")
      .select(STOCK_PRODUCT_SELECT)
      .eq("organisation_id", orgId)
      .or("is_stock_tracked.eq.true,is_ingredient.eq.true")
      .order("name");
    if (!showArchived) {
      query = query.eq("active", true);
    }
    const { data } = await query;
    products = (data ?? []) as unknown as typeof products;
  } catch {
    products = [];
  }

  const allRows = products;
  const lowStock = allRows
    .filter((r) => Number(r.current_stock_qty ?? 0) <= Number(r.reorder_level ?? 0))
    .map((r) => ({
      id: r.id,
      name: r.name,
      current_stock_qty: Number(r.current_stock_qty ?? 0),
      reorder_level: Number(r.reorder_level ?? 0),
      unit_of_measure: r.unit_of_measure,
    }));
  const rows = filter === "low" ? allRows.filter((r) => lowStock.some((l) => l.id === r.id)) : allRows;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-950">{t.stock.title}</h1>
          <p className="text-sm text-slate-500">{t.stock.subtitle}</p>
          <div className="mt-3">
            <StockFilterBar filter={filter} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={showArchived ? `/app/stock?filter=${filter}` : `/app/stock?filter=${filter}&archived=1`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">
            {showArchived ? t.stock.hideArchived : t.stock.showArchived}
          </Link>
          <Link href="/app/products?type=all" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">{t.stock.allStock}</Link>
          <Link href="/app/products?type=ingredient" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">{t.stock.ingredients}</Link>
          <Link href="/app/products/import-ingredients" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors">{t.stock.importIngredients}</Link>
          <Link href="/app/purchases/new" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">{t.stock.recordPurchase}</Link>
        </div>
      </div>

      {filter === "all" && lowStock.length > 0 ? <StockLowStockPanel items={lowStock} /> : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            {filter === "low"
              ? `${t.stock.showLowStockOnly} (${rows.length})`
              : t.stock.stockLevelsTitle(rows.length)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {!rows.length ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-slate-500">{filter === "low" ? t.stock.lowStockSummary(0) : t.stock.empty}</p>
              <p className="text-sm text-slate-400 mt-1">{t.stock.noTrackedHint}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tables.product}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t.tables.category}</TableHead>
                    <TableHead className="text-right">{t.tables.onHand}</TableHead>
                    <TableHead className="text-right hidden md:table-cell">{t.stock.reorderAt}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t.tables.unit}</TableHead>
                    <TableHead className="text-right hidden xl:table-cell">{t.stock.costUnit}</TableHead>
                    <TableHead>{t.tables.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const qty = Number(r.current_stock_qty ?? 0);
                    const reorder = Number(r.reorder_level ?? 0);
                    const isLow = qty <= reorder;
                    return (
                      <TableRow key={r.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium max-w-[160px] sm:max-w-none">
                          <Link className="block truncate hover:text-blue-600" href={`/app/products/${r.id}`}>{r.name}</Link>
                          <p className="mt-0.5 text-xs text-slate-400 sm:hidden">
                            {t.stock.reorderAt}: {reorder} · {r.unit_of_measure ?? "each"}
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Link className="block" href={`/app/products/${r.id}`}>{r.inventory_category?.name ?? "—"}</Link>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isLow ? "text-red-600" : "text-green-700"}`}>
                          <StockAdjustCell productId={r.id} currentQty={qty} updateStock={updateProductStock} />
                        </TableCell>
                        <TableCell className="text-right text-slate-500 hidden md:table-cell">{reorder}</TableCell>
                        <TableCell className="hidden lg:table-cell">{r.unit_of_measure ?? "each"}</TableCell>
                        <TableCell className="text-right hidden xl:table-cell">{r.cost_price ? formatMoney(Number(r.cost_price), currency) : "—"}</TableCell>
                        <TableCell>
                          {isLow
                            ? <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">{t.tables.low}</Badge>
                            : <Badge variant="secondary">{t.tables.ok}</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
