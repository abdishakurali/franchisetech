"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { useMarketingLocale } from "@/lib/marketing/use-marketing-locale";

export function MobileStickyCta() {
  const locale = useMarketingLocale();
  const t = getMarketingMessages(locale);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const signupHref = plan ? `/signup?plan=${plan}` : "/signup";

  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/app")) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <Link
          href={signupHref}
          className="flex flex-1 items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t.cta.getStarted}
        </Link>
        <Link
          href="/partners"
          className="flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {t.cta.talkToSales}
        </Link>
      </div>
    </div>
  );
}
