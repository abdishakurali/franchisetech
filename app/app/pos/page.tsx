import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP } from "@/lib/fiscalnet/types";
import { PosRegister } from "@/components/app/PosRegister";
import { OpenTillForm } from "@/components/app/OpenTillForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { PageHint } from "@/components/app/PageHint";
import Link from "next/link";
import {
  ReceiptText, RefreshCcw, LayoutDashboard, Store, Calendar, Banknote, CreditCard,
} from "lucide-react";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

function formatTime(ts: string | null | undefined) {
  if (!ts) return "—";
  return new Intl.DateTimeFormat("en-IE", { timeStyle: "short", dateStyle: "short" }).format(new Date(ts));
}

export default async function PosPage() {
  const { supabase, orgId, currency, currencySymbol, user, membership } = await getKitchenOpsContext();
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
      if (fnOrg.country_code === "RO" && fnOrg.fiscalnet_enabled) {
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
      { organisation_id: orgId, name: "Drinks", color: "#2563eb", sort_order: 1 },
      { organisation_id: orgId, name: "Food", color: "#16a34a", sort_order: 2 },
      { organisation_id: orgId, name: "Snacks", color: "#f59e0b", sort_order: 3 },
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
  }
  const topProduct = [...productTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const { data: products } = await supabase
    .from("products")
    .select("*,product_categories(id,name,color)")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("name");
  const sgrProduct = (products ?? []).find((p) => p.name?.toUpperCase() === "SGR") ?? null;
  const { data: categories } = await supabase.from("product_categories").select("id,name,color").eq("organisation_id", orgId).eq("active", true).in("category_type", ["pos", "both"]).order("sort_order");
  const { data: methods } = await supabase.from("payment_methods").select("id,name,type").eq("organisation_id", orgId).eq("active", true).order("created_at");
  const [{ data: customers }, { data: recentTransactions }] = await Promise.all([
    supabase.from("customers").select("id,name,phone,email").eq("organisation_id", orgId).order("name").limit(100),
    supabase.from("pos_transactions").select("id,transaction_number,customer_name,sold_at,total,status,payment_methods(name,type)").eq("organisation_id", orgId).order("sold_at", { ascending: false }).limit(30),
  ]);

  // ── CLOSED: show open-till form + last session summary + quick links ──
  if (!openSession) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="mx-auto max-w-xl space-y-6">

          {/* Open till form */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Store className="h-8 w-8 text-slate-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950">Till is closed</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your opening float to start selling.</p>
          </div>

          <PageHint id="pos-closed">
            <p className="font-medium">Open the till before your first sale.</p>
            <p className="mt-1 text-blue-700">Opening cash is the cash float in the drawer before selling.</p>
          </PageHint>

          <OpenTillForm currencySymbol={currencySymbol} currency={currency} orgName={orgName} userName={userName} fiscalNet={fiscalNet} isRO={isRO} />

          {/* Last closed session summary */}
          {lastClosed && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                    <Calendar className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Last session closed</p>
                    <p className="text-xs text-slate-500">{formatTime(lastClosed.closed_at)} by {lastClosedBy}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs capitalize">{lastClosed.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="col-span-2 rounded-lg bg-white border border-slate-200 p-3">
                    <p className="text-xs text-slate-400 mb-0.5">Last counted cash</p>
                    <p className="text-2xl font-bold text-slate-950">{money(Number(lastClosed.counted_cash ?? lastClosed.expected_cash ?? 0), currency)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Closed {formatTime(lastClosed.closed_at)} by {lastClosedBy}</p>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <p className="text-xs text-slate-400 mb-0.5">Total sales</p>
                    <div className="flex items-center gap-1.5">
                      <Banknote className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-bold text-slate-900">{money(lastSessionTotal, currency)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{lastSessionTxCount} transactions</p>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <p className="text-xs text-slate-400 mb-0.5">Cash / Card split</p>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-semibold text-slate-900 text-sm">{money(lastSessionCash, currency)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Card: {money(lastSessionCard, currency)}</p>
                  </div>
                  {lastClosed.counted_cash != null && (
                    <div className="col-span-2 rounded-lg bg-white border border-slate-200 p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expected cash</span>
                        <span className="font-medium">{money(Number(lastClosed.expected_cash ?? 0), currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-500">Counted cash</span>
                        <span className="font-medium">{money(Number(lastClosed.counted_cash ?? 0), currency)}</span>
                      </div>
                      <div className="flex justify-between mt-1 pt-1 border-t">
                        <span className="text-slate-500">Difference</span>
                        <span className={`font-semibold ${Number(lastClosed.counted_cash) - Number(lastClosed.expected_cash) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {money(Number(lastClosed.counted_cash ?? 0) - Number(lastClosed.expected_cash ?? 0), currency)}
                        </span>
                      </div>
                    </div>
                  )}
                  {lastClosed.notes && (
                    <div className="col-span-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                      Note: {lastClosed.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick access when till is closed */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Quick access</p>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/app/transactions" className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-4 text-center hover:bg-slate-50 hover:border-blue-200 transition-colors">
                <ReceiptText className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">Transactions</span>
              </Link>
              <Link href="/app/refunds" className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-4 text-center hover:bg-slate-50 hover:border-blue-200 transition-colors">
                <RefreshCcw className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-medium text-slate-700">Refunds</span>
              </Link>
              <Link href="/app" className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-4 text-center hover:bg-slate-50 hover:border-blue-200 transition-colors">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">Dashboard</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── OPEN SESSION ──
  const expectedCash = Number(openSession.expected_cash ?? openSession.opening_cash ?? 0);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* POS register */}
      <PosRegister
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
        currency={currency}
        orgName={orgName}
        userName={userName}
        sgrEnabled={sgrEnabled}
        sgrProduct={sgrProduct as never}
        features={features}
        summary={{
          openingCash: Number(openSession.opening_cash ?? 0),
          cashSales,
          cardSales,
          expectedCash,
          txCount,
          topProduct,
        }}
      />
    </div>
  );
}
