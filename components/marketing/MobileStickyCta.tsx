"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingMessages } from "@/lib/marketing/use-marketing-locale";

export function MobileStickyCta() {
  const t = useMarketingMessages();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  // Most of this site's traffic is mobile, so this is the CTA most visitors actually
  // tap. Building the href from `plan` alone dropped every utm_*/click ID on the way
  // to /signup, which left the conversion upload with nothing to attribute against.
  const signupParams = new URLSearchParams();
  if (plan) signupParams.set("plan", plan);
  for (const key of [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid",
  ]) {
    const value = searchParams.get(key);
    if (value) signupParams.set(key, value);
  }
  const signupHref = signupParams.size ? `/signup?${signupParams.toString()}` : "/signup";

  if (
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/compare")
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-lg">
        <Link
          href={signupHref}
          className="flex w-full items-center justify-center rounded-[10px] bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
          onClick={() =>
            captureClientEvent("marketing_cta_clicked", {
              cta_type: "primary",
              cta_location: "mobile_sticky",
              cta_text: t.cta.getStarted,
              href: signupHref,
              plan: plan ?? null,
            })
          }
        >
          {t.cta.getStarted}
        </Link>
      </div>
    </div>
  );
}
