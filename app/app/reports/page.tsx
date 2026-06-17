import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { PageHint } from "@/components/app/PageHint";
import { startOfDay, subDays } from "date-fns";
import {
  BarChart3, FileText, TrendingUp, Package, ShoppingBag,
  Receipt, Calculator,
  CreditCard, Banknote, AlertTriangle, ArrowRight,
} from "lucide-react";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

const reportLinks = [
  {
    href: "/app/reports/sales",
    icon: BarChart3,
    title: "Sales report",
    desc: "Totals, transactions, and top products.",
    color: "bg-blue-50 text-blue-700",
    tag: "Most used",
  },
  {
    href: "/app/reports/z-report",
    icon: Receipt,
    title: "Till close report",
    desc: "Cash and card totals, opening cash, counted cash.",
    color: "bg-green-50 text-green-700",
    tag: "End of day",
  },
  {
    href: "/app/reports/vat",
    icon: Calculator,
    title: "VAT report",
    desc: "Net, VAT, and gross sales by VAT rate.",
    color: "bg-purple-50 text-purple-700",
    tag: "Tax",
  },
  {
    href: "/app/reports/stock",
    icon: Package,
    title: "Stock report",
    desc: "Current stock levels and reorder alerts.",
    color: "bg-orange-50 text-orange-700",
    tag: null,
  },
  {
    href: "/app/reports/purchases",
    icon: ShoppingBag,
    title: "Purchases report",
    desc: "Supplier spend and purchase history.",
    color: "bg-amber-50 text-amber-700",
    tag: null,
  },
  {
    href: "/app/reports/margins",
    icon: TrendingUp,
    title: "Margins report",
    desc: "Product cost and margin.",
    color: "bg-teal-50 text-teal-700",
    tag: null,
  },
  {
    href: "/app/transactions",
    icon: FileText,
    title: "Transactions",
    desc: "Search sales, view receipts, refund or void.",
    color: "bg-indigo-50 text-indigo-700",
    tag: null,
  },
];

export default async function ReportsPage() {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const today = new Date();
  const startToday = startOfDay(today).toISOString();
  const weekAgo = subDays(today, 7).toISOString();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [todayTx, monthTx, voidedCount, sessionResult, lowStockResult, purchaseWeek] = await Promise.all([
    supabase.from("pos_transactions").select("total,payment_methods(type)").eq("organisation_id", orgId).eq("status", "completed").gte("sold_at", startToday),
    supabase.from("pos_transactions").select("total").eq("organisation_id", orgId).eq("status", "completed").gte("sold_at", monthStart),
    supabase.from("pos_transactions").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "voided").gte("sold_at", monthStart),
    supabase.from("pos_sessions").select("expected_cash,status,opened_at").eq("organisation_id", orgId).eq("status", "open").limit(1).maybeSingle(),
    supabase.from("products").select("id,name,current_stock_qty,reorder_level,unit_of_measure").eq("organisation_id", orgId).eq("active", true).or("is_stock_tracked.eq.true,is_ingredient.eq.true"),
    supabase.from("purchases").select("total_amount").eq("organisation_id", orgId).gte("created_at", weekAgo),
  ]);

  const todayTotal = (todayTx.data ?? []).reduce((s, t) => s + Number(t.total ?? 0), 0);
  const todayCount = todayTx.data?.length ?? 0;
  const todayCash = (todayTx.data ?? []).filter((t) => (t.payment_methods as { type?: string } | null)?.type === "cash").reduce((s, t) => s + Number(t.total ?? 0), 0);
  const todayCard = todayTotal - todayCash;
  const monthTotal = (monthTx.data ?? []).reduce((s, t) => s + Number(t.total ?? 0), 0);
  const purchaseSpend = (purchaseWeek.data ?? []).reduce((s, p) => s + Number(p.total_amount ?? 0), 0);

  const allProducts = lowStockResult.data ?? [];
  const lowStockItems = allProducts.filter((p) => {
    const qty = Number(p.current_stock_qty ?? 0);
    const level = Number(p.reorder_level ?? 0);
    return level > 0 && qty <= level;
  });

  const openSession = sessionResult.data;
  const expectedCash = Number(openSession?.expected_cash ?? 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Reports</h1>
          <p className="text-sm text-slate-500">Sales, cash, stock, and product performance.</p>
        </div>
        {openSession && (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">Till open</span>
            <Link href="/app/pos" className="text-xs text-blue-600 hover:underline">→ Go to POS</Link>
          </div>
        )}
      </div>

      <PageHint id="reports">
        <p className="font-medium">Reports show sales, cash, stock, and product performance.</p>
      </PageHint>

      {/* Live KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />Today&apos;s sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{money(todayTotal, currency)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{todayCount} transaction{todayCount !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />Cash / Card today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-slate-950">{money(todayCash, currency)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Card: {money(todayCard, currency)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />This month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{money(monthTotal, currency)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Voided: {voidedCount.count ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />Purchase spend (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{money(purchaseSpend, currency)}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {lowStockItems.length > 0 ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />{lowStockItems.length} low stock
                </span>
              ) : "Stock levels OK"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expected cash + low stock if till open */}
      {(openSession || lowStockItems.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {openSession && (
            <Card className="border-green-200 bg-green-50/40">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm font-semibold text-green-800 mb-2">Till is open</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Expected cash</span><strong className="text-green-700">{money(expectedCash, currency)}</strong></div>
                </div>
                <Link href="/app/pos" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  Open POS <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}
          {lowStockItems.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm font-semibold text-amber-800 mb-2">⚠ {lowStockItems.length} low stock item{lowStockItems.length !== 1 ? "s" : ""}</p>
                <div className="space-y-1">
                  {lowStockItems.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{p.name}</span>
                      <Badge variant="outline" className="text-amber-700 border-amber-300 text-[10px]">
                        {Number(p.current_stock_qty ?? 0)} {p.unit_of_measure ?? ""}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link href="/app/stock" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  View stock <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Report links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">All reports</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportLinks.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.color}`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{r.title}</p>
                    {r.tag && (
                      <span className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 font-medium">{r.tag}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
