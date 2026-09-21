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
 * The shared calm, operational shell every /onboarding/* route renders
 * inside. No app navbar, no dashboard chrome — onboarding IS the product
 * until the user reaches /onboarding/result. Uses the .app-shell token
 * scope (neutral, sans) rather than the marketing site's editorial brass/
 * serif identity — onboarding is a setup task, not a landing page.
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
    <div className="app-shell min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />
          {trialBadge ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              {trialBadge}
            </span>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-[640px] px-4 py-8 pb-16 sm:py-10">
        <OnboardingStepper labels={stepLabels} current={currentStepIndex} timeEstimate={timeEstimate} stepOfLabel={stepOfLabel} />

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-5 sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
