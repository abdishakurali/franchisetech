import { cache } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type SubState =
  | "trialing"           // Stripe trial active
  | "soft_trial"         // No Stripe sub yet, within org trial window
  | "active"             // Paid and current
  | "past_due"           // Payment failed, within 3-day grace period
  | "past_due_expired"   // Grace period elapsed, billing is urgent but POS remains available
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
    sub.state === "past_due" ||   // within grace period — still allowed
    sub.state === "past_due_expired" // overdue, but restaurants must keep selling
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
    case "past_due_expired":  return "Payment overdue — update card; POS remains available";
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
      .select("trial_ends_at, referral_credit_months, stripe_customer_id, created_at")
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
  // A brand-new signup has no trial_ends_at at all (nothing writes it — the €1
  // card-verification flow that used to set it is no longer part of onboarding),
  // which would resolve to state "none" (blocked, "trial expired") on day zero,
  // before they'd seen the product. Falling back to created_at + 15 days gives
  // every new org a fully unrestricted 15-day look before any paywall applies,
  // without misreporting a new account as an expired one.
  //
  // This is THE number the public site quotes as "15 zile" / "15-day trial" in
  // ~130 places. It is the real trial length for every signup — keep the two in
  // sync, or the site starts making a false promise again.
  // (5 → 12 on 2026-08-25 when funnel data showed the card ask was the dominant
  // drop-off point; 12 → 15 on 2026-08-31 to match the advertised offer once the
  // card ask was dropped from the marketing entirely.)
  const SOFT_TRIAL_DAYS = 15;
  const impliedTrialEndsAt = org?.created_at
    ? new Date(new Date(org.created_at).getTime() + SOFT_TRIAL_DAYS * 86_400_000).toISOString()
    : null;
  const trialEndsAt = org?.trial_ends_at ?? impliedTrialEndsAt;
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
});
