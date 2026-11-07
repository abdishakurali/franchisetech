"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CONSENT_EVENT, CONSENT_OPEN_EVENT, openConsentSettings, readConsent, writeConsent, type Consent } from "@/lib/consent";
import { MARKETING_LOCALE_COOKIE } from "@/lib/marketing/locale";

// The POS, accountant and partner apps are work screens: no banner on top of
// a till. Without a choice there, analytics stay in "necessary" mode.
const NO_BANNER = /^\/(app|accountant|partner-dashboard|onboarding)(\/|$)/;

const copy = {
  ro: {
    text: "Folosim cookie-uri strict necesare ca site-ul să funcționeze. Cu acordul dumneavoastră folosim și cookie-uri de statistici (PostHog, DataFast), ca să vedem ce pagini sunt utile. Puteți schimba alegerea oricând din subsolul paginii.",
    accept: "Accept toate",
    reject: "Doar necesare",
    policy: "Politica de cookie-uri",
    label: "Acord pentru cookie-uri",
  },
  en: {
    text: "We use strictly necessary cookies so the site works. With your consent we also use analytics cookies (PostHog, DataFast) to see which pages are useful. You can change this at any time from the page footer.",
    accept: "Accept all",
    reject: "Necessary only",
    policy: "Cookie Policy",
    label: "Cookie consent",
  },
} as const;

function pageLocale(pathname: string): "ro" | "en" {
  if (pathname === "/odoo" || pathname === "/imprint") return "en";
  if (pathname.startsWith("/odoo/ro")) return "ro";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${MARKETING_LOCALE_COOKIE}=(en|ro)`));
  return match?.[1] === "en" ? "en" : "ro";
}

export type ThirdPartyIds = { gaId?: string; metaPixelId?: string; linkedinPartnerId?: string };

// "unset" before hydration, so the server and the first client render match.
type ConsentSnapshot = Consent | "none" | "unset";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

export function CookieConsent({ ids }: { ids: ThirdPartyIds }) {
  const pathname = usePathname() ?? "/";
  const snapshot = useSyncExternalStore<ConsentSnapshot>(subscribe, () => readConsent() ?? "none", () => "unset");
  const consent = snapshot === "all" || snapshot === "necessary" ? snapshot : null;
  const [reopened, setReopened] = useState(false);
  const open = reopened || (snapshot === "none" && !NO_BANNER.test(pathname));

  useEffect(() => {
    const onOpen = () => setReopened(true);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  function choose(value: Consent) {
    writeConsent(value);
    setReopened(false);
    // Scripts already loaded cannot be unloaded; a reload drops them.
    if (value === "necessary" && consent === "all") window.location.reload();
  }

  const t = copy[open ? pageLocale(pathname) : "ro"];
  return (
    <>
      {consent === "all" ? <AnalyticsScripts ids={ids} /> : null}
      {open ? (
        <div role="dialog" aria-modal="false" aria-label={t.label} lang={open ? pageLocale(pathname) : "ro"} className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 text-sm leading-6 text-[#2b2b28] shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:gap-5">
            <p className="flex-1">
              {t.text}{" "}
              <Link href="/cookies" className="font-medium underline underline-offset-2">{t.policy}</Link>.
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => choose("necessary")} className="min-h-11 flex-1 rounded-md border border-black/20 px-4 font-semibold text-[#0D0F0E] sm:flex-none">
                {t.reject}
              </button>
              <button type="button" onClick={() => choose("all")} className="min-h-11 flex-1 rounded-md bg-[#0D0F0E] px-4 font-semibold text-white sm:flex-none">
                {t.accept}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Third-party analytics, loaded only after "Accept all". */
function AnalyticsScripts({ ids }: { ids: ThirdPartyIds }) {
  return (
    <>
      <Script strategy="afterInteractive" data-website-id="dfid_eGuCOapGCwiDn1MuvbIi1" data-domain="franchisetech.ro" src="https://datafa.st/js/script.cookieless.js" />
      {ids.gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ids.gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ids.gaId}');
          `}</Script>
        </>
      ) : null}
      {ids.metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${ids.metaPixelId}');
          fbq('track','PageView');
        `}</Script>
      ) : null}
      {ids.linkedinPartnerId ? (
        <Script id="linkedin-insight" strategy="afterInteractive">{`
          _linkedin_partner_id="${ids.linkedinPartnerId}";
          window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
          var b=document.createElement("script");b.type="text/javascript";b.async=true;
          b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b,s)})(window.lintrk);
        `}</Script>
      ) : null}
    </>
  );
}

export function CookieSettingsButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      {children}
    </button>
  );
}
