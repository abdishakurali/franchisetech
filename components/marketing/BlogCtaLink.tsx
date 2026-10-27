"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { captureClientEvent } from "@/lib/analytics/client-events";

/**
 * Blog article CTA link. Emits the same marketing_cta_clicked event as
 * MarketingCta so blog CTAs show up in the existing CTA funnel, with the
 * article slug and position to tell the mid-article box from the end one.
 */
export function BlogCtaLink({
  href,
  className,
  ctaType,
  ctaLocation,
  ctaText,
  blogSlug,
  children,
}: {
  href: string;
  className: string;
  ctaType: "primary" | "secondary";
  ctaLocation: "blog_mid" | "blog_end" | "blog_related_feature";
  ctaText: string;
  blogSlug: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        captureClientEvent("marketing_cta_clicked", {
          cta_type: ctaType,
          cta_location: ctaLocation,
          cta_text: ctaText,
          href,
          blog_slug: blogSlug,
        })
      }
    >
      {children}
    </Link>
  );
}
