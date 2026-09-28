"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/billing/subscription";
import type { AppT } from "@/lib/app-i18n";
import { effectivePlanLabel } from "@/lib/business-modules";
import type { EffectiveBillingPlan } from "@/lib/billing/entitlements";

// Only these two plan codes have a coherent, self-serve upgrade path on the
// current /pricing page (Free -> Pro -> Multi). Every legacy code (starter,
// core, pro, operations, scale, multi_location) predates that page and has
// no matching card there — nudging those payers to "upgrade" pointed
// existing paying customers (e.g. a legacy "pro"/Operations subscriber) at a
// page that doesn't even list their current plan.
const UPGRADABLE_PLANS = new Set(["free", "growth"]);

type Props = {
  subStatus?: SubscriptionStatus;
  daysLeft: number;
  t: AppT;
  className?: string;
};

const chipClass =
  "inline-flex max-w-[11rem] sm:max-w-none items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors shrink-0";

export function HeaderBillingNotice({ subStatus, daysLeft, t, className }: Props) {
  const state = subStatus?.state;

  // Free is the permanent baseline (trial retired 2026-09), not a countdown
  // state — no urgency chip, same as "active". Both still get a quiet plan
  // badge so there's always somewhere in the header to see the current plan
  // and upgrade, rather than only surfacing that during urgent states.
  if ((state === "active" && !subStatus?.cancelAtPeriodEnd) || state === "free") {
    const planLabel = effectivePlanLabel((subStatus?.plan ?? "free") as EffectiveBillingPlan);
    const showUpgrade = Boolean(subStatus?.plan && UPGRADABLE_PLANS.has(subStatus.plan));
    return (
      <Link
        // Was /pricing: the public marketing page always renders a signup
        // link (?plan=...), never a checkout button, for every visitor —
        // logged in or not (PricingPlansSection's "marketing" variant has no
        // loggedIn branch). A logged-in owner clicking "Upgrade" landed back
        // in the anonymous signup funnel instead of a checkout for their own
        // org. /app/billing renders the "billing" variant, which does render
        // a real Stripe checkout button once the org's own plan is free.
        href="/app/billing"
        className={cn(chipClass, "border-border bg-muted/50 text-muted-foreground hover:bg-muted", className)}
      >
        <span className="truncate">{planLabel}</span>
        {showUpgrade && <span className="text-brass">· {t.shell.billingUpgrade}</span>}
      </Link>
    );
  }

  if (state === "past_due_expired") {
    return (
      <Link
        href="/app/billing"
        className={cn(chipClass, "border-red-200 bg-red-50 text-red-800 hover:bg-red-100", className)}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{t.shell.billingPaymentRequired}</span>
      </Link>
    );
  }

  if (state === "past_due") {
    const graceDays = subStatus?.graceDaysLeft;
    return (
      <Link
        href="/app/billing"
        className={cn(chipClass, "border-red-200 bg-red-50 text-red-800 hover:bg-red-100", className)}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">
          {graceDays != null ? t.shell.billingGraceDays(graceDays) : t.shell.billingUpdateCard}
        </span>
      </Link>
    );
  }

  if (state === "canceled") {
    return (
      <Link
        href="/app/billing"
        className={cn(chipClass, "border-red-200 bg-red-50 text-red-800 hover:bg-red-100", className)}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{t.shell.billingEnded}</span>
      </Link>
    );
  }

  if (state === "active" && subStatus?.cancelAtPeriodEnd) {
    return (
      <Link
        href="/app/billing"
        className={cn(chipClass, "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100", className)}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{t.shell.billingCancelPending}</span>
      </Link>
    );
  }

  const effectiveDays = subStatus?.trialDaysLeft ?? daysLeft;
  if (effectiveDays > 15) return null;
  const trialUrgent = effectiveDays <= 5;

  return (
    <Link
      href="/app/billing"
      className={cn(
        chipClass,
        trialUrgent
          ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
          : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100",
        className,
      )}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{t.shell.trialDaysLeft(effectiveDays)}</span>
    </Link>
  );
}
