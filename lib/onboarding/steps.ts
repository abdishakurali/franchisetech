// Shared step-machine constants for the onboarding journey — one continuous
// flow from account creation through the first sale (see
// docs/onboarding-redesign-audit-2026-09-19.md, Sections N-O). Every
// /onboarding/* route reads the same labels/index logic so the progress
// stepper never disagrees with itself between pages.

export type OnboardingStep =
  | "location_type"
  | "business_cui"
  | "modules"
  | "menu"
  | "stock_setup"
  | "recipe_setup"
  | "fiscal"
  | "first_sale"
  | "result"
  | "complete";

export function onboardingStepRoute(step: OnboardingStep | null | undefined, isRO: boolean): string {
  switch (step) {
    case "modules":
      return "/onboarding/modules";
    case "menu":
    case "stock_setup":
    case "recipe_setup":
      return "/onboarding/menu";
    case "fiscal":
      return isRO ? "/onboarding/fiscal" : "/app/pos?onboarding=1&welcome=1";
    case "first_sale":
      return "/app/pos?onboarding=1&welcome=1";
    case "result":
      return "/onboarding/result";
    case "complete":
      return "/app";
    case "location_type":
    case "business_cui":
    default:
      return "/onboarding";
  }
}

/** The visual stepper's fixed labels — 6 stages for RO (FiscalNet included), 5 otherwise. */
export function onboardingStepLabels(isRO: boolean, locale: "ro" | "en"): string[] {
  const ro = ["Firma", "Funcționalități", "Meniu", ...(isRO ? ["FiscalNet"] : []), "Prima vânzare", "Gata"];
  const en = ["Business", "Modules", "Menu", ...(isRO ? ["FiscalNet"] : []), "First sale", "Done"];
  return locale === "ro" ? ro : en;
}

/** "Pasul 2 din 6" / "Step 2 of 6" — a plain string, deliberately not a
 *  formatter function, since onboarding pages are Server Components and a
 *  function prop can't cross into the client stepper (RSC serialization). */
export function onboardingStepOfLabel(currentStepIndex: number, totalSteps: number, locale: "ro" | "en"): string {
  const current = currentStepIndex + 1;
  return locale === "ro" ? `Pasul ${current} din ${totalSteps}` : `Step ${current} of ${totalSteps}`;
}

/** Which of the fixed stepper labels the given DB step falls under. */
export function onboardingStepGroupIndex(step: OnboardingStep | null | undefined, isRO: boolean): number {
  switch (step) {
    case "location_type":
    case "business_cui":
    case null:
    case undefined:
      return 0;
    case "modules":
      return 1;
    case "menu":
    case "stock_setup":
    case "recipe_setup":
      return 2;
    case "fiscal":
      return isRO ? 3 : 3; // fiscal never reached for non-RO orgs
    case "first_sale":
      return isRO ? 4 : 3;
    case "result":
    case "complete":
      return isRO ? 5 : 4;
    default:
      return 0;
  }
}
