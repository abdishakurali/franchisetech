"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  APP_LOCALE_CHANGE_EVENT,
  defaultPosLocale,
  posText,
  readPosLocalePreference,
  type PosLocale,
} from "@/lib/pos-i18n";
import { writeAppLocale } from "@/lib/platform-locale";

export type PosT = (typeof posText)[PosLocale];

type PosI18nContextValue = {
  locale: PosLocale;
  t: PosT;
  setLocale: (next: PosLocale) => void;
};

const PosI18nContext = createContext<PosI18nContextValue | null>(null);

export function PosI18nProvider({ orgIsRO, children }: { orgIsRO: boolean; children: ReactNode }) {
  const fallback = defaultPosLocale(orgIsRO);
  const [locale, setLocaleState] = useState<PosLocale>(() => readPosLocalePreference(fallback));

  useEffect(() => {
    const sync = () => setLocaleState(readPosLocalePreference(fallback));
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, [fallback]);

  const setLocale = (next: PosLocale) => {
    writeAppLocale(next);
    setLocaleState(next);
  };
  const t = posText[locale];
  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t]);
  return <PosI18nContext.Provider value={value}>{children}</PosI18nContext.Provider>;
}

export function usePosI18n(): PosI18nContextValue {
  const ctx = useContext(PosI18nContext);
  if (!ctx) throw new Error("usePosI18n must be used within PosI18nProvider");
  return ctx;
}

export function posIntlLocale(locale: PosLocale): string {
  return locale === "ro" ? "ro-RO" : "en-IE";
}
