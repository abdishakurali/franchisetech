import Link from "next/link";
import { startOfDay, startOfMonth, startOfWeek, subDays, subWeeks, subMonths } from "date-fns";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CreditCard,
  Package,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { DateFilter } from "@/components/app/DateFilter";
import { DashboardSalesHighlight } from "@/components/app/DashboardSalesHighlight";
import { isModuleEnabled } from "@/lib/business-modules";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { filterReportLinks } from "@/lib/app-report-links";
import { Suspense } from "react";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

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
    prevStart = subMonths(now, 1);
    periodLabel = "vs last month";
  } else {
    rangeStart = startOfDay(now);
    prevEnd = rangeStart;
    prevStart = subDays(rangeStart, 1);
    periodLabel = "vs yesterday";
  }

  const monthStart = startOfMonth(now).toISOString();
  const weekAgo = subDays(now, 7).toISOString();

  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const orgModules = await fetchOrgModuleFlags(supabase, orgId);
  const inventoryVisible = isModuleEnabled(orgModules, "inventory");
  const recipeVisible = isModuleEnabled(orgModules, "recipe_costing");
  const visibleReports = filterReportLinks({ inventoryVisible, recipeVisible });

  const [
    currentTxResult,
    prevTxResult,
    sessionResult,
    monthTxResult,
    voidedCountResult,
    lowStockResult,
    purchaseWeekResult,
  ] = await Promise.all([
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
    supabase.from("pos_transactions").select("total").eq("organisation_id", orgId).eq("status", "completed").gte("sold_at", monthStart),
    supabase.from("pos_transactions").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "voided").gte("sold_at", monthStart),
    inventoryVisible
      ? supabase.from("products").select("id,name,current_stock_qty,reorder_level,unit_of_measure").eq("organisation_id", orgId).eq("active", true).or("is_stock_tracked.eq.true,is_ingredient.eq.true")
      : Promise.resolve({ data: [], error: null }),
    inventoryVisible
      ? supabase.from("purchases").select("total_amount,status").eq("organisation_id", orgId).gte("created_at", weekAgo)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const currentTx = currentTxResult.data ?? [];
  const prevTx = prevTxResult.data ?? [];
  const sessionData = sessionResult.data;
  const monthTx = monthTxResult.data ?? [];
  const voidedCount = voidedCountResult.count ?? 0;
  const lowStockResultData = lowStockResult.data ?? [];
  const purchaseWeek = purchaseWeekResult.data ?? [];

  const currentTotal = currentTx.reduce((s, t) => s + Number(t.total ?? 0), 0);
  const currentTips = currentTx.reduce((s, t) => s + Number(t.tip_amount ?? 0), 0);
  const currentSalesExTips = currentTotal - currentTips;
  const currentCount = currentTx.length;
  const prevTotal = prevTx.reduce((s, t) => s + Number(t.total ?? 0), 0);

  const isGrowing = currentSalesExTips >= prevTotal;
  const salesColor = prevTotal === 0 && currentTotal === 0 ? "text-slate-950" : isGrowing ? "text-green-600" : "text-red-600";
  const diffSign = isGrowing ? "+" : "";
  const diffAmount = currentSalesExTips - prevTotal;

  const currentCash = currentTx.filter((t) => (t.payment_methods as { type?: string } | null)?.type === "cash").reduce((s, t) => s + Number(t.total ?? 0), 0);
  const currentCard = currentTotal - currentCash;
  const expectedCash = Number(sessionData?.expected_cash ?? 0);
  const monthTotal = monthTx.reduce((s, t) => s + Number(t.total ?? 0), 0);
  const purchaseSpend = purchaseWeek
    .filter((p) => p.status === "posted" || p.status === "received")
    .reduce((s, p) => s + Number(p.total_amount ?? 0), 0);

  const lowStock = lowStockResultData.filter((p) => Number(p.reorder_level ?? 0) > 0 && Number(p.current_stock_qty ?? 0) <= Number(p.reorder_level ?? 0));

  const attentionCols = 1 + (inventoryVisible ? 1 : 0) + (recipeVisible ? 1 : 0);
  const showAttentionRow = attentionCols > 0 || inventoryVisible;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
          <p className="text-sm text-slate-500">Sales, cash, and reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sessionData ? (
            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
              Till open
            </div>
          ) : null}
          <DateFilter current={period} />
          <Link href="/app/setup-checklist"><Button variant="outline">Setup guide</Button></Link>
          <Link href="/app/pos"><Button className="bg-blue-600 hover:bg-blue-700 text-white">Open POS</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Suspense fallback={
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <BarChart3 className="h-4 w-4" />Sales{currentTips > 0 ? " (ex tips)" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${salesColor}`}>{money(currentSalesExTips, currency)}</p>
            </CardContent>
          </Card>
        }>
          <DashboardSalesHighlight>
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
          </DashboardSalesHighlight>
        </Suspense>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Banknote className="h-4 w-4" />Cash in till
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(expectedCash, currency)}</p>
            <p className="text-xs text-slate-400">{sessionData ? "Till is open" : "Open the till to track cash"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <CreditCard className="h-4 w-4" />This month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(monthTotal, currency)}</p>
            <p className="text-xs text-slate-400">
              Cash {money(currentCash, currency)} · Card {money(currentCard, currency)}
              {voidedCount > 0 ? ` · Voided: ${voidedCount}` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {showAttentionRow ? (
        <div className={`grid gap-4 ${inventoryVisible ? "lg:grid-cols-3" : ""}`}>
          <Card className={inventoryVisible ? "lg:col-span-2" : ""}>
            <CardHeader><CardTitle className="text-base">What needs attention</CardTitle></CardHeader>
            <CardContent className={`grid gap-3 ${attentionCols >= 3 ? "sm:grid-cols-3" : attentionCols === 2 ? "sm:grid-cols-2" : ""}`}>
              <Link href="/app/products/new" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
                <Package className="mb-2 h-5 w-5 text-blue-600" />
                <p className="font-semibold">Add products</p>
                <p className="text-xs text-slate-500">Add items you sell.</p>
              </Link>
              {inventoryVisible ? (
                <Link href="/app/stock" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
                  <Package className="mb-2 h-5 w-5 text-blue-600" />
                  <p className="font-semibold">Manage stock</p>
                  <p className="text-xs text-slate-500">Track stock and ingredients.</p>
                </Link>
              ) : null}
              {recipeVisible ? (
                <Link href="/app/recipes/new" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
                  <TrendingUp className="mb-2 h-5 w-5 text-blue-600" />
                  <p className="font-semibold">Create recipe</p>
                  <p className="text-xs text-slate-500">See margin and can make.</p>
                </Link>
              ) : null}
            </CardContent>
          </Card>
          {inventoryVisible ? (
            <Card>
              <CardHeader><CardTitle className="text-base">Stock watch</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lowStock.length ? lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge variant="outline">{Number(p.current_stock_qty ?? 0)} {p.unit_of_measure ?? ""}</Badge>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">Stock looks okay.</p>
                )}
                <Link href="/app/stock" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  View stock <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700">Reports</h2>
          {inventoryVisible ? (
            <p className="text-xs text-slate-500">
              Purchases (7 days): {money(purchaseSpend, currency)}
              {lowStock.length > 0 ? (
                <span className="ml-2 text-amber-600">
                  · {lowStock.length} low stock
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleReports.map((r) => (
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
                    {r.tag ? (
                      <span className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 font-medium">{r.tag}</span>
                    ) : null}
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
