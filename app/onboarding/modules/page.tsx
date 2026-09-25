import { getActiveOrg } from "@/lib/kitchenops/data";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ModuleSelectorForm } from "@/components/onboarding/ModuleSelectorForm";
import { onboardingStepLabels, onboardingStepOfLabel } from "@/lib/onboarding/steps";

const STRINGS = {
  ro: {
    title: "Ce vrei să gestionezi cu franchisetech?",
    subtitle: "Activează doar ce ai nevoie acum — poți schimba oricând din Setări.",
    timeEstimate: "~30 secunde",
    trialBadge: "Gratuit pentru totdeauna · fără card necesar",
  },
  en: {
    title: "What do you want to manage with franchisetech?",
    subtitle: "Turn on only what you need now — change it anytime in Settings.",
    timeEstimate: "~30 seconds",
    trialBadge: "Free forever · no card required",
  },
};

export default async function OnboardingModulesPage() {
  const { supabase, orgId, countryCode } = await getActiveOrg();
  const isRO = countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = STRINGS[locale];
  const stepLabels = onboardingStepLabels(isRO, locale);

  const { data: org } = await supabase
    .from("organisations")
    .select("inventory_enabled, purchases_enabled, recipe_costing_enabled")
    .eq("id", orgId)
    .maybeSingle();

  return (
    <OnboardingShell
      stepLabels={stepLabels}
      currentStepIndex={1}
      title={t.title}
      subtitle={t.subtitle}
      timeEstimate={t.timeEstimate}
      stepOfLabel={onboardingStepOfLabel(1, stepLabels.length, locale)}
      trialBadge={t.trialBadge}
    >
      <ModuleSelectorForm
        locale={locale}
        initial={{
          inventory_enabled: Boolean(org?.inventory_enabled),
          purchases_enabled: Boolean(org?.purchases_enabled),
          recipe_costing_enabled: Boolean(org?.recipe_costing_enabled),
        }}
      />
    </OnboardingShell>
  );
}
