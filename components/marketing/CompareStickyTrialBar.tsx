"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMarketingMessages } from "@/lib/marketing/use-marketing-locale";
import { compareSignupHref } from "@/lib/marketing/compare-locale";
import type { MarketingLocale } from "@/lib/marketing/locale";

export function CompareStickyTrialBar({
  competitorSlug = "compare",
  locale = "ro",
}: {
  competitorSlug?: string;
  locale?: MarketingLocale;
}) {
  const t = useMarketingMessages();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-sm font-medium text-slate-800 sm:text-left">
          {t.cta.parallelTrial}
        </p>
        <Link
          href={compareSignupHref(competitorSlug, locale)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t.cta.startTrial} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
