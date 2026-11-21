"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { captureClientEvent } from "@/lib/analytics/client-events";

/**
 * Blog article CTA link. Emits the same marketing_cta_clicked event as
 * MarketingCta so blog CTAs show up in the existing CTA funnel, with the
 * article slug and position to tell the mid-article box from the end one.
 *
 * `ctaId` names the offer (e.g. "blog_whatsapp_question") so a new CTA can be
 * measured against the old demo one. External hrefs (WhatsApp) open in a new
 * tab and also emit contact_link_clicked, so they count in the contact funnel.
 */
export function BlogCtaLink({
  href,
  className,
  ctaType,
  ctaLocation,
  ctaText,
  blogSlug,
  ctaId,
  children,
}: {
  href: string;
  className: string;
  ctaType: "primary" | "secondary";
  ctaLocation: "blog_mid" | "blog_end" | "blog_related_feature";
  ctaText: string;
  blogSlug: string;
  ctaId?: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//.test(href);
  const onClick = () => {
    captureClientEvent("marketing_cta_clicked", {
      cta_type: ctaType,
      cta_location: ctaLocation,
      cta_text: ctaText,
      cta_id: ctaId ?? null,
      href,
      blog_slug: blogSlug,
    });
    if (external && href.includes("wa.me")) {
      captureClientEvent("contact_link_clicked", { channel: "whatsapp", location: ctaLocation, blog_slug: blogSlug, cta_id: ctaId ?? null });
    }
  };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
