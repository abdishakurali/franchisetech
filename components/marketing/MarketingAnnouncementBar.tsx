"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingMessages } from "@/lib/marketing/use-marketing-locale";

export function MarketingAnnouncementBar() {
  const t = useMarketingMessages();

  return (
    <div className="border-b border-brass/25 bg-brass text-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1.5 px-4 py-1.5 text-center text-xs font-medium sm:flex-row sm:gap-3 sm:text-sm">
        <p>{t.announcement.text}</p>
        <Link
          href="/signup?plan=starter"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-card/25 sm:text-sm"
          onClick={() =>
            captureClientEvent("marketing_cta_clicked", {
              cta_type: "announcement",
              cta_location: "announcement",
              cta_text: t.announcement.cta,
              href: "/signup?plan=starter",
              plan: "starter",
            })
          }
        >
          {t.announcement.cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
