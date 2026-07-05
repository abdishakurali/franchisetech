import Link from "next/link";
import { ActivationBanner } from "@/components/app/ActivationBanner";
import { startOfDay, startOfMonth, startOfWeek, subDays, subWeeks, subMonths, endOfDay } from "date-fns";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CreditCard,
  Package,
  TrendingUp,
  Receipt,
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
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { Suspense } from "react";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

function pctDiff(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+100%" : "—";
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

type Props = { searchParams: Promise<{ period?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { period: rawPeriod = "today" } = await searchParams;
  const period = ["today", "week", "month"].includes(rawPeriod) ? rawPeriod : "today";

  const now = new Date();
  let rangeStart: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (period === "week") {
    rangeStart = startOfWeek(now, { weekStartsOn: 1 });
    prevEnd = rangeStart;
    prevStart = subWeeks(rangeStart, 1);
  } else if (period === "month") {
    rangeStart = startOfMonth(now);
    prevEnd = rangeStart;
    prevStart = subMonths(now, 1);
  } else {
    rangeStart = startOfDay(now);
    prevEnd = rangeStart;
    prevStart = subDays(rangeStart, 1);
  }

  // Same weekday last week (only used for "today" view)
  const sameWeekdayStart = subWeeks(startOfDay(now), 1);
  const sameWeekdayEnd = subWeeks(endOfDay(now), 1);

  const monthStart = startOfMonth(now).toISOString();
  const weekAgo = subDays(now, 7).toISOString();

  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { locale, t } = await getAppLocaleAndText(countryCode, profileLocale);
  const periodLabel =
    period === "week" ? t.period.vsLastWeek : period === "month" ? t.period.vsLastMonth : t.period.vsYesterday;

  const orgModules = await fetchOrgModuleFlags(supabase, orgId);
  const inventoryVisible = isModuleEnabled(orgModules, "inventory");
  const recipeVisible = isModuleEnabled(orgModules, "recipe_costing");
  const { data: orgSettings } = await supabase
    .from("organisations")
    .select("saga_export_enabled")
    .eq("id", orgId)
    .maybeSingle();
  const accountantPackVisible = Boolean(orgSettings?.saga_export_enabled);
  const gestiuneVisible = await hasEntitlement(orgId, "reports.gestiune").catch(() => false);
  const visibleReports = filterReportLinks(t, { inventoryVisible, recipeVisible, accountantPackVisible, gestiuneVisible });

  const [
    currentTxResult,
    prevTxResult,
    sameWeekdayResult,
    sessionResult,
    monthTxResult,
    voidedCountResult,
    lowStockResult,
    purchaseWeekResult,
    todayItemsResult,
    allTimeTxCountResult,
  ] = await Promise.all([
    // sold_at is the real sale date; created_at is row-insert time, which for
    // migrated historical sales is the bulk-import timestamp, not when the
    // sale actually happened.
    supabase
      .from("pos_transactions")
      .select("total,tip_amount,payment_methods(type)")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("sold_at", rangeStart.toISOString()),
    supabase
      .from("pos_transactions")
      .select("total")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("sold_at", prevStart.toISOString())
      .lt("sold_at", prevEnd.toISOString()),
    period === "today"
      ? supabase
          .from("pos_transactions")
          .select("total")
          .eq("organisation_id", orgId)
          .eq("status", "completed")
          .gte("sold_at", sameWeekdayStart.toISOString())
          .lte("sold_at", sameWeekdayEnd.toISOString())
      : Promise.resolve({ data: [] as { total: number }[], error: null }),
    supabase.from("pos_sessions").select("expected_cash,status").eq("organisation_id", orgId).eq("status", "open").limit(1).maybeSingle(),
    supabase.from("pos_transactions").select("total").eq("organisation_id", orgId).eq("status", "completed").gte("sold_at", monthStart),
    supabase.from("pos_transactions").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "voided").gte("sold_at", monthStart),
    inventoryVisible
      ? supabase.from("products").select("id,name,current_stock_qty,reorder_level,unit_of_measure").eq("organisation_id", orgId).eq("active", true).or("is_stock_tracked.eq.true,is_ingredient.eq.true")
      : Promise.resolve({ data: [], error: null }),
    // purchase_date is the real receiving date; created_at is row-insert
    // time, which for migrated historical purchases doesn't match (54/62
    // mismatched for this org) -- same class of bug as the sales queries above.
    inventoryVisible
      ? supabase.from("purchases").select("total_amount,status").eq("organisation_id", orgId).gte("purchase_date", weekAgo)
      : Promise.resolve({ data: [], error: null }),
    // Scoped via the parent transaction's sold_at (see comment above), not
    // pos_transaction_items.created_at.
    supabase
      .from("pos_transactions")
      .select("pos_transaction_items(product_name,quantity,gross_amount,line_total)")
      .eq("organisation_id", orgId)
      .gte("sold_at", rangeStart.toISOString()),
    supabase
      .from("pos_transactions")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("status", "completed"),
  ]);

  const currentTx = currentTxResult.data ?? [];
  const prevTx = prevTxResult.data ?? [];
  const sameWeekdayTx = sameWeekdayResult.data ?? [];
  const sessionData = sessionResult.data;
  const monthTx = monthTxResult.data ?? [];
  const voidedCount = voidedCountResult.count ?? 0;
  const lowStockResultData = lowStockResult.data ?? [];
  const purchaseWeek = purchaseWeekResult.data ?? [];
  type DashboardItem = { product_name: string; quantity: number | null; gross_amount: number | null; line_total: number | null };
  const todayItems: DashboardItem[] = (todayItemsResult.data ?? []).flatMap(
    (tx) => (tx as unknown as { pos_transaction_items?: DashboardItem[] }).pos_transaction_items ?? []
  );
  const allTimeTxCount = allTimeTxCountResult.count ?? 0;
  const showActivationBanner = allTimeTxCount === 0;

  const currentTotal = currentTx.reduce((s, tx) => s + Number(tx.total ?? 0), 0);
  const currentTips = currentTx.reduce((s, tx) => s + Number(tx.tip_amount ?? 0), 0);
  const currentSalesExTips = currentTotal - currentTips;
  const currentCount = currentTx.length;
  const avgTicket = currentCount > 0 ? currentSalesExTips / currentCount : 0;

  const prevTotal = prevTx.reduce((s, tx) => s + Number(tx.total ?? 0), 0);
  const sameWeekdayTotal = sameWeekdayTx.reduce((s, tx) => s + Number(tx.total ?? 0), 0);

  const isGrowing = currentSalesExTips >= prevTotal;
  const salesColor = prevTotal === 0 && currentTotal === 0 ? "text-slate-950" : isGrowing ? "text-green-600" : "text-red-600";
  const diffSign = isGrowing ? "+" : "";
  const diffAmount = currentSalesExTips - prevTotal;

  const currentCash = currentTx.filter((tx) => (tx.payment_methods as { type?: string } | null)?.type === "cash").reduce((s, tx) => s + Number(tx.total ?? 0), 0);
  const currentCard = currentTotal - currentCash;
  const expectedCash = Number(sessionData?.expected_cash ?? 0);
  const monthTotal = monthTx.reduce((s, tx) => s + Number(tx.total ?? 0), 0);
  const purchaseSpend = purchaseWeek
    .filter((p) => p.status === "posted" || p.status === "received")
    .reduce((s, p) => s + Number(p.total_amount ?? 0), 0);

  const lowStock = lowStockResultData.filter((p) => Number(p.reorder_level ?? 0) > 0 && Number(p.current_stock_qty ?? 0) <= Number(p.reorder_level ?? 0));

  // Top 5 products by revenue in current period
  const byProduct = new Map<string, { qty: number; total: number }>();
  for (const item of todayItems) {
    const row = byProduct.get(item.product_name) ?? { qty: 0, total: 0 };
    row.qty += Number(item.quantity ?? 1);
    row.total += Number(item.gross_amount ?? item.line_total ?? 0);
    byProduct.set(item.product_name, row);
  }
  const topProducts = [...byProduct.entries()]
    .map(([name, row]) => ({ name, ...row }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const attentionCols = 1 + (inventoryVisible ? 1 : 0) + (recipeVisible ? 1 : 0);
  const showAttentionRow = attentionCols > 0 || inventoryVisible;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {showActivationBanner && <ActivationBanner locale={locale} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{t.dashboard.title}</h1>
          <p className="text-sm text-slate-500">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sessionData ? (
            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
              {t.dashboard.tillOpen}
            </div>
          ) : null}
          <DateFilter current={period} />
          <Link href="/app/setup-checklist"><Button variant="outline">{t.dashboard.setupGuide}</Button></Link>
          <Link href="/app/pos"><Button className="bg-blue-600 hover:bg-blue-700 text-white">{t.dashboard.openPos}</Button></Link>
        </div>
      </div>

      {/* ── Primary metrics row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <BarChart3 className="h-4 w-4" />{t.dashboard.sales}{currentTips > 0 ? t.common.exTips : ""}
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
                  <BarChart3 className="h-4 w-4" />{t.dashboard.sales}{currentTips > 0 ? t.common.exTips : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${salesColor}`}>{money(currentSalesExTips, currency)}</p>
                <p className="text-xs text-slate-400">{t.common.transactions(currentCount)}{currentTips > 0 ? ` · +${money(currentTips, currency)} ${t.common.tips}` : ""}</p>
                {prevTotal > 0 || currentTotal > 0 ? (
                  <p className={`text-xs mt-0.5 ${isGrowing ? "text-green-600" : "text-red-600"}`}>
                    {diffSign}{money(diffAmount, currency)} {periodLabel}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </DashboardSalesHighlight>
        </Suspense>

        {/* Transactions + avg ticket */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Receipt className="h-4 w-4" />{t.dashboard.transactions ?? "Transactions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{currentCount}</p>
            {currentCount > 0 ? (
              <p className="text-xs text-slate-400">{t.dashboard.avgTicket ?? "Avg ticket"}: {money(avgTicket, currency)}</p>
            ) : (
              <p className="text-xs text-slate-400">{t.dashboard.noSalesYet ?? "No sales yet"}</p>
            )}
            {period === "today" && sameWeekdayTotal > 0 ? (
              <p className={`text-xs mt-0.5 ${currentSalesExTips >= sameWeekdayTotal ? "text-green-600" : "text-slate-400"}`}>
                {pctDiff(currentSalesExTips, sameWeekdayTotal)} {t.dashboard.vsSameWeekday ?? "vs same day last week"}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Cash/card split */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Banknote className="h-4 w-4" />{t.dashboard.cashInTill}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(expectedCash, currency)}</p>
            <p className="text-xs text-slate-400">{sessionData ? t.dashboard.tillIsOpen : t.dashboard.openTillHint}</p>
            {currentCount > 0 ? (
              <p className="text-xs text-slate-400 mt-0.5">
                {t.common.cash} {money(currentCash, currency)} · {t.common.card} {money(currentCard, currency)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Month total */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <CreditCard className="h-4 w-4" />{t.dashboard.thisMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money(monthTotal, currency)}</p>
            <p className="text-xs text-slate-400">
              {voidedCount > 0 ? `${t.common.voided}: ${voidedCount}` : t.dashboard.monthNoVoids ?? "No voids this month"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Top products + stock watch ── */}
      {(topProducts.length > 0 || (inventoryVisible && lowStock.length > 0)) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {topProducts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.dashboard.topProducts ?? "Top products"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 shrink-0 text-xs font-medium text-slate-400">{i + 1}.</span>
                      <span className="truncate text-slate-800">{p.name}</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-xs text-slate-400">×{p.qty}</span>
                      <span className="font-semibold text-slate-950">{money(p.total, currency)}</span>
                    </div>
                  </div>
                ))}
                <Link href="/app/reports/sales" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline pt-1">
                  {t.dashboard.viewFullReport ?? "Full sales report"} <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}
          {inventoryVisible && (
            <Card>
              <CardHeader><CardTitle className="text-base">{t.dashboard.stockWatch}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lowStock.length ? lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge variant="outline">{Number(p.current_stock_qty ?? 0)} {p.unit_of_measure ?? ""}</Badge>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">{t.dashboard.stockOk}</p>
                )}
                <Link href="/app/stock" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  {t.dashboard.viewStock} <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {showAttentionRow && !topProducts.length ? (
        <div className={`grid gap-4 ${inventoryVisible ? "lg:grid-cols-3" : ""}`}>
          <Card className={inventoryVisible ? "lg:col-span-2" : ""}>
            <CardHeader><CardTitle className="text-base">{t.dashboard.attention}</CardTitle></CardHeader>
            <CardContent className={`grid gap-3 ${attentionCols >= 3 ? "sm:grid-cols-3" : attentionCols === 2 ? "sm:grid-cols-2" : ""}`}>
              <Link href="/app/products/new" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
                <Package className="mb-2 h-5 w-5 text-blue-600" />
                <p className="font-semibold">{t.dashboard.addProducts}</p>
                <p className="text-xs text-slate-500">{t.dashboard.addProductsDesc}</p>
              </Link>
              {inventoryVisible ? (
                <Link href="/app/stock" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
                  <Package className="mb-2 h-5 w-5 text-blue-600" />
                  <p className="font-semibold">{t.dashboard.manageStock}</p>
                  <p className="text-xs text-slate-500">{t.dashboard.manageStockDesc}</p>
                </Link>
              ) : null}
              {recipeVisible ? (
                <Link href="/app/recipes/new" className="rounded-xl border p-4 hover:border-blue-200 hover:bg-blue-50">
                  <TrendingUp className="mb-2 h-5 w-5 text-blue-600" />
                  <p className="font-semibold">{t.dashboard.createRecipe}</p>
                  <p className="text-xs text-slate-500">{t.dashboard.createRecipeDesc}</p>
                </Link>
              ) : null}
            </CardContent>
          </Card>
          {inventoryVisible ? (
            <Card>
              <CardHeader><CardTitle className="text-base">{t.dashboard.stockWatch}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lowStock.length ? lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge variant="outline">{Number(p.current_stock_qty ?? 0)} {p.unit_of_measure ?? ""}</Badge>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">{t.dashboard.stockOk}</p>
                )}
                <Link href="/app/stock" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  {t.dashboard.viewStock} <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* ── Reports grid ── */}
      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700">{t.dashboard.reports}</h2>
          {inventoryVisible ? (
            <p className="text-xs text-slate-500">
              {t.dashboard.purchases7d(money(purchaseSpend, currency))}
              {lowStock.length > 0 ? (
                <span className="ml-2 text-amber-600">
                  · {t.dashboard.lowStock(lowStock.length)}
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
