"use client";

import { useEffect, useState } from "react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { readMarketingLocaleClient, MARKETING_LOCALE_CHANGE_EVENT } from "@/lib/marketing/locale-client";

function readLocale(): MarketingLocale {
  if (typeof window === "undefined") return "en";
  return readMarketingLocaleClient();
}

export function useMarketingLocale(): MarketingLocale {
  const [locale, setLocale] = useState<MarketingLocale>(readLocale);

  useEffect(() => {
    const sync = () => setLocale(readMarketingLocaleClient());
    window.addEventListener(MARKETING_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(MARKETING_LOCALE_CHANGE_EVENT, sync);
  }, []);

  return locale;
}
