"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

interface SupportChatProps {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
}

export function SupportChat({ userId, userName, userEmail }: SupportChatProps) {
  const pathname = usePathname();
  const hiddenOnPos = pathname.startsWith("/app/pos");

  useEffect(() => {
    if (hiddenOnPos) return;
    window.chatwootSettings = {
      position: "right",
      type: "standard",
      hideMessageBubble: false,
    };
  }, [hiddenOnPos]);

  function onLoad() {
    window.chatwootSDK?.run({
      websiteToken: "2A3tx1XLTJ9DSvm8xdzzyNkV",
      baseUrl: "https://support.franchisetech.ro",
    });

    if (userId && userEmail) {
      const trySet = () => {
        if (window.$chatwoot) {
          window.$chatwoot.setUser(userId, {
            email: userEmail,
            name: userName ?? userEmail,
          });
        } else {
          setTimeout(trySet, 300);
        }
      };
      trySet();
    }
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
