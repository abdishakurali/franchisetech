import { getActiveOrg } from "@/lib/kitchenops/data";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { MenuBuilder } from "@/components/onboarding/MenuBuilder";
import { onboardingStepLabels, onboardingStepOfLabel } from "@/lib/onboarding/steps";

const STRINGS = {
  ro: {
    title: "Construiește meniul",
    subtitle: "Adaugă categoriile și produsele tale — apar imediat în POS.",
    timeEstimate: "~3 minute",
    trialBadge: "Probă 15 zile · fără card necesar",
  },
  en: {
    title: "Build your menu",
    subtitle: "Add your categories and products — they show up in POS immediately.",
    timeEstimate: "~3 minutes",
    trialBadge: "15-day trial · no card required",
  },
};

export default async function OnboardingMenuPage() {
  const { supabase, orgId, countryCode } = await getActiveOrg();
  const isRO = countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = STRINGS[locale];
  const stepLabels = onboardingStepLabels(isRO, locale);

  const [{ data: categories }, { data: products }, vatRates] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, name, sort_order")
      .eq("organisation_id", orgId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, sale_price, pos_category_id, category_id")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .order("name", { ascending: true }),
    listActiveVatRates(supabase, orgId),
  ]);

  const defaultVatRate = getDefaultVatRateValue(vatRates ?? []);

  return (
    <OnboardingShell
      stepLabels={stepLabels}
      currentStepIndex={2}
      title={t.title}
      subtitle={t.subtitle}
      timeEstimate={t.timeEstimate}
      stepOfLabel={onboardingStepOfLabel(2, stepLabels.length, locale)}
      trialBadge={t.trialBadge}
    >
      <MenuBuilder
        locale={locale}
        defaultVatRate={defaultVatRate}
        initialCategories={(categories ?? []).map((c) => ({ id: c.id as string, name: c.name as string }))}
        initialProducts={(products ?? []).map((p) => ({
          id: p.id as string,
          name: p.name as string,
          sale_price: Number(p.sale_price ?? 0),
          category_id: (p.pos_category_id ?? p.category_id) as string | null,
        }))}
      />
    </OnboardingShell>
  );
}
