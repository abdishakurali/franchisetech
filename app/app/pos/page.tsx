import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { isFiscalNetActive } from "@/lib/fiscalnet/eligibility";
import { DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP } from "@/lib/fiscalnet/types";
import { PosWithTour } from "@/components/app/PosWithTour";
import { PosTillStateSync } from "@/components/app/PosTillStateSync";
import { OpenTillForm } from "@/components/app/OpenTillForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { LEAN_PRODUCT_SCOPE_ENABLED } from "@/lib/product-scope";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { PageHint } from "@/components/app/PageHint";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle, ReceiptText, RefreshCcw, LayoutDashboard, Store, Calendar, Banknote, CreditCard,
} from "lucide-react";
import { VAT_RATE_COLUMNS, mapVatRateRows } from "@/lib/vat-rates-server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { PRODUCT_LIST_WITH_POS_SELECT } from "@/lib/supabase/product-selects";
import { getSubscriptionStatus, isSubscriptionBlockedForApp } from "@/lib/billing/subscription";
import { WelcomeBanner } from "@/components/app/WelcomeBanner";
import { getTabWithTable, getTables, getFloorSections } from "@/app/actions/table-service";
import { PosTableFloor } from "@/components/app/PosTableFloor";
import { requireActiveSite, listAccessibleSites } from "@/lib/site-context";
import { ReportsTrendChart, type SalesDay } from "@/components/app/ReportsTrendChart";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

function canManagePos(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

function formatTime(ts: string | null | undefined, locale: "en" | "ro") {
  if (!ts) return "—";
  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-IE", { timeStyle: "short", dateStyle: "short" }).format(new Date(ts));
}

export default async function PosPage({ searchParams }: { searchParams?: Promise<{ welcome?: string; tabId?: string; quick?: string; onboarding?: string }> }) {
  const params = await searchParams;
  const showWelcome = params?.welcome === "1";
  const tabIdParam = params?.tabId ?? null;
  const quickSale = params?.quick === "1";
  const fromOnboarding = params?.onboarding === "1";
  const { countryCode, profileLocale, supabase, orgId, currency, currencySymbol, user, membership } = await getKitchenOpsContext();
  const { locale, t } = await getAppLocaleAndText(countryCode, profileLocale);
  const subscriptionStatus = await getSubscriptionStatus(orgId).catch(() => null);
  const subscriptionBlocked = isSubscriptionBlockedForApp(subscriptionStatus);
  const billingReason = subscriptionStatus?.state === "past_due_expired" ? "past_due_expired" : "trial_expired";
  if (subscriptionBlocked) {
    const copy = locale === "ro"
      ? {
          eyebrow: subscriptionStatus?.state === "past_due_expired" ? "Plată necesară" : "Trial expirat",
          title: "POS blocat până la plată",
          body: "Nu se pot deschide sesiuni, crea comenzi sau încasa vânzări până când plata este actualizată. Datele tale rămân salvate.",
          cta: "Plătește acum",
        }
      : {
          eyebrow: subscriptionStatus?.state === "past_due_expired" ? "Payment required" : "Trial expired",
          title: "POS locked until payment",
          body: "You cannot open a till, create orders, or take payments until billing is updated. Your data remains saved.",
          cta: "Pay now",
        };

    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-secondary px-4 py-10">
        <Card className="w-full max-w-md border-attention/15 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-attention/10 text-attention">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-attention">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-mid">
              {copy.body}
            </p>
            <Link
              href={`/app/billing?reason=${billingReason}`}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              {copy.cta}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  const userRole = membership.role as string;
  const canManage = canManagePos(userRole);
  // Org name for print slips
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgRow = (membership as any)?.organisations;
  const orgInfo = Array.isArray(orgRow) ? orgRow[0] : orgRow;
  const orgName: string = orgInfo?.name ?? "Your Business";
  // Own small query rather than extending the membership join, per project constraints
  // on lib/kitchenops/data.ts. Combined with the userProfile fetch below (moved
  // up here) since both are independent single-row reads for this same request.
  const [{ data: loyaltyOrgRow }, { data: userProfile }] = await Promise.all([
    supabase.from("organisations").select("loyalty_enabled").eq("id", orgId).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);
  const features = {
    kitchenDisplay: !LEAN_PRODUCT_SCOPE_ENABLED && Boolean(orgInfo?.kitchen_display_enabled),
    restaurantOrderFlow: Boolean(orgInfo?.restaurant_order_flow_enabled),
    orderTypes: Boolean(orgInfo?.order_types_enabled),
    tableService: !LEAN_PRODUCT_SCOPE_ENABLED && Boolean(orgInfo?.table_service_enabled),
    splitPayments: Boolean(orgInfo?.payment_split_enabled),
    tips: Boolean(orgInfo?.tips_enabled),
    loyalty: !LEAN_PRODUCT_SCOPE_ENABLED && Boolean(loyaltyOrgRow?.loyalty_enabled),
  };

  let activeTab: {
    id: string;
    tableId: string;
    siteId?: string | null;
    tableName: string;
    status: "open" | "bill_requested";
    coverCount?: number | null;
    openedAt?: string;
    capacity?: number | null;
    runningTotal?: number;
  } | null = null;
  if (features.tableService && tabIdParam) {
    const tab = await getTabWithTable(tabIdParam);
    if (tab && (tab.status === "open" || tab.status === "bill_requested")) {
      activeTab = {
        id: tab.id,
        tableId: tab.table_id,
        siteId: tab.site_id,
        tableName: tab.table_name,
        status: tab.status,
        coverCount: tab.cover_count,
        openedAt: tab.opened_at,
        capacity: tab.table_capacity,
      };
    }
  }
  if (features.tableService && tabIdParam && !activeTab) {
    redirect("/app/pos");
  }
  // Current user name for print slips
  const userName: string = userProfile?.full_name || user.email || "Staff";
  // vat_rates and the FiscalNet org config are independent reads — fetched
  // concurrently via allSettled (not Promise.all) so a failure in either one
  // keeps its own existing resilience contract: vatRates falls back to []
  // the same way it always silently would downstream, and the FiscalNet
  // config stays non-fatal, same as the try/catch below always did. This
  // also removes the second, duplicate vat_rates round-trip that used to
  // happen later via listActiveVatRates() for the same org.
  const [vatRatesSettled, fnOrgSettled] = await Promise.allSettled([
    supabase
      .from("vat_rates")
      .select(VAT_RATE_COLUMNS)
      .eq("organisation_id", orgId)
      .eq("active", true)
      .order("sort_order")
      .order("rate"),
    supabase
      .from("organisations")
      .select("country_code,fiscalnet_enabled,fiscalnet_mock_mode,fiscalnet_connection_mode,fiscalnet_api_host,fiscalnet_payment_type_map,fiscalnet_operator_code,sgr_enabled")
      .eq("id", orgId)
      .maybeSingle(),
  ]);
  const vatRates = mapVatRateRows(vatRatesSettled.status === "fulfilled" ? vatRatesSettled.value.data : null);

  // FiscalNet browser config (passed to PosRegister for client-side API calls)
  let fiscalNet: BrowserFiscalConfig | null = null;
  let sgrEnabled = false;
  let isRO = false;
  // vatRateGroupMap: rate (%) → fiscalnet_vat_group code, built from vat_rates table (source of truth)
  let vatRateGroupMap: Record<number, number> = {};
  try {
    const fnOrg = fnOrgSettled.status === "fulfilled" ? fnOrgSettled.value.data : null;
    if (fnOrg) {
      // SGR deposit scheme (Romania only)
      if (fnOrg.country_code === "RO") { sgrEnabled = Boolean(fnOrg.sgr_enabled); isRO = true; }
      if (isFiscalNetActive(fnOrg.country_code, fnOrg.fiscalnet_enabled)) {
        // Build vatGroups from vat_rates table — this is the source of truth for FiscalNet groups.
        // Each vat_rates row with fiscalnet_vat_group set provides the authoritative mapping.
        const vatGroupsFromDb = vatRates
          .filter((r) => r.fiscalnet_vat_group != null)
          .map((r) => ({ code: r.fiscalnet_vat_group as number, rate: r.rate, label: `TVA ${r.rate}%` }));

        // Also build vatRateGroupMap for direct lookup in PosRegister / cart
        vatRateGroupMap = Object.fromEntries(
          vatRates
            .filter((r) => r.fiscalnet_vat_group != null)
            .map((r) => [r.rate, r.fiscalnet_vat_group as number])
        );

        const connMode = (fnOrg.fiscalnet_connection_mode as string) === "file" ? "file" : "api";
        fiscalNet = {
          enabled:        Boolean(fnOrg.fiscalnet_enabled),
          mockMode:       (fnOrg.fiscalnet_mock_mode as boolean) !== false,
          connectionMode: connMode as "api" | "file",
          apiHost:        (fnOrg.fiscalnet_api_host as string) || "http://localhost:65400",
          vatGroups:      vatGroupsFromDb.length ? vatGroupsFromDb : DEFAULT_VAT_GROUPS,
          paymentTypeMap: (fnOrg.fiscalnet_payment_type_map as typeof DEFAULT_PAYMENT_TYPE_MAP) ?? DEFAULT_PAYMENT_TYPE_MAP,
          operatorCode:   (fnOrg.fiscalnet_operator_code as string) || "1",
        };
      }
    }
  } catch { /* non-fatal */ }

  // Ensure default categories/methods exist — the two existence checks are
  // independent tables, run concurrently; each conditional seed-insert stays
  // dependent on its own check.
  const [{ data: existingCats }, { data: existingMethods }] = await Promise.all([
    supabase.from("product_categories").select("id").eq("organisation_id", orgId).limit(1),
    supabase.from("payment_methods").select("id").eq("organisation_id", orgId).limit(1),
  ]);
  if (!existingCats?.length) {
    await supabase.from("product_categories").insert([
      { organisation_id: orgId, name: "Drinks", color: "#b4903f", sort_order: 1, category_type: "pos" },
      { organisation_id: orgId, name: "Food", color: "#2f5d50", sort_order: 2, category_type: "pos" },
      { organisation_id: orgId, name: "Snacks", color: "#8b3a2e", sort_order: 3, category_type: "pos" },
    ]).then(() => null, () => null);
  }
  if (!existingMethods?.length) {
    await supabase.from("payment_methods").insert([
      { organisation_id: orgId, name: "Cash", type: "cash" },
      { organisation_id: orgId, name: "Card", type: "card" },
      { organisation_id: orgId, name: "Online", type: "online" },
      { organisation_id: orgId, name: "Other", type: "other" },
    ]).then(() => null, () => null);
  }

  // Open session and last-closed session are independent status filters on
  // the same table — run concurrently instead of one after another.
  const [{ data: sessionData }, { data: lastClosed }] = await Promise.all([
    supabase
      .from("pos_sessions")
      .select("*")
      .eq("organisation_id", orgId)
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pos_sessions")
      .select("id,opened_at,closed_at,opening_cash,counted_cash,expected_cash,notes,status,closed_by")
      .eq("organisation_id", orgId)
      .in("status", ["closed", "stale"])
      .order("closed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const openSession = sessionData ?? null;

  let lastClosedBy = "Staff";
  if (lastClosed?.closed_by) {
    const { data: closer } = await supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", lastClosed.closed_by)
      .maybeSingle();
    lastClosedBy = closer?.full_name || closer?.email || "Staff";
  }

  // Sales in last closed session
  let lastSessionTotal = 0;
  let lastSessionTxCount = 0;
  let lastSessionCash = 0;
  let lastSessionCard = 0;
  if (lastClosed) {
    const { data: lastTxs } = await supabase
      .from("pos_transactions")
      .select("total,payment_methods(type)")
      .eq("organisation_id", orgId)
      .eq("session_id", lastClosed.id)
      .eq("status", "completed");
    for (const tx of lastTxs ?? []) {
      lastSessionTotal += Number(tx.total ?? 0);
      lastSessionTxCount++;
      const type = (tx.payment_methods as { type?: string } | null)?.type ?? "other";
      if (type === "cash") lastSessionCash += Number(tx.total ?? 0);
      else lastSessionCard += Number(tx.total ?? 0);
    }
  }

  // Compute open session stats
  let cashSales = 0;
  let cardSales = 0;
  let txCount = 0;
  let cashInTotal = 0;
  let cashOutTotal = 0;
  const cashOperations: Array<{
    id: string;
    movement_type: "cash_in" | "cash_out";
    amount: number;
    reason: string | null;
    performedAt: string | null;
  }> = [];
  const productTotals = new Map<string, number>();
  if (openSession) {
    const { data: txs } = await supabase
      .from("pos_transactions")
      .select("id,total,payment_methods(type),sale_payments(method,amount),pos_transaction_items(product_name,gross_amount,line_total)")
      .eq("organisation_id", orgId)
      .eq("session_id", openSession.id)
      .eq("status", "completed");
    for (const tx of txs ?? []) {
      txCount++;
      const payments = (tx.sale_payments ?? []) as Array<{ method?: string | null; amount?: number | string | null }>;
      if (payments.length) {
        for (const payment of payments) {
          if (payment.method === "cash") cashSales += Number(payment.amount ?? 0);
          else cardSales += Number(payment.amount ?? 0);
        }
      } else {
        const type = (tx.payment_methods as { type?: string } | null)?.type ?? "other";
        if (type === "cash") cashSales += Number(tx.total ?? 0);
        else cardSales += Number(tx.total ?? 0);
      }
      for (const item of tx.pos_transaction_items ?? []) {
        productTotals.set(item.product_name, (productTotals.get(item.product_name) ?? 0) + Number(item.gross_amount ?? item.line_total ?? 0));
      }
    }

    const { data: movementRows } = await supabase
      .from("pos_cash_movements")
      .select("id,movement_type,amount,reason,performed_at,created_at")
      .eq("organisation_id", orgId)
      .eq("session_id", openSession.id)
      .in("movement_type", ["cash_in", "cash_out"])
      .order("performed_at", { ascending: true });

    for (const row of movementRows ?? []) {
      const absAmount = Math.abs(Number(row.amount ?? 0));
      const movementType = row.movement_type as "cash_in" | "cash_out";
      if (movementType === "cash_in") cashInTotal += absAmount;
      else cashOutTotal += absAmount;
      cashOperations.push({
        id: row.id,
        movement_type: movementType,
        amount: absAmount,
        reason: row.reason,
        performedAt: (row.performed_at ?? row.created_at) as string | null,
      });
    }
  }
  const topProduct = [...productTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const [{ data: products }, { data: categories }, { data: methods }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_LIST_WITH_POS_SELECT)
      .eq("organisation_id", orgId)
      .eq("active", true)
      .order("pos_sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("product_categories").select("id,name,color").eq("organisation_id", orgId).eq("active", true).eq("category_type", "pos").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    supabase.from("payment_methods").select("id,name,type").eq("organisation_id", orgId).eq("active", true).order("created_at"),
  ]);
  const sgrProduct = (products ?? []).find((p) => p.name?.toUpperCase() === "SGR") ?? null;
  const defaultVatRate = getDefaultVatRateValue(vatRates);
  const [{ data: customers }, { data: recentTransactions }, { count: allTimeCompletedSales }] = await Promise.all([
    supabase.from("customers").select("id,name,phone,email").eq("organisation_id", orgId).order("name").limit(100),
    supabase.from("pos_transactions").select("id,transaction_number,customer_name,sold_at,total,discount_total,status,payment_methods(name,type)").eq("organisation_id", orgId).order("sold_at", { ascending: false }).limit(30),
    supabase
      .from("pos_transactions")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("status", "completed"),
  ]);
  const trackActivationSale = (allTimeCompletedSales ?? 0) === 0;

  // ── CLOSED: show open-till form + last session summary + quick links ──
  if (!openSession) {
    // Last-7-days sales trend — same canonical_sales_lines pattern the
    // Sales report uses (app/app/reports/page.tsx), scoped down to a
    // one-week window since this is a glance-view, not the full report.
    // Read-only aggregation only — no sale/session logic touched.
    let salesDays: SalesDay[] = [];
    try {
      const sites = await listAccessibleSites(supabase, orgId, membership.id, userRole);
      const siteIds = sites.map((site) => site.id);
      const trendStart = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + "T00:00:00.000Z";
      const trendEnd = new Date().toISOString();
      const trendQuery = supabase
        .from("canonical_sales_lines")
        .select("sold_at,gross_amount")
        .eq("organisation_id", orgId)
        .gte("sold_at", trendStart)
        .lte("sold_at", trendEnd);
      const { data: trendLines } = await (siteIds.length ? trendQuery.in("site_id", siteIds) : trendQuery.eq("site_id", "00000000-0000-0000-0000-000000000000"));
      const byDay = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        byDay.set(d, 0);
      }
      for (const line of trendLines ?? []) {
        const day = String(line.sold_at ?? "").slice(0, 10);
        if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + Number(line.gross_amount ?? 0));
      }
      salesDays = [...byDay.entries()].map(([day, total]) => ({
        day: new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-IE", { weekday: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`)),
        total,
      }));
    } catch {
      // Non-fatal — the closed-till view must render even if the trend query fails
    }

    return (
      <div className="min-h-0 bg-card px-4 py-8 sm:px-6 sm:py-10">
        <PosTillStateSync sessionOpen={false} />
        <div className="mx-auto max-w-lg space-y-8 pb-4">

          {/* Open till form */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
              <Store className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.pos.tillClosedTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t.pos.openingFloat}</p>
            </div>
          </div>

          <PageHint id="pos-closed">
            <p className="font-medium">{t.pos.openTillBeforeSale}</p>
            <p className="mt-1 text-brass">{t.pos.openingCashHint}</p>
          </PageHint>

          <OpenTillForm currencySymbol={currencySymbol} currency={currency} orgName={orgName} userName={userName} fiscalNet={fiscalNet} isRO={isRO} defaultCash={Number(lastClosed?.counted_cash ?? lastClosed?.expected_cash ?? 0) || undefined} />

          {/* Last-7-days sales trend */}
          <Card className="border-border bg-card shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground">
                {locale === "ro" ? "Vânzări în ultimele 7 zile" : "Sales in the last 7 days"}
              </p>
              <ReportsTrendChart days={salesDays} currency={currency} />
            </CardContent>
          </Card>

          {/* Last closed session summary */}
          {lastClosed && (
            <Card className="border-border bg-card shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                    <Calendar className="h-4 w-4 text-mid" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{t.pos.lastSessionClosed}</p>
                    <p className="text-xs text-muted-foreground">{t.pos.closedAtBy(formatTime(lastClosed.closed_at, locale), lastClosedBy)}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs capitalize">{t.pos.sessionClosed}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-0.5">{t.pos.lastCountedCash}</p>
                    <p className="text-2xl font-bold text-foreground">{money(Number(lastClosed.counted_cash ?? lastClosed.expected_cash ?? 0), currency)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.pos.closedAtByShort(formatTime(lastClosed.closed_at, locale), lastClosedBy)}</p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-0.5">{t.pos.totalSales}</p>
                    <div className="flex items-center gap-1.5">
                      <Banknote className="h-3.5 w-3.5 text-brass" />
                      <span className="font-bold text-foreground">{money(lastSessionTotal, currency)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.pos.transactionsCount(lastSessionTxCount)}</p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-0.5">{t.pos.cashCardSplit}</p>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-reconciled" />
                      <span className="font-semibold text-foreground text-sm">{money(lastSessionCash, currency)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.pos.cardLabel(money(lastSessionCard, currency))}</p>
                  </div>
                  {lastClosed.counted_cash != null && (
                    <div className="col-span-2 rounded-xl border border-border p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.pos.expectedCash}</span>
                        <span className="font-medium">{money(Number(lastClosed.expected_cash ?? 0), currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">{t.pos.countedCash}</span>
                        <span className="font-medium">{money(Number(lastClosed.counted_cash ?? 0), currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1 pt-1 border-t">
                        <span className="text-muted-foreground">{t.pos.difference}</span>
                        <span className={`font-semibold ${Number(lastClosed.counted_cash) - Number(lastClosed.expected_cash) >= 0 ? "text-reconciled" : "text-attention"}`}>
                          {money(Number(lastClosed.counted_cash ?? 0) - Number(lastClosed.expected_cash ?? 0), currency)}
                        </span>
                      </div>
                    </div>
                  )}
                  {lastClosed.notes && (
                    <div className="col-span-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                      {t.pos.notePrefix}: {lastClosed.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick access when till is closed */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.pos.quickAccess}</p>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/app/transactions" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-brass/25 transition-colors">
                <ReceiptText className="h-5 w-5 text-brass" />
                <span className="text-xs font-medium text-foreground">{t.pos.transactions}</span>
              </Link>
              <Link href="/app/refunds" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-brass/25 transition-colors">
                <RefreshCcw className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-medium text-foreground">{t.pos.refunds}</span>
              </Link>
              <Link href="/app" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-brass/25 transition-colors">
                <LayoutDashboard className="h-5 w-5 text-brass" />
                <span className="text-xs font-medium text-foreground">{t.pos.dashboard}</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── OPEN SESSION ──
  const expectedCash = Number(openSession.expected_cash ?? openSession.opening_cash ?? 0);

  // Table service: show floor picker inside POS until a table tab is selected
  if (features.tableService && !tabIdParam && !quickSale) {
    const { siteId } = await requireActiveSite(supabase, orgId, membership.id, userRole);
    const [tables, sections] = await Promise.all([
      getTables(siteId),
      getFloorSections(siteId),
    ]);
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <PosTillStateSync sessionOpen />
        <PosTableFloor
          tables={tables}
          sections={sections}
          canManage={canManage}
          currency={currency}
          siteId={siteId}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-card">
      <PosTillStateSync sessionOpen />
      {showWelcome && (products?.length ?? 0) > 0 && <WelcomeBanner locale={locale} />}
      <PosWithTour
        orgId={orgId}
        trackActivationSale={trackActivationSale}
        redirectAfterSaleTo={fromOnboarding ? "/onboarding/result" : null}
        products={(products ?? []) as never}
        categories={categories ?? []}
        paymentMethods={methods ?? []}
        sessionId={openSession.id}
        fiscalZReportDone={Boolean(openSession?.fiscal_z_report_done)}
        customers={(customers ?? []) as never}
        recentTransactions={(recentTransactions ?? []) as never}
        fiscalNet={fiscalNet}
        vatRateGroupMap={vatRateGroupMap}
        isRO={isRO}
        appLocale={locale}
        currency={currency}
        orgName={orgName}
        userName={userName}
        sgrEnabled={sgrEnabled}
        sgrProduct={sgrProduct as never}
        features={features}
        activeTab={activeTab}
        canManage={canManage}
        defaultVatRate={defaultVatRate}
        summary={{
          openingCash: Number(openSession.opening_cash ?? 0),
          cashSales,
          cardSales,
          expectedCash,
          txCount,
          topProduct,
          cashInTotal,
          cashOutTotal,
          cashOperations,
        }}
      />
    </div>
  );
}
