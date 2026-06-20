"use client";

import Link from "next/link";
import { AlertTriangle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@/lib/billing/subscription";

type Props = {
  subStatus?: SubscriptionStatus;
  daysLeft: number;
  creditMonths: number;
  referral?: { link: string | null; code: string | null } | null;
  onReferralOpen: () => void;
};

export function TrialBanner({ subStatus, daysLeft, creditMonths, referral, onReferralOpen }: Props) {
  const state = subStatus?.state;

  if (state === "active" && !subStatus?.cancelAtPeriodEnd) return null;

  if (state === "past_due_expired") {
    return (
      <div className="flex print:hidden flex-wrap items-center justify-between gap-3 border-b border-red-300 bg-red-100 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Access restricted — payment is required to continue.</span>
        </div>
        <Link href="/app/billing">
          <Button size="sm" variant="destructive" className="shrink-0">
            Fix billing
          </Button>
        </Link>
      </div>
    );
  }

  if (state === "past_due") {
    const graceDays = subStatus?.graceDaysLeft;
    return (
      <div className="flex print:hidden flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            {graceDays != null
              ? `Payment failed — ${graceDays} day${graceDays === 1 ? "" : "s"} left to update your card.`
              : "Payment failed — update your payment details to continue."}
          </span>
        </div>
        <Link href="/app/billing">
          <Button size="sm" variant="destructive" className="shrink-0">
            Fix billing
          </Button>
        </Link>
      </div>
    );
  }

  if (state === "canceled") {
    return (
      <div className="flex print:hidden flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Your subscription has ended. Resubscribe to continue.</span>
        </div>
        <Link href="/app/billing">
          <Button size="sm" variant="destructive" className="shrink-0">
            Fix billing
          </Button>
        </Link>
      </div>
    );
  }

  if (state === "active" && subStatus?.cancelAtPeriodEnd) {
    const cancelDate = subStatus.periodEnd
      ? new Date(subStatus.periodEnd).toLocaleDateString("en-IE")
      : "soon";
    return (
      <div className="flex print:hidden flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Your plan is set to cancel on {cancelDate}.</span>
        </div>
        <Link href="/app/billing">
          <Button size="sm" variant="outline" className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100">
            Reactivate
          </Button>
        </Link>
      </div>
    );
  }

  const effectiveDays = subStatus?.trialDaysLeft ?? daysLeft;

  return (
    <div className="trial-banner flex print:hidden flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-4 py-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700">
        <span className="font-medium">
          Assisted trial: {effectiveDays} day{effectiveDays === 1 ? "" : "s"} left · Pro access
        </span>
        <span className="hidden text-slate-300 sm:inline">|</span>
        <Link href="/app/billing" className="text-blue-700 hover:underline">
          Subscribe anytime
        </Link>
        {creditMonths > 0 ? (
          <>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span>Referral credit: {creditMonths} free month{creditMonths === 1 ? "" : "s"}</span>
          </>
        ) : null}
      </div>
      {referral?.link ? (
        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 shrink-0" onClick={onReferralOpen}>
          <Gift className="h-4 w-4" />
          Refer
        </Button>
      ) : null}
    </div>
  );
}
