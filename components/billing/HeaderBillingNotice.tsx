"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/billing/subscription";
import type { AppT } from "@/lib/app-i18n";

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

  if (state === "active" && !subStatus?.cancelAtPeriodEnd) {
    return null;
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

  return (
    <Link
      href="/app/billing"
      className={cn(chipClass, "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100", className)}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{t.shell.trialDaysLeft(effectiveDays)}</span>
    </Link>
  );
}
