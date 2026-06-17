"use client";
import Script from "next/script";

export function MarketingChatwoot() {
  return (
    <>
      <Script
        id="chatwoot-settings-marketing"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `window.chatwootSettings = { position: "right", type: "standard", hideMessageBubble: false };`,
        }}
      />
      <Script
        id="chatwoot-sdk-marketing"
        strategy="lazyOnload"
        src="https://support.franchisetech.ro/packs/js/sdk.js"
        onLoad={() => {
          (window as Window & { chatwootSDK?: { run: (opts: object) => void } }).chatwootSDK?.run({
            websiteToken: "2A3tx1XLTJ9DSvm8xdzzyNkV",
            baseUrl: "https://support.franchisetech.ro",
          });
        }}
      />
    </>
  );
}
