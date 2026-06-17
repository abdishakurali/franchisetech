import Link from "next/link";
import { startOfDay, startOfMonth, startOfWeek, subDays, subWeeks, subMonths } from "date-fns";
import { ArrowRight, Banknote, BarChart3, Calculator, FileText, Package, Receipt, ShoppingBag, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { DateFilter } from "@/components/app/DateFilter";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

const reportCards = [
  { href: "/app/reports/sales", title: "Sales", text: "Totals, transactions, and top products.", icon: BarChart3 },
  { href: "/app/reports/z-report", title: "Till close", text: "Cash, card, counted cash, and difference.", icon: Receipt },
  { href: "/app/reports/vat", title: "VAT", text: "Net, VAT, and gross sales by rate.", icon: Calculator },
  { href: "/app/reports/stock", title: "Stock", text: "Stock levels and reorder alerts.", icon: Package },
  { href: "/app/reports/purchases", title: "Purchases", text: "Supplier spend and purchase history.", icon: ShoppingBag },
  { href: "/app/reports/margins", title: "Margins", text: "Product cost and margin.", icon: TrendingUp },
  { href: "/app/transactions", title: "Transactions", text: "Receipts, refunds, and voids.", icon: FileText },
];

type Props = { searchParams: Promise<{ period?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { period: rawPeriod = "today" } = await searchParams;
  const period = ["today", "week", "month"].includes(rawPeriod) ? rawPeriod : "today";

  const now = new Date();
  let rangeStart: Date;
  let prevStart: Date;
  let prevEnd: Date;
  let periodLabel: string;

  if (period === "week") {
    rangeStart = startOfWeek(now, { weekStartsOn: 1 });
    prevEnd = rangeStart;
    prevStart = subWeeks(rangeStart, 1);
    periodLabel = "vs last week";
  } else if (period === "month") {
    rangeStart = startOfMonth(now);
    prevEnd = rangeStart;
    prevStart = startOfMonth(subMonths(now, 1));
    periodLabel = "vs last month";
  } else {
    rangeStart = startOfDay(now);
    prevEnd = rangeStart;
    prevStart = subDays(rangeStart, 1);
    periodLabel = "vs yesterday";
  }

  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const [currentTx, prevTx, sessionResult, productCount, recipeCount, lowStockResult, topItems] = await Promise.all([
    supabase
      .from("pos_transactions")
      .select("total,tip_amount,payment_methods(type)")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("created_at", rangeStart.toISOString()),
    supabase
      .from("pos_transactions")
      .select("total")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", prevEnd.toISOString()),
    supabase.from("pos_sessions").select("expected_cash,status").eq("organisation_id", orgId).eq("status", "open").limit(1).maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true),
    supabase.from("recipes").select("id", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("products").select("id,name,current_stock_qty,reorder_level,unit_of_measure").eq("organisation_id", orgId).eq("active", true).or("is_stock_tracked.eq.true,is_ingredient.eq.true"),
    supabase.from("pos_transaction_items").select("product_name,gross_amount,pos_transactions!inner(organisation_id,status)").eq("pos_transactions.organisation_id", orgId).eq("pos_transactions.status", "completed"),
  ]);

  const currentTotal = (currentTx.data ?? []).reduce((s, t) => s + Number(t.total ?? 0), 0);
  const currentTips = (currentTx.data ?? []).reduce((s, t) => s + Number(t.tip_amount ?? 0), 0);
  const currentSalesExTips = currentTotal - currentTips;
  const currentCount = currentTx.data?.length ?? 0;
  const prevTotal = (prevTx.data ?? []).reduce((s, t) => s + Number(t.total ?? 0), 0);

  const isGrowing = currentSalesExTips >= prevTotal;
  const salesColor = prevTotal === 0 && currentTotal === 0 ? "text-slate-950" : isGrowing ? "text-green-600" : "text-red-600";
  const diffSign = isGrowing ? "+" : "";
  const diffAmount = currentSalesExTips - prevTotal;

  const currentCash = (currentTx.data ?? []).filter((t) => (t.payment_methods as { type?: string } | null)?.type === "cash").reduce((s, t) => s + Number(t.total ?? 0), 0);
  const currentCard = currentTotal - currentCash;
  const expectedCash = Number(sessionResult.data?.expected_cash ?? 0);
  const productTotals = new Map<string, number>();
  for (const item of topItems.data ?? []) productTotals.set(item.product_name, (productTotals.get(item.product_name) ?? 0) + Number(item.gross_amount ?? 0));
  const topProduct = [...productTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No sales yet";
  const lowStock = (lowStockResult.data ?? []).filter((p) => Number(p.reorder_level ?? 0) > 0 && Number(p.current_stock_qty ?? 0) <= Number(p.reorder_level ?? 0));
  const setupDone = (productCount.count ?? 0) > 0 && (recipeCount.count ?? 0) > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Today at a glance</h1>
          <p className="text-sm text-slate-500">Sales, cash, stock, and margin in one quick view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter current={period} />
          <Link href="/app/setup-checklist"><Button variant="outline">Setup guide</Button></Link>
          <Link href="/app/pos"><Button className="bg-blue-600 hover:bg-blue-700 text-white">Open POS</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <BarChart3 className="h-4 w-4" />Sales{currentTips > 0 ? " (ex tips)" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${salesColor}`}>{money(currentSalesExTips, currency)}</p>
            <p className="text-xs text-slate-400">{currentCount} transaction{currentCount !== 1 ? "s" : ""}{currentTips > 0 ? ` · +${money(currentTips, currency)} tips` : ""}</p>
            {prevTotal > 0 || currentTotal > 0 ? (
              <p className={`text-xs mt-0.5 ${isGrowing ? "text-green-600" : "text-red-600"}`}>
                {diffSign}{money(diffAmount, currency)} {periodLabel}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Banknote className="h-4 w-4" />Expected cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(expectedCash, currency)}</p>
            <p className="text-xs text-slate-400">{sessionResult.data ? "Till is open" : "Open the till to track cash"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <ShoppingCart className="h-4 w-4" />Cash / card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Cash {money(currentCash, currency)}</p>
            <p className="text-xs text-slate-400">Card {money(currentCard, currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <TrendingUp className="h-4 w-4" />Top product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{topProduct}</p>
            <p className="text-xs text-slate-400">Best seller overall</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">What needs attention</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Link href="/app/products/new" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50"><Package className="mb-2 h-5 w-5 text-blue-600" /><p className="font-semibold">Add products</p><p className="text-xs text-slate-500">Add items you sell.</p></Link>
            <Link href="/app/stock" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50"><Package className="mb-2 h-5 w-5 text-blue-600" /><p className="font-semibold">Manage stock</p><p className="text-xs text-slate-500">Track stock and ingredients.</p></Link>
            <Link href="/app/recipes/new" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50"><TrendingUp className="mb-2 h-5 w-5 text-blue-600" /><p className="font-semibold">Create recipe</p><p className="text-xs text-slate-500">See margin and can make.</p></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Stock watch</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length ? lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm"><span>{p.name}</span><Badge variant="outline">{Number(p.current_stock_qty ?? 0)} {p.unit_of_measure ?? ""}</Badge></div>
            )) : <p className="text-sm text-slate-500">{setupDone ? "Stock looks okay." : "Create recipes and purchases to start tracking stock."}</p>}
            <Link href="/app/stock" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">View stock <ArrowRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business reports</CardTitle>
          <p className="text-sm text-slate-500">Clear numbers for managers and owners.</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {reportCards.map(({ href, title, text, icon: Icon }) => (
            <Link key={href} href={href} className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
              <Icon className="mb-2 h-5 w-5 text-blue-600" />
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-slate-500">{text}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
