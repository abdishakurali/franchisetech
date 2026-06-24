"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

interface SupportChatProps {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
  identifierHash?: string;
}

export function SupportChat({
  userId,
  userName,
  userEmail,
  identifierHash,
}: SupportChatProps) {
  const pathname = usePathname();
  const hiddenOnPos = pathname.startsWith("/app/pos");
  const identifiedRef = useRef(false);

  useEffect(() => {
    if (hiddenOnPos) return;
    window.chatwootSettings = {
      position: "right",
      type: "standard",
      hideMessageBubble: false,
    };
  }, [hiddenOnPos]);

  useEffect(() => {
    if (hiddenOnPos || !userId) return;

    const identify = () => {
      if (identifiedRef.current || !window.$chatwoot) return;

      const payload: Record<string, string> = {
        name: userName ?? userEmail ?? "franchisetech user",
      };
      if (userEmail) payload.email = userEmail;
      if (identifierHash) payload.identifier_hash = identifierHash;

      // Clear anonymous session so setUser can claim the contact (Chatwoot SDK quirk).
      window.$chatwoot.reset();
      window.setTimeout(() => {
        window.$chatwoot?.setUser(userId, payload);
        identifiedRef.current = true;
      }, 100);
    };

    const onReady = () => identify();

    window.addEventListener("chatwoot:ready", onReady);
    if (window.$chatwoot) identify();

    return () => {
      window.removeEventListener("chatwoot:ready", onReady);
    };
  }, [hiddenOnPos, userId, userName, userEmail, identifierHash]);

  function onLoad() {
    window.chatwootSDK?.run({
      websiteToken: "2A3tx1XLTJ9DSvm8xdzzyNkV",
      baseUrl: "https://support.franchisetech.ro",
    });
  }

  if (hiddenOnPos) return null;

  return (
    <Script
      id="chatwoot-sdk"
      strategy="lazyOnload"
      src="https://support.franchisetech.ro/packs/js/sdk.js"
      onLoad={onLoad}
    />
  );
}
