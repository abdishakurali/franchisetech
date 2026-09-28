import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { STOCK_PRODUCT_SELECT } from "@/lib/supabase/product-selects";

export default async function StockReportPage() {
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const sp = t.reportPages.stock;
  // Reads the same live source /app/stock reads (products.current_stock_qty)
  // rather than the unrelated `stock_items` table, which nothing in the app
  // ever writes to and always rendered empty here.
  const { data: stockRows } = await supabase
    .from("products")
    .select(STOCK_PRODUCT_SELECT)
    .eq("organisation_id", orgId)
    .eq("active", true)
    .or("is_stock_tracked.eq.true,is_ingredient.eq.true")
    .order("name");
  const stock = (stockRows ?? []) as unknown as Array<{
    id: string;
    name: string;
    current_stock_qty: number | null;
    reorder_level: number | null;
    unit_of_measure: string | null;
    cost_price: number | null;
    supplier?: { name: string } | null;
  }>;
  const estimatedValue = stock.reduce((total, item) => total + Number(item.current_stock_qty ?? 0) * Number(item.cost_price ?? 0), 0);
  const lowItems = stock.filter((item) => item.reorder_level !== null && Number(item.current_stock_qty ?? 0) <= Number(item.reorder_level));

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-semibold text-foreground">{sp.title}</h1><p className="text-sm text-muted-foreground">{sp.subtitle}</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>{sp.stockItems}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{stock.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>{sp.lowStock}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{lowItems.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>{sp.estimatedValue}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{formatMoney(estimatedValue, currency)}</CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>{sp.stockList}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{sp.item}</TableHead><TableHead>{sp.current}</TableHead><TableHead>{sp.reorder}</TableHead><TableHead>{t.tables.supplier}</TableHead><TableHead>{t.tables.value}</TableHead><TableHead>{t.tables.status}</TableHead></TableRow></TableHeader><TableBody>{stock.map((item) => {
        const low = item.reorder_level !== null && Number(item.current_stock_qty ?? 0) <= Number(item.reorder_level);
        return <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell>{Number(item.current_stock_qty ?? 0)} {item.unit_of_measure}</TableCell><TableCell>{item.reorder_level ?? "-"}</TableCell><TableCell>{item.supplier?.name ?? "-"}</TableCell><TableCell>{formatMoney(Number(item.current_stock_qty ?? 0) * Number(item.cost_price ?? 0), currency)}</TableCell><TableCell>{low ? <Badge variant="destructive">{t.tables.low}</Badge> : <Badge variant="secondary">{t.tables.ok}</Badge>}</TableCell></TableRow>;
      })}</TableBody></Table></CardContent></Card>
    </div>
  );
}
