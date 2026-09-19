import { OnboardingStepper } from "@/components/app/OnboardingStepper";

type Props = {
  stepLabels: string[];
  currentStepIndex: number;
  title: string;
  subtitle?: string;
  timeEstimate?: string;
  /** Pre-formatted "Pasul 2 din 6" / "Step 2 of 6" — see OnboardingStepper
   *  for why this is a string, not a formatter function. */
  stepOfLabel: string;
  trialBadge?: string;
  children: React.ReactNode;
};

/**
 * The shared centered, calm shell every /onboarding/* route renders inside.
 * No app navbar, no dashboard chrome — onboarding IS the product until the
 * user reaches /onboarding/result (see docs/onboarding-redesign-audit-
 * 2026-09-19.md Section 19/29). The receipt-edge motif at the card's foot
 * is the redesign's signature detail, not decoration.
 */
export function OnboardingShell({
  stepLabels,
  currentStepIndex,
  title,
  subtitle,
  timeEstimate,
  stepOfLabel,
  trialBadge,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />
          {trialBadge ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground ring-1 ring-brass/25">
              {trialBadge}
            </span>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-[768px] px-4 py-8 pb-16 sm:py-10">
        <OnboardingStepper labels={stepLabels} current={currentStepIndex} timeEstimate={timeEstimate} stepOfLabel={stepOfLabel} />

        <div className="receipt-edge-bottom overflow-hidden rounded-xl border border-border bg-card pb-4">
          <div className="p-5 sm:p-10">
            <div className="mb-8">
              <h1 className="font-[family-name:var(--font-display)] text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[34px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 max-w-xl text-[17px] leading-[1.55] text-mid">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
