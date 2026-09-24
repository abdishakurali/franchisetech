import Link from "next/link";
import { startOfDay, subDays } from "date-fns";
import { DashboardSparkline } from "@/components/app/DashboardSparkline";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CheckCircle2,
  ChefHat,
  Info,
  Package,
  PlusCircle,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Heart,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivationBanner } from "@/components/app/ActivationBanner";
import { DashboardSalesHighlight } from "@/components/app/DashboardSalesHighlight";
import { DashboardSalesChart } from "@/components/app/DashboardSalesChart";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { isModuleEnabled } from "@/lib/business-modules";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { moduleLabel } from "@/lib/business-profile-i18n";
import { getDashboardAttention } from "@/lib/dashboard/attention";
import type { OnboardingStep } from "@/lib/onboarding/steps";
import { Suspense } from "react";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

export default async function DashboardPage() {
  const todayStart = startOfDay(new Date()).toISOString();

  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { locale, t } = await getAppLocaleAndText(countryCode, profileLocale);
  const isRO = countryCode === "RO";

  const orgModules = await fetchOrgModuleFlags(supabase, orgId);
  const inventoryVisible = isModuleEnabled(orgModules, "inventory");
  const recipeVisible = isModuleEnabled(orgModules, "recipe_costing");
  const purchasesVisible = isModuleEnabled(orgModules, "purchases");

  const { data: orgRow } = await supabase
    .from("organisations")
    .select("onboarding_step,fiscalnet_enabled,loyalty_enabled")
    .eq("id", orgId)
    .maybeSingle();
  const onboardingStep = (orgRow?.onboarding_step ?? null) as OnboardingStep | null;
  const fiscalnetEnabled = isRO && Boolean(orgRow?.fiscalnet_enabled);
  const loyaltyVisible = Boolean(orgRow?.loyalty_enabled);

  const last7Start = startOfDay(subDays(new Date(), 6)).toISOString();

  const [todayTxResult, sessionResult, allTimeTxCountResult, last7TxResult] = await Promise.all([
    supabase
      .from("pos_transactions")
      .select("total,tip_amount,payment_methods(type)")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("sold_at", todayStart),
    supabase.from("pos_sessions").select("expected_cash,status").eq("organisation_id", orgId).eq("status", "open").limit(1).maybeSingle(),
    supabase.from("pos_transactions").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "completed"),
    supabase
      .from("pos_transactions")
      .select("total,sold_at")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("sold_at", last7Start),
  ]);

  const allTimeTxCount = allTimeTxCountResult.count ?? 0;
  const showActivationBanner = allTimeTxCount === 0;

  if (showActivationBanner) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <ActivationBanner locale={locale} onboardingStep={onboardingStep} isRO={isRO} />
      </div>
    );
  }

  const todayTx = todayTxResult.data ?? [];
  const todayTotal = todayTx.reduce((s, tx) => s + Number(tx.total ?? 0), 0);
  const todayTips = todayTx.reduce((s, tx) => s + Number(tx.tip_amount ?? 0), 0);
  const salesToday = todayTotal - todayTips;
  const ordersToday = todayTx.length;
  const avgTicket = ordersToday > 0 ? salesToday / ordersToday : 0;

  const sessionData = sessionResult.data;
  const expectedCash = Number(sessionData?.expected_cash ?? 0);

  const last7ByDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    last7ByDay.set(startOfDay(subDays(new Date(), i)).toISOString().slice(0, 10), 0);
  }
  for (const tx of last7TxResult.data ?? []) {
    const day = String(tx.sold_at ?? "").slice(0, 10);
    if (last7ByDay.has(day)) last7ByDay.set(day, (last7ByDay.get(day) ?? 0) + Number(tx.total ?? 0));
  }
  const last7Values = [...last7ByDay.values()];

  const paymentTotals = new Map<string, number>();
  for (const tx of todayTx) {
    const method = Array.isArray(tx.payment_methods) ? tx.payment_methods[0] : tx.payment_methods;
    const type = String(method?.type ?? "other").toLowerCase();
    paymentTotals.set(type, (paymentTotals.get(type) ?? 0) + Number(tx.total ?? 0) - Number(tx.tip_amount ?? 0));
  }
  const paymentMix = [
    { label: "Numerar", value: paymentTotals.get("cash") ?? 0, color: "bg-emerald-500" },
    { label: "Card", value: paymentTotals.get("card") ?? 0, color: "bg-sky-500" },
    { label: "Online / altele", value: (paymentTotals.get("online") ?? 0) + (paymentTotals.get("other") ?? 0), color: "bg-violet-500" },
  ];
  const salesDays = [...last7ByDay.entries()].map(([date, value]) => ({
    label: new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-IE", { weekday: "short" }).format(new Date(`${date}T12:00:00`)).replace(".", ""),
    value,
  }));

  const attentionItems = await getDashboardAttention(supabase, {
    orgId,
    locale,
    currency,
    inventoryVisible,
    recipeVisible,
    fiscalnetEnabled,
  });

  const moduleCards = [
    inventoryVisible ? { href: "/app/stock", label: moduleLabel("inventory", locale), Icon: Package } : null,
    recipeVisible ? { href: "/app/recipes", label: moduleLabel("recipe_costing", locale), Icon: ChefHat } : null,
    purchasesVisible ? { href: "/app/purchases", label: moduleLabel("purchases", locale), Icon: ShoppingBag } : null,
    loyaltyVisible ? { href: "/app/customers", label: isRO ? "Fidelizare" : "Loyalty", Icon: Heart } : null,
  ].filter((m): m is { href: string; label: string; Icon: typeof Package } => m !== null);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        {sessionData ? (
          <div className="flex items-center gap-2 rounded-full border border-reconciled/25 bg-reconciled/10 px-3 py-1 text-sm text-reconciled">
            <span className="inline-flex h-2 w-2 rounded-full bg-reconciled" />
            {t.dashboard.tillOpen}
          </div>
        ) : null}
      </div>

      {/* ── Top metrics ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Suspense
          fallback={
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />{t.dashboard.salesToday}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{money(salesToday, currency)}</p>
              </CardContent>
            </Card>
          }
        >
          <DashboardSalesHighlight>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />{t.dashboard.salesToday}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{money(salesToday, currency)}</p>
                {todayTips > 0 ? (
                  <p className="text-xs text-muted-foreground">+{money(todayTips, currency)} {t.common.tips}</p>
                ) : null}
                <DashboardSparkline values={last7Values} />
              </CardContent>
            </Card>
          </DashboardSalesHighlight>
        </Suspense>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Receipt className="h-4 w-4" />{t.dashboard.ordersToday}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{ordersToday}</p>
            {ordersToday === 0 ? <p className="text-xs text-muted-foreground">{t.dashboard.noSalesYet}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-4 w-4" />{t.dashboard.avgTicket}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{money(avgTicket, currency)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Banknote className="h-4 w-4" />{t.dashboard.cashInTill}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionData ? (
              <p className="text-2xl font-bold text-foreground">{money(expectedCash, currency)}</p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">{t.dashboard.tillIsClosed}</p>
            )}
            {!sessionData ? <p className="text-xs text-muted-foreground">{t.dashboard.openTillHint}</p> : null}
          </CardContent>
        </Card>
      </div>

      <DashboardSalesChart days={salesDays} paymentMix={paymentMix} currency={currency} />

      {/* ── Attention ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.dashboard.attention}</CardTitle>
        </CardHeader>
        <CardContent>
          {attentionItems.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-reconciled">
              <CheckCircle2 className="h-4 w-4" />
              {t.dashboard.allClear}
            </div>
          ) : (
            <ul className="space-y-2">
              {attentionItems.map((item) => (
                <li key={item.message}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-2.5 rounded-lg border p-3 text-sm transition hover:border-brass/40 hover:bg-accent"
                  >
                    {item.severity === "critical" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-attention" />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                    )}
                    <span className="text-foreground">{item.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t.dashboard.quickActions}</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/pos">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <ShoppingCart className="mr-1.5 h-4 w-4" />{t.dashboard.openPos}
            </Button>
          </Link>
          <Link href="/app/products/new">
            <Button variant="outline">
              <PlusCircle className="mr-1.5 h-4 w-4" />{t.dashboard.addProduct}
            </Button>
          </Link>
          {sessionData ? (
            <Link href="/app/pos">
              <Button variant="outline">
                <XCircle className="mr-1.5 h-4 w-4" />{t.dashboard.closeTill}
              </Button>
            </Link>
          ) : null}
          <Link href="/app/reports">
            <Button variant="outline">
              <BarChart3 className="mr-1.5 h-4 w-4" />{t.dashboard.viewReports}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Optional module cards ── */}
      {moduleCards.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t.dashboard.modulesHeading}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {moduleCards.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-brass/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-brass">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
