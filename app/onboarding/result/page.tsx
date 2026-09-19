import Link from "next/link";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingStepLabels, onboardingStepGroupIndex, onboardingStepOfLabel } from "@/lib/onboarding/steps";
import { CompleteOnboardingButton } from "@/components/onboarding/CompleteOnboardingButton";

const STRINGS = {
  ro: {
    title: "Prima vânzare este gata",
    subtitle: "Iată ce a învățat franchisetech din prima ta vânzare.",
    salesToday: "Vânzări azi",
    orders: "Comenzi",
    avgTicket: "Bon mediu",
    stockUpdated: "Stocul a fost actualizat automat.",
    viewReport: "Vezi raportul de vânzări →",
    viewPanel: "Vezi panoul",
    currency: "lei",
    cash: "Numerar",
    card: "Card",
  },
  en: {
    title: "Your first sale is done",
    subtitle: "Here's what franchisetech learned from your first sale.",
    salesToday: "Sales today",
    orders: "Orders",
    avgTicket: "Average ticket",
    stockUpdated: "Stock was updated automatically.",
    viewReport: "View the sales report →",
    viewPanel: "Go to the dashboard",
    currency: "",
    cash: "Cash",
    card: "Card",
  },
};

export default async function OnboardingResultPage() {
  const { supabase, orgId, countryCode } = await getActiveOrg();
  const isRO = countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = STRINGS[locale];

  const [{ data: lastSale }, { data: org }] = await Promise.all([
    supabase
      .from("pos_transactions")
      .select("id, total, sold_at, payment_methods(type,name), pos_transaction_items(product_name, quantity, unit_price)")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .order("sold_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("organisations")
      .select("inventory_enabled, recipe_costing_enabled")
      .eq("id", orgId)
      .maybeSingle(),
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data: todaysSales } = await supabase
    .from("pos_transactions")
    .select("total")
    .eq("organisation_id", orgId)
    .eq("status", "completed")
    .gte("sold_at", startOfDay.toISOString());

  const orderCount = todaysSales?.length ?? 0;
  const salesTotal = (todaysSales ?? []).reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const avgTicket = orderCount > 0 ? salesTotal / orderCount : 0;

  const paymentType = (lastSale?.payment_methods as { type?: string } | null)?.type;
  const items = (lastSale?.pos_transaction_items ?? []) as Array<{ product_name: string; quantity: number; unit_price: number }>;

  const stepLabels = onboardingStepLabels(isRO, locale);
  const currentStepIndex = onboardingStepGroupIndex("result", isRO);

  return (
    <OnboardingShell
      stepLabels={stepLabels}
      currentStepIndex={currentStepIndex}
      title={t.title}
      subtitle={t.subtitle}
      stepOfLabel={onboardingStepOfLabel(currentStepIndex, stepLabels.length, locale)}
      trialBadge={isRO ? "Probă 15 zile · fără card necesar" : "15-day trial · no card required"}
    >
      <div className="space-y-6">
        {lastSale && (
          <div className="rounded-md border border-border bg-card p-4">
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              {Number(lastSale.total ?? 0).toFixed(2)} {t.currency}
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-mid">
              {items.map((item, i) => (
                <li key={i}>
                  {item.product_name} ×{item.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs font-medium text-brass">
              {paymentType === "cash" ? t.cash : t.card}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-card p-3 text-center">
            <p className="font-[family-name:var(--font-space-mono)] text-xl font-semibold text-foreground">
              {salesTotal.toFixed(2)}
            </p>
            <p className="text-xs text-mid">{t.salesToday}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-3 text-center">
            <p className="font-[family-name:var(--font-space-mono)] text-xl font-semibold text-foreground">{orderCount}</p>
            <p className="text-xs text-mid">{t.orders}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-3 text-center">
            <p className="font-[family-name:var(--font-space-mono)] text-xl font-semibold text-foreground">
              {avgTicket.toFixed(2)}
            </p>
            <p className="text-xs text-mid">{t.avgTicket}</p>
          </div>
        </div>

        {org?.inventory_enabled && (
          <p className="rounded-md bg-reconciled/10 px-4 py-2.5 text-sm text-reconciled">✓ {t.stockUpdated}</p>
        )}

        <Link href="/app/reports/sales" className="inline-block text-sm font-medium text-brass hover:underline">
          {t.viewReport}
        </Link>

        <div className="border-t border-border pt-6">
          <CompleteOnboardingButton label={t.viewPanel} />
        </div>
      </div>
    </OnboardingShell>
  );
}
