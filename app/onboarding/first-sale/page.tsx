import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingStepLabels, onboardingStepGroupIndex, onboardingStepOfLabel } from "@/lib/onboarding/steps";

const STRINGS = {
  ro: {
    title: "Totul este pregătit",
    subtitle: "Faceți prima vânzare — produsele voastre sunt deja în casă.",
    step1: "1. Alege produsul",
    step2: "2. Încasează",
    cta: "Creează prima vânzare",
    timeEstimate: "~30 secunde",
  },
  en: {
    title: "Everything is ready",
    subtitle: "Make your first sale — your products are already in the till.",
    step1: "1. Choose the product",
    step2: "2. Take payment",
    cta: "Create the first sale",
    timeEstimate: "~30 seconds",
  },
};

export default async function OnboardingFirstSalePage() {
  const { countryCode } = await getActiveOrg();
  const isRO = countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = STRINGS[locale];
  const stepLabels = onboardingStepLabels(isRO, locale);
  const currentStepIndex = onboardingStepGroupIndex("first_sale", isRO);

  return (
    <OnboardingShell
      stepLabels={stepLabels}
      currentStepIndex={currentStepIndex}
      title={t.title}
      subtitle={t.subtitle}
      timeEstimate={t.timeEstimate}
      stepOfLabel={onboardingStepOfLabel(currentStepIndex, stepLabels.length, locale)}
      trialBadge={isRO ? "Probă 15 zile · fără card necesar" : "15-day trial · no card required"}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-card p-4 text-sm font-medium text-foreground">{t.step1}</div>
          <div className="rounded-md border border-border bg-card p-4 text-sm font-medium text-foreground">{t.step2}</div>
        </div>
        <div className="border-t border-border pt-6">
          <Link
            href="/app/pos?onboarding=1&welcome=1"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-10 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            {t.cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </OnboardingShell>
  );
}
