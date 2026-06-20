"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { APP_LOCALE_CHANGE_EVENT, defaultPosLocale, type PosLocale } from "@/lib/pos-i18n";
import { appText, getAppText, type AppT } from "@/lib/app-i18n";
import { readAppLocaleUnified } from "@/lib/platform-locale";

type AppI18nContextValue = {
  locale: PosLocale;
  t: AppT;
};

const AppI18nContext = createContext<AppI18nContextValue | null>(null);

export function AppI18nProvider({
  orgIsRO = false,
  children,
}: {
  orgIsRO?: boolean;
  children: ReactNode;
}) {
  const fallback = defaultPosLocale(orgIsRO);
  const [locale, setLocale] = useState<PosLocale>(() => readAppLocaleUnified(orgIsRO) ?? fallback);

  useEffect(() => {
    const sync = () => setLocale(readAppLocaleUnified(orgIsRO));
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, [orgIsRO]);

  const value = useMemo(
    () => ({ locale, t: getAppText(locale) }),
    [locale],
  );

  return <AppI18nContext.Provider value={value}>{children}</AppI18nContext.Provider>;
}

export function useAppI18n(): AppI18nContextValue {
  const ctx = useContext(AppI18nContext);
  if (!ctx) throw new Error("useAppI18n must be used within AppI18nProvider");
  return ctx;
}

export { appText };
