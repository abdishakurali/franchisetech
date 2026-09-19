import Link from "next/link";
import { StockAdjustCell } from "@/components/app/StockAdjustCell";
import { StockFilterBar, type StockView } from "@/components/app/StockFilterBar";
import { StockLowStockPanel } from "@/components/app/StockLowStockPanel";
import { updateProductStock } from "@/app/actions/kitchenops";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
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
  const filter: StockView = params?.filter === "low" || params?.filter === "order" || params?.filter === "supplier" ? params.filter : "all";
  const showArchived = params?.archived === "1";
  const { countryCode, profileLocale, supabase, orgId } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  let products: Array<{id:string;name:string;current_stock_qty:number|null;reorder_level:number|null;unit_of_measure:string|null;active?:boolean|null;inventory_category?:{name:string}|null;supplier?:{name:string}|null}> = [];
  let loadError = false;
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
    const { data, error } = await query;
    if (error) throw error;
    products = (data ?? []) as unknown as typeof products;
  } catch {
    loadError = true;
  }

  const allRows = products;
  const belowMinimum = (r: typeof allRows[number]) => Number(r.current_stock_qty ?? 0) <= Number(r.reorder_level ?? 0);
  const lowStock = allRows
    .filter(belowMinimum)
    .map((r) => ({
      id: r.id,
      name: r.name,
      current_stock_qty: Number(r.current_stock_qty ?? 0),
      reorder_level: Number(r.reorder_level ?? 0),
      unit_of_measure: r.unit_of_measure,
    }));
  const orderRows = allRows.filter((r) => Number(r.reorder_level ?? 0) > 0 && belowMinimum(r));
  const rows = filter === "low" ? allRows.filter(belowMinimum)
    : filter === "order" ? orderRows
    : filter === "supplier" ? [...allRows].sort((a, b) => (a.supplier?.name ?? "zzzz").localeCompare(b.supplier?.name ?? "zzzz", "ro") || a.name.localeCompare(b.name, "ro"))
    : allRows;
  const formatQty = (value: number) => value.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-full space-y-5 bg-background p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.025em] text-foreground">{t.stock.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{allRows.length} articole urmărite · {lowStock.length} sub minim</p>
          <div className="mt-3">
            <StockFilterBar filter={filter} showArchived={showArchived} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="#stock-table" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-brass/30 hover:text-brass transition-colors">Mișcare stoc</Link>
          <Link href="/app/purchases/new" className="inline-flex items-center gap-1.5 rounded-lg bg-brass px-3 py-2 text-sm font-medium text-white hover:bg-brass/90 transition-colors">Recepție marfă</Link>
          <Link href={showArchived ? `/app/stock?filter=${filter}` : `/app/stock?filter=${filter}&archived=1`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-mid hover:border-brass/30 hover:text-brass transition-colors">
            {showArchived ? t.stock.hideArchived : t.stock.showArchived}
          </Link>
        </div>
      </div>

      {loadError ? <div role="alert" className="rounded-xl border border-attention/25 bg-attention/10 p-4 text-sm text-red-800">Stocul nu a putut fi încărcat. Reîncearcă pagina.</div> : null}
      {!loadError && filter === "order" && orderRows.length > 0 ? <StockLowStockPanel items={lowStock.filter((item) => item.reorder_level > 0)} /> : null}

      <Card id="stock-table" className="gap-0 overflow-hidden rounded-[10px] border-border py-0 shadow-none">
        <CardContent className="p-0">
          {loadError ? null : !rows.length ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-muted-foreground">{filter === "low" ? t.stock.lowStockSummary(0) : t.stock.empty}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.stock.noTrackedHint}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-card [&_th]:h-11 [&_th]:px-[18px] [&_th]:font-mono [&_th]:text-[11px] [&_th]:font-normal [&_th]:uppercase [&_th]:tracking-[0.06em] [&_th]:text-muted-foreground">
                  <TableRow>
                    <TableHead>Articol</TableHead>
                    {filter === "supplier" ? <TableHead className="hidden sm:table-cell">Furnizor</TableHead> : null}
                    <TableHead className="hidden sm:table-cell">U.M.</TableHead>
                    <TableHead className="text-right">Stoc</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Minim</TableHead>
                    <TableHead>{t.tables.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_td]:px-[18px] [&_td]:py-4">
                  {rows.map((r) => {
                    const qty = Number(r.current_stock_qty ?? 0);
                    const reorder = Number(r.reorder_level ?? 0);
                    const isLow = qty <= reorder;
                    return (
                      <TableRow key={r.id} className="hover:bg-secondary">
                        <TableCell className="font-medium max-w-[160px] sm:max-w-none">
                          <Link className="block truncate hover:text-brass" href={`/app/products/${r.id}`}>{r.name}</Link>
                          {r.inventory_category?.name && <p className="mt-0.5 text-xs font-normal text-muted-foreground">{r.inventory_category.name}</p>}
                          <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                            {t.stock.reorderAt}: {reorder} · {r.unit_of_measure ?? "each"}
                          </p>
                        </TableCell>
                        {filter === "supplier" ? <TableCell className="hidden sm:table-cell">{r.supplier?.name ?? "Fără furnizor"}</TableCell> : null}
                        <TableCell className="hidden sm:table-cell">{r.unit_of_measure ?? "buc"}</TableCell>
                        <TableCell className={`text-right font-semibold ${isLow ? "text-attention" : "text-reconciled"}`}>
                          <span className="font-mono tabular-nums"><StockAdjustCell productId={r.id} currentQty={qty} updateStock={updateProductStock} /></span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground hidden md:table-cell font-mono tabular-nums">{formatQty(reorder)}</TableCell>
                        <TableCell>
                          {isLow
                            ? <Badge variant="outline" className="text-attention border-attention/25 bg-attention/10">{t.tables.low}</Badge>
                            : <Badge variant="secondary" className="bg-reconciled/10 text-reconciled">{t.tables.ok}</Badge>}
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
      <p className="text-xs text-muted-foreground">Pentru mișcare manuală, apasă pe cantitatea din coloana Stoc.</p>
    </div>
  );
}
