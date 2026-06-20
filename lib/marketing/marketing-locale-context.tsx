"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import type { MarketingMessages } from "@/lib/marketing/i18n/en";
import {
  MARKETING_LOCALE_CHANGE_EVENT,
  readMarketingLocaleClient,
} from "@/lib/marketing/locale-client";

type MarketingLocaleContextValue = {
  locale: MarketingLocale;
  t: MarketingMessages;
};

const MarketingLocaleContext = createContext<MarketingLocaleContextValue | null>(null);

export function MarketingLocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: MarketingLocale;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<MarketingLocale>(initialLocale);

  useEffect(() => {
    const sync = () => setLocale(readMarketingLocaleClient());
    window.addEventListener(MARKETING_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(MARKETING_LOCALE_CHANGE_EVENT, sync);
  }, []);

  const value = useMemo(
    () => ({ locale, t: getMarketingMessages(locale) }),
    [locale],
  );

  return (
    <MarketingLocaleContext.Provider value={value}>
      {children}
    </MarketingLocaleContext.Provider>
  );
}

export function useMarketingLocaleContext(): MarketingLocaleContextValue {
  const ctx = useContext(MarketingLocaleContext);
  if (!ctx) {
    const locale = typeof window === "undefined" ? "en" : readMarketingLocaleClient();
    return { locale, t: getMarketingMessages(locale) };
  }
  return ctx;
}
