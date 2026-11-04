import { getActiveOrg } from "@/lib/kitchenops/data";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { isRoUnregisteredOrg, validateVatRateForOrg, vatRateOptionsForSelect } from "@/lib/vat-rates";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { MenuBuilder } from "@/components/onboarding/MenuBuilder";
import { onboardingStepLabels, onboardingStepOfLabel } from "@/lib/onboarding/steps";

const STRINGS = {
  ro: {
    title: "Construiește meniul",
    subtitle: "Adaugă categoriile și produsele tale — apar imediat în POS.",
    timeEstimate: "~3 minute",
    trialBadge: "15 zile Pro gratuit · fără card",
  },
  en: {
    title: "Build your menu",
    subtitle: "Add your categories and products — they show up in POS immediately.",
    timeEstimate: "~3 minutes",
    trialBadge: "15-day Pro trial · no card required",
  },
};

export default async function OnboardingMenuPage() {
  const { supabase, orgId, countryCode, membership } = await getActiveOrg();
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

  // The owner picks the VAT rate per category in MenuBuilder; nothing is
  // preselected. Offer only the rates addProductFromPos would accept for this
  // org: the same validateVatRateForOrg gate (ANAF registration) the server
  // applies, so an unregistered RO org isn't offered a rate that is rejected.
  const orgRow = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as
    | { anaf_vat_registered?: boolean | null }
    | null;
  const vatOrg = { countryCode, vatRegistered: Boolean(orgRow?.anaf_vat_registered) };
  const allRates = vatRates ?? [];
  const selectableVatRates = vatRateOptionsForSelect(allRates).filter(
    (rate) => validateVatRateForOrg(allRates, rate.rate, vatOrg).ok,
  );

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
        vatRates={selectableVatRates}
        vatRestrictedToZero={isRoUnregisteredOrg(vatOrg)}
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
