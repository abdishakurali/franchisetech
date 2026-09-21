"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";
import {
  onboardingStepGroupIndex,
  onboardingStepLabels,
  onboardingStepOfLabel,
  onboardingStepRoute,
  type OnboardingStep,
} from "@/lib/onboarding/steps";
import { OnboardingStepper } from "@/components/app/OnboardingStepper";

type Props = {
  locale: AppLocale;
  onboardingStep: OnboardingStep | null;
  isRO: boolean;
};

/** Real onboarding progress + the single next action — not a fixed mock.
 * Shown on the dashboard before the org's first sale is recorded. */
export function ActivationBanner({ locale, onboardingStep, isRO }: Props) {
  const t = getAppText(locale);
  const labels = onboardingStepLabels(isRO, locale);
  const current = onboardingStepGroupIndex(onboardingStep, isRO);
  const nextRoute = onboardingStepRoute(onboardingStep, isRO);
  const stepOfLabel = onboardingStepOfLabel(current, labels.length, locale);

  return (
    <div className="overflow-hidden rounded-xl border border-brass/30 bg-accent shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brass text-ink">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{t.dashboard.continueSetup}</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-mid">{t.dashboard.continueSetupDesc}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={nextRoute}
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t.dashboard.continueSetupCta}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>

        <OnboardingStepper labels={labels} current={current} stepOfLabel={stepOfLabel} />
      </div>
    </div>
  );
}
