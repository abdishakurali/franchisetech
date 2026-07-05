import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { isFiscalNetActive } from "@/lib/fiscalnet/eligibility";
import { DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP } from "@/lib/fiscalnet/types";
import { PosWithTour } from "@/components/app/PosWithTour";
import { PosTillStateSync } from "@/components/app/PosTillStateSync";
import { OpenTillForm } from "@/components/app/OpenTillForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { PageHint } from "@/components/app/PageHint";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle, ReceiptText, RefreshCcw, LayoutDashboard, Store, Calendar, Banknote, CreditCard,
} from "lucide-react";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { PRODUCT_LIST_WITH_POS_SELECT } from "@/lib/supabase/product-selects";
import { getSubscriptionStatus, isSubscriptionBlockedForApp } from "@/lib/billing/subscription";
import { WelcomeBanner } from "@/components/app/WelcomeBanner";
import { getTabWithTable, getTables, getFloorSections } from "@/app/actions/table-service";
import { PosTableFloor } from "@/components/app/PosTableFloor";
import { requireActiveSite } from "@/lib/site-context";

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

export default async function PosPage({ searchParams }: { searchParams?: Promise<{ welcome?: string; tabId?: string; quick?: string }> }) {
  const params = await searchParams;
  const showWelcome = params?.welcome === "1";
  const tabIdParam = params?.tabId ?? null;
  const quickSale = params?.quick === "1";
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
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
        <Card className="w-full max-w-md border-red-100 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-red-600">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {copy.body}
            </p>
            <Link
              href={`/app/billing?reason=${billingReason}`}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
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
  const features = {
    kitchenDisplay: Boolean(orgInfo?.kitchen_display_enabled),
    restaurantOrderFlow: Boolean(orgInfo?.restaurant_order_flow_enabled),
    orderTypes: Boolean(orgInfo?.order_types_enabled),
    tableService: Boolean(orgInfo?.table_service_enabled),
    splitPayments: Boolean(orgInfo?.payment_split_enabled),
    tips: Boolean(orgInfo?.tips_enabled),
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
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const userName: string = userProfile?.full_name || user.email || "Staff";
  let cashDrawerSettings = {
    mode: "manual" as const,
    port: 17878,
    token: null as string | null,
    triggerOnCashSale: true,
    triggerOnCashIn: true,
    triggerOnCashOut: true,
  };
  try {
    const { data: drawerOrg, error } = await supabase
      .from("organisations")
      .select("cash_drawer_mode,cash_drawer_connector_port,cash_drawer_connector_token,cash_drawer_trigger_on_cash_sale,cash_drawer_trigger_on_cash_in,cash_drawer_trigger_on_cash_out")
      .eq("id", orgId)
      .maybeSingle();
    if (!error && drawerOrg) {
      cashDrawerSettings = {
        mode: drawerOrg.cash_drawer_mode ?? "manual",
        port: drawerOrg.cash_drawer_connector_port ?? 17878,
        token: drawerOrg.cash_drawer_connector_token ?? null,
        triggerOnCashSale: drawerOrg.cash_drawer_trigger_on_cash_sale ?? true,
        triggerOnCashIn: drawerOrg.cash_drawer_trigger_on_cash_in ?? true,
        triggerOnCashOut: drawerOrg.cash_drawer_trigger_on_cash_out ?? true,
      };
    }
  } catch {}

  // FiscalNet browser config (passed to PosRegister for client-side API calls)
  let fiscalNet: BrowserFiscalConfig | null = null;
  let sgrEnabled = false;
  let isRO = false;
  // vatRateGroupMap: rate (%) → fiscalnet_vat_group code, built from vat_rates table (source of truth)
  let vatRateGroupMap: Record<number, number> = {};
  try {
    const [{ data: fnOrg }, { data: vatRates }] = await Promise.all([
      supabase
        .from("organisations")
        .select("country_code,fiscalnet_enabled,fiscalnet_mock_mode,fiscalnet_connection_mode,fiscalnet_api_host,fiscalnet_payment_type_map,fiscalnet_operator_code,sgr_enabled")
        .eq("id", orgId)
        .maybeSingle(),
      supabase
        .from("vat_rates")
        .select("rate,fiscalnet_vat_group")
        .eq("organisation_id", orgId)
        .eq("active", true),
    ]);
    if (fnOrg) {
      // SGR deposit scheme (Romania only)
      if (fnOrg.country_code === "RO") { sgrEnabled = Boolean(fnOrg.sgr_enabled); isRO = true; }
      if (isFiscalNetActive(fnOrg.country_code, fnOrg.fiscalnet_enabled)) {
        // Build vatGroups from vat_rates table — this is the source of truth for FiscalNet groups.
        // Each vat_rates row with fiscalnet_vat_group set provides the authoritative mapping.
        const vatGroupsFromDb = (vatRates ?? [])
          .filter((r) => r.fiscalnet_vat_group != null)
          .map((r) => ({ code: r.fiscalnet_vat_group as number, rate: Number(r.rate), label: `TVA ${r.rate}%` }));

        // Also build vatRateGroupMap for direct lookup in PosRegister / cart
        vatRateGroupMap = Object.fromEntries(
          (vatRates ?? [])
            .filter((r) => r.fiscalnet_vat_group != null)
            .map((r) => [Number(r.rate), r.fiscalnet_vat_group as number])
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

  // Ensure default categories/methods exist
  const { data: existingCats } = await supabase.from("product_categories").select("id").eq("organisation_id", orgId).limit(1);
  if (!existingCats?.length) {
    await supabase.from("product_categories").insert([
      { organisation_id: orgId, name: "Drinks", color: "#2563eb", sort_order: 1, category_type: "pos" },
      { organisation_id: orgId, name: "Food", color: "#16a34a", sort_order: 2, category_type: "pos" },
      { organisation_id: orgId, name: "Snacks", color: "#f59e0b", sort_order: 3, category_type: "pos" },
    ]).then(() => null, () => null);
  }
  const { data: existingMethods } = await supabase.from("payment_methods").select("id").eq("organisation_id", orgId).limit(1);
  if (!existingMethods?.length) {
    await supabase.from("payment_methods").insert([
      { organisation_id: orgId, name: "Cash", type: "cash" },
      { organisation_id: orgId, name: "Card", type: "card" },
      { organisation_id: orgId, name: "Online", type: "online" },
      { organisation_id: orgId, name: "Other", type: "other" },
    ]).then(() => null, () => null);
  }

  // Load open session
  const { data: sessionData } = await supabase
    .from("pos_sessions")
    .select("*")
    .eq("organisation_id", orgId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const openSession = sessionData ?? null;

  // Always load last closed session for reference
  const { data: lastClosed } = await supabase
    .from("pos_sessions")
    .select("id,opened_at,closed_at,opening_cash,counted_cash,expected_cash,notes,status,closed_by")
    .eq("organisation_id", orgId)
    .in("status", ["closed", "stale"])
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  const { data: products } = await supabase
    .from("products")
    .select(PRODUCT_LIST_WITH_POS_SELECT)
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("pos_sort_order", { ascending: true })
    .order("name", { ascending: true });
  const sgrProduct = (products ?? []).find((p) => p.name?.toUpperCase() === "SGR") ?? null;
  const { data: categories } = await supabase.from("product_categories").select("id,name,color").eq("organisation_id", orgId).eq("active", true).eq("category_type", "pos").order("sort_order", { ascending: true }).order("name", { ascending: true });
  const { data: methods } = await supabase.from("payment_methods").select("id,name,type").eq("organisation_id", orgId).eq("active", true).order("created_at");
  const vatRates = await listActiveVatRates(supabase, orgId);
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
    return (
      <div className="min-h-0 bg-white px-4 py-8 sm:px-6 sm:py-10">
        <PosTillStateSync sessionOpen={false} />
        <div className="mx-auto max-w-lg space-y-8 pb-4">

          {/* Open till form */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white">
              <Store className="h-7 w-7 text-slate-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">{t.pos.tillClosedTitle}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.pos.openingFloat}</p>
            </div>
          </div>

          <PageHint id="pos-closed">
            <p className="font-medium">{t.pos.openTillBeforeSale}</p>
            <p className="mt-1 text-blue-700">{t.pos.openingCashHint}</p>
          </PageHint>

          <OpenTillForm currencySymbol={currencySymbol} currency={currency} orgName={orgName} userName={userName} fiscalNet={fiscalNet} isRO={isRO} defaultCash={Number(lastClosed?.counted_cash ?? lastClosed?.expected_cash ?? 0) || undefined} />

          {/* Last closed session summary */}
          {lastClosed && (
            <Card className="border-slate-100 bg-white shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white">
                    <Calendar className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{t.pos.lastSessionClosed}</p>
                    <p className="text-xs text-slate-500">{t.pos.closedAtBy(formatTime(lastClosed.closed_at, locale), lastClosedBy)}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs capitalize">{t.pos.sessionClosed}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 rounded-xl border border-slate-100 p-4">
                    <p className="text-xs text-slate-400 mb-0.5">{t.pos.lastCountedCash}</p>
                    <p className="text-2xl font-bold text-slate-950">{money(Number(lastClosed.counted_cash ?? lastClosed.expected_cash ?? 0), currency)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.pos.closedAtByShort(formatTime(lastClosed.closed_at, locale), lastClosedBy)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs text-slate-400 mb-0.5">{t.pos.totalSales}</p>
                    <div className="flex items-center gap-1.5">
                      <Banknote className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-bold text-slate-900">{money(lastSessionTotal, currency)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{t.pos.transactionsCount(lastSessionTxCount)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs text-slate-400 mb-0.5">{t.pos.cashCardSplit}</p>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-semibold text-slate-900 text-sm">{money(lastSessionCash, currency)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{t.pos.cardLabel(money(lastSessionCard, currency))}</p>
                  </div>
                  {lastClosed.counted_cash != null && (
                    <div className="col-span-2 rounded-xl border border-slate-100 p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.pos.expectedCash}</span>
                        <span className="font-medium">{money(Number(lastClosed.expected_cash ?? 0), currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-500">{t.pos.countedCash}</span>
                        <span className="font-medium">{money(Number(lastClosed.counted_cash ?? 0), currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1 pt-1 border-t">
                        <span className="text-slate-500">{t.pos.difference}</span>
                        <span className={`font-semibold ${Number(lastClosed.counted_cash) - Number(lastClosed.expected_cash) >= 0 ? "text-green-600" : "text-red-600"}`}>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.pos.quickAccess}</p>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/app/transactions" className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center hover:border-blue-200 transition-colors">
                <ReceiptText className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">{t.pos.transactions}</span>
              </Link>
              <Link href="/app/refunds" className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center hover:border-blue-200 transition-colors">
                <RefreshCcw className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-medium text-slate-700">{t.pos.refunds}</span>
              </Link>
              <Link href="/app" className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center hover:border-blue-200 transition-colors">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">{t.pos.dashboard}</span>
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
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      <PosTillStateSync sessionOpen />
      {showWelcome && (products?.length ?? 0) > 0 && <WelcomeBanner locale={locale} />}
      <PosWithTour
        orgId={orgId}
        trackActivationSale={trackActivationSale}
        products={(products ?? []) as never}
        categories={categories ?? []}
        paymentMethods={methods ?? []}
        sessionId={openSession.id}
        fiscalZReportDone={Boolean(openSession?.fiscal_z_report_done)}
        customers={(customers ?? []) as never}
        recentTransactions={(recentTransactions ?? []) as never}
        cashDrawerSettings={cashDrawerSettings}
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
