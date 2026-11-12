import { after } from "next/server";
import { captureServerEvent, flushPostHog } from "@/lib/posthog-server";
import { deriveAccountType, type AccountType } from "@/lib/analytics/account-type";

// One PostHog event per onboarding step the owner finishes, so the funnel
// shows where cafés drop (audit 2026-11-12, lane 7 #4). Before this only
// step 1 sent anything, and `onboarding_completed` fired when step 1 was
// done, which overstated completion.
//
// Event name: `onboarding_step_completed`, with `step` set to the step just
// finished. `onboarding_completed` now fires only from the final step
// (completeOnboardingJourney), when the org row really flips to complete.

export const ONBOARDING_STEP_COMPLETED = "onboarding_step_completed";
export const ONBOARDING_COMPLETED = "onboarding_completed";

/** Order matters: it is the funnel order (step_index). */
export const ONBOARDING_FUNNEL_STEPS = [
  "business_cui",
  "modules",
  "menu",
  "fiscal",
  "first_sale",
  "result",
] as const;
export type OnboardingFunnelStep = (typeof ONBOARDING_FUNNEL_STEPS)[number];

type Props = Record<string, string | number | boolean | null | undefined>;

export function onboardingStepEventProps(
  step: OnboardingFunnelStep,
  input: { orgId: string; email?: string | null; orgName?: string | null; extra?: Props },
): Props & { step: OnboardingFunnelStep; step_index: number; account_type: AccountType } {
  return {
    ...input.extra,
    step,
    step_index: ONBOARDING_FUNNEL_STEPS.indexOf(step) + 1,
    organisation_id: input.orgId,
    account_type: deriveAccountType(input.email, input.orgName),
  };
}

/**
 * Fire-and-forget: never throws, never blocks the step. Call it after the
 * step's DB write succeeded and before redirect().
 */
export function trackOnboardingStepCompleted(
  step: OnboardingFunnelStep,
  input: { userId: string; orgId: string; email?: string | null; orgName?: string | null; extra?: Props },
): void {
  try {
    const props = onboardingStepEventProps(step, input);
    const groups = { organisation: input.orgId };
    captureServerEvent(input.userId, ONBOARDING_STEP_COMPLETED, props, groups);
    if (step === "result") captureServerEvent(input.userId, ONBOARDING_COMPLETED, props, groups);
    after(flushPostHog);
  } catch {
    // analytics must not block onboarding
  }
}
