import { cache } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isTrialActive } from "@/lib/billing/trial";

export type SubState =
  | "trialing"           // Stripe trial active (a Stripe-native trial on the subscription itself)
  | "soft_trial"         // No Stripe sub, inside the 15-day no-card Pro trial onboarding starts (lib/billing/trial.ts)
  | "trial_expired"      // No Stripe sub, trial over: can still sell and issue fiscal receipts, Pro features locked until they pay
  | "free"               // Retired 2026-10-27 (permanent Free plan) — never produced anymore, kept for type compatibility
  | "active"             // Paid and current
  | "past_due"           // Payment failed, within grace period (see GRACE_PERIOD_DAYS)
  | "past_due_expired"   // Grace period elapsed — app access blocked until payment succeeds
  | "canceled"           // Subscription ended
  | "incomplete"         // Checkout started but not completed
  | "none";              // No trial, no subscription

export type SubscriptionStatus = {
  state: SubState;
  plan: string | null;
  label: string;
  urgent: boolean;
  showUpgradeCTA: boolean;
  // Dates (ISO strings)
  trialEndsAt: string | null;
  stripeTrialEnd: string | null;
  periodEnd: string | null;
  gracePeriodEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  // Credit
  creditMonths: number;
  // Stripe IDs
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  // Derived day counts
  trialDaysLeft: number | null;
  graceDaysLeft: number | null;
};

/** Days until `iso` timestamp, clamped to 0. Returns null if iso is null. */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export function resolveSubscriptionState(
  status: string,
  currentPeriodEnd: string | null,
  gracePeriodEndsAt: string | null,
): SubState {
  switch (status) {
    case "trialing": return "trialing";
    case "active": return "active";
    case "past_due":
      return gracePeriodEndsAt && new Date(gracePeriodEndsAt) <= new Date()
        ? "past_due_expired"
        : "past_due";
    case "canceled":
      if (gracePeriodEndsAt && new Date(gracePeriodEndsAt) > new Date()) return "past_due";
      return currentPeriodEnd && new Date(currentPeriodEnd) > new Date()
        ? "active"
        : "canceled";
    case "incomplete": return "incomplete";
    default: return "none";
  }
}

export function isStripeSubscriptionRecord(row: { stripe_subscription_id: string | null }): boolean {
  return Boolean(row.stripe_subscription_id);
}

/**
 * No subscription row. An org with no trial dates (created before the trial
 * existed) counts as an ended trial, never as blocked: selling and fiscal
 * receipts must keep working (see entitlement-resolver resolveNoSubscription).
 */
export function resolveNoSubscriptionState(input: { trialEndsAt: string | null }): SubState {
  return isTrialActive(input.trialEndsAt) ? "soft_trial" : "trial_expired";
}

/**
 * Returns true if the subscription state allows full access to the app.
 * Use this on the backend — never trust client-sent subscription state.
 */
export function isAccessAllowed(sub: SubscriptionStatus): boolean {
  return (
    sub.state === "active" ||
    sub.state === "trialing" ||
    sub.state === "soft_trial" ||
    sub.state === "trial_expired" || // reduced, not blocked: selling stays open
    sub.state === "free" ||          // retired, never produced; kept so old rows can't lock a till
    sub.state === "past_due" // within grace period — still allowed
    // past_due_expired is NOT allowed — grace period (see GRACE_PERIOD_DAYS in
    // lib/billing/stripe-sync.ts) has elapsed with no successful payment.
  );
}

/**
 * Returns true when the main app must be blocked and only legal fallback routes
 * should remain available.
 */
export function isSubscriptionBlockedForApp(sub: SubscriptionStatus | null | undefined): boolean {
  return (
    sub?.state === "none" ||
    sub?.state === "canceled" ||
    sub?.state === "incomplete" ||
    sub?.state === "past_due_expired"
  );
}

function humanLabel(
  state: SubState,
  plan: string | null,
  days: number | null,
  cancelAtEnd: boolean,
  graceDaysLeft: number | null,
): string {
  switch (state) {
    case "trialing":          return `Stripe trial — ${days ?? "?"} day${days === 1 ? "" : "s"} left`;
    case "soft_trial":        return `Pro trial — ${days ?? "?"} day${days === 1 ? "" : "s"} left`;
    case "trial_expired":     return "Trial ended — choose a plan";
    case "free":              return "Free plan";
    case "active":            return cancelAtEnd
                                ? `${plan ?? "Plan"} · cancels at period end`
                                : `${plan ?? "Plan"} · active`;
    case "past_due":          return graceDaysLeft !== null
                                ? `Payment failed — ${graceDaysLeft} day${graceDaysLeft === 1 ? "" : "s"} to update payment`
                                : "Payment failed — update your card to continue";
    case "past_due_expired":  return "Payment overdue — update your card to restore access";
    case "canceled":          return "Subscription ended";
    case "incomplete":        return "Checkout not completed";
    default:                  return "No active plan";
  }
}

// cache() by orgId: layout.tsx and requireBusinessModule() (via the
// module-guard path) both call this independently on the same navigation —
// dedupe to one query pair per request, same as fetchOrgModuleFlags above.
export const getSubscriptionStatus = cache(async function getSubscriptionStatus(orgId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();
  const service = await createServiceClient();

  const [{ data: org }, { data: sub }] = await Promise.all([
    supabase
      .from("organisations")
      .select("referral_credit_months, stripe_customer_id, card_verified_at, trial_started_at, trial_ends_at")
      .eq("id", orgId)
      .maybeSingle(),
    service
      .from("billing_subscriptions")
      .select("plan, status, trial_end, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id, grace_period_ends_at")
      .eq("organisation_id", orgId)
      .not("stripe_subscription_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const creditMonths = Number(org?.referral_credit_months ?? 0);
  const stripeCustomerId = sub?.stripe_customer_id ?? org?.stripe_customer_id ?? null;

  if (!sub) {
    // 15-day no-card Pro trial (lib/billing/trial.ts), then trial_expired.
    // Must agree with entitlement-resolver resolveNoSubscription.
    const state = resolveNoSubscriptionState({ trialEndsAt: org?.trial_ends_at ?? null });
    const trialEndsAt = org?.trial_ends_at ?? null;
    const trialDaysLeft = state === "soft_trial" ? daysUntil(trialEndsAt) : null;
    return {
      state,
      plan: null,
      label: humanLabel(state, null, trialDaysLeft, false, null),
      urgent: state === "trial_expired" || (trialDaysLeft !== null && trialDaysLeft <= 3),
      showUpgradeCTA: true,
      trialEndsAt,
      stripeTrialEnd: null,
      periodEnd: null,
      gracePeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      creditMonths,
      stripeCustomerId,
      stripeSubscriptionId: null,
      trialDaysLeft,
      graceDaysLeft: null,
    };
  }

  // A real subscription row exists — org-level implied trial no longer applies.
  const softTrialDays: number | null = null;
  const trialEndsAt: string | null = null;

  const status = sub.status as string;
  const stripeTrialEnd = sub.trial_end ?? null;
  const stripeTrialDays = daysUntil(stripeTrialEnd);
  const gracePeriodEndsAt = (sub as Record<string, unknown>).grace_period_ends_at as string | null ?? null;
  const graceDaysLeft = daysUntil(gracePeriodEndsAt);

  const state = resolveSubscriptionState(status, sub.current_period_end ?? null, gracePeriodEndsAt);

  const trialDays = state === "trialing" ? stripeTrialDays : softTrialDays;

  return {
    state,
    plan: sub.plan ?? null,
    label: humanLabel(state, sub.plan, trialDays, Boolean(sub.cancel_at_period_end), graceDaysLeft),
    urgent: state === "past_due" || state === "past_due_expired" || state === "canceled",
    showUpgradeCTA: state !== "active" && state !== "trialing",
    trialEndsAt,
    stripeTrialEnd,
    periodEnd: sub.current_period_end ?? null,
    gracePeriodEndsAt,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    creditMonths,
    stripeCustomerId,
    stripeSubscriptionId: sub.stripe_subscription_id ?? null,
    trialDaysLeft: trialDays,
    graceDaysLeft,
  };
});
