"use client";

import type { ReactNode } from "react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { SUPPORT_PHONE_TEL, SUPPORT_WHATSAPP_URL } from "@/lib/marketing/contact-info";

// Phone and WhatsApp are the main lead channel; count every click by where it happened.
export function SupportContactLink({
  channel,
  location,
  className,
  children,
}: {
  channel: "phone" | "whatsapp";
  location: string;
  className?: string;
  children: ReactNode;
}) {
  const external = channel === "whatsapp";
  return (
    <a
      href={external ? SUPPORT_WHATSAPP_URL : SUPPORT_PHONE_TEL}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => captureClientEvent("contact_link_clicked", { channel, location })}
    >
      {children}
    </a>
  );
}
