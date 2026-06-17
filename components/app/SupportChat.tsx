"use client";

import { useEffect } from "react";
import Script from "next/script";


interface SupportChatProps {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
}

export function SupportChat({ userId, userName, userEmail }: SupportChatProps) {
  useEffect(() => {
    window.chatwootSettings = {
      position: "right",
      type: "standard",
      hideMessageBubble: false,
    };
  }, []);

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

  return (
    <Script
      id="chatwoot-sdk"
      strategy="lazyOnload"
      src="https://support.franchisetech.ro/packs/js/sdk.js"
      onLoad={onLoad}
    />
  );
}
