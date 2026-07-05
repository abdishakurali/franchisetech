import { createClient, createServiceClient } from "@/lib/supabase/server";

export type SubState =
  | "trialing"           // Stripe trial active
  | "soft_trial"         // No Stripe sub yet, within org trial window
  | "active"             // Paid and current
  | "past_due"           // Payment failed, within 3-day grace period
  | "past_due_expired"   // Grace period elapsed, access should be restricted
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

/**
 * Returns true if the subscription state allows full access to the app.
 * Use this on the backend — never trust client-sent subscription state.
 */
export function isAccessAllowed(sub: SubscriptionStatus): boolean {
  return (
    sub.state === "active" ||
    sub.state === "trialing" ||
    sub.state === "soft_trial" ||
    sub.state === "past_due"   // within grace period — still allowed
  );
}

/**
 * Returns true when the main app must be blocked and only legal fallback routes
 * should remain available.
 */
export function isSubscriptionBlockedForApp(sub: SubscriptionStatus | null | undefined): boolean {
  return (
    sub?.state === "none" ||
    sub?.state === "past_due_expired" ||
    sub?.state === "canceled" ||
    sub?.state === "incomplete"
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
    case "soft_trial":        return `Free trial — ${days ?? "?"} day${days === 1 ? "" : "s"} left`;
    case "active":            return cancelAtEnd
                                ? `${plan ?? "Plan"} · cancels at period end`
                                : `${plan ?? "Plan"} · active`;
    case "past_due":          return graceDaysLeft !== null
                                ? `Payment failed — ${graceDaysLeft} day${graceDaysLeft === 1 ? "" : "s"} to update payment`
                                : "Payment failed — update your card to continue";
    case "past_due_expired":  return "Payment overdue — access restricted until payment is updated";
    case "canceled":          return "Subscription ended";
    case "incomplete":        return "Checkout not completed";
    default:                  return "No active plan";
  }
}

export async function getSubscriptionStatus(orgId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();
  const service = await createServiceClient();

  const [{ data: org }, { data: sub }] = await Promise.all([
    supabase
      .from("organisations")
      .select("trial_ends_at, referral_credit_months, stripe_customer_id")
      .eq("id", orgId)
      .maybeSingle(),
    service
      .from("billing_subscriptions")
      .select("plan, status, trial_end, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id, grace_period_ends_at")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const creditMonths = Number(org?.referral_credit_months ?? 0);
  const stripeCustomerId = sub?.stripe_customer_id ?? org?.stripe_customer_id ?? null;
  const trialEndsAt = org?.trial_ends_at ?? null;
  const softTrialDays = daysUntil(trialEndsAt);

  if (!sub) {
    const state: SubState = softTrialDays !== null && softTrialDays > 0 ? "soft_trial" : "none";
    return {
      state,
      plan: null,
      label: humanLabel(state, null, softTrialDays, false, null),
      urgent: state === "none",
      showUpgradeCTA: true,
      trialEndsAt,
      stripeTrialEnd: null,
      periodEnd: null,
      gracePeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      creditMonths,
      stripeCustomerId,
      stripeSubscriptionId: null,
      trialDaysLeft: softTrialDays,
      graceDaysLeft: null,
    };
  }

  const status = sub.status as string;
  const stripeTrialEnd = sub.trial_end ?? null;
  const stripeTrialDays = daysUntil(stripeTrialEnd);
  const gracePeriodEndsAt = (sub as Record<string, unknown>).grace_period_ends_at as string | null ?? null;
  const graceDaysLeft = daysUntil(gracePeriodEndsAt);

  let state: SubState;
  switch (status) {
    case "trialing":   state = "trialing";   break;
    case "active":     state = "active";     break;
    case "past_due":
      // Distinguish: within grace window vs expired
      state = gracePeriodEndsAt && new Date(gracePeriodEndsAt) <= new Date()
        ? "past_due_expired"
        : "past_due";
      break;
    case "canceled":   state = "canceled";   break;
    case "incomplete": state = "incomplete"; break;
    default:           state = "none";
  }

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
}
