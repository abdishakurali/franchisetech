"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMarketingMessages } from "@/lib/marketing/use-marketing-locale";

export function MarketingAnnouncementBar() {
  const t = useMarketingMessages();

  return (
    <div className="border-b border-blue-100 bg-blue-600 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1.5 px-4 py-1.5 text-center text-xs font-medium sm:flex-row sm:gap-3 sm:text-sm">
        <p>{t.announcement.text}</p>
        <Link
          href="/signup?plan=starter"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25 sm:text-sm"
        >
          {t.announcement.cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
