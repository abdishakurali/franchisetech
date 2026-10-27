// No-card Pro trial (owner decision 2026-10-27, replaces the permanent Free
// plan): onboarding starts it, every org gets it once. After it ends, an org
// without a subscription keeps selling and fiscal receipts but loses the Pro
// management features until it pays.

export const TRIAL_DAYS = 15;

export function trialWindow(now: Date = new Date()): { startedAt: string; endsAt: string } {
  return {
    startedAt: now.toISOString(),
    endsAt: new Date(now.getTime() + TRIAL_DAYS * 86_400_000).toISOString(),
  };
}

export function isTrialActive(trialEndsAt: string | null | undefined, now: Date = new Date()): boolean {
  return Boolean(trialEndsAt && new Date(trialEndsAt).getTime() > now.getTime());
}
