"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultPosLocale, type PosLocale } from "@/lib/pos-i18n";
import { appText, getAppText, type AppT } from "@/lib/app-i18n";

type AppI18nContextValue = {
  locale: PosLocale;
  t: AppT;
};

const AppI18nContext = createContext<AppI18nContextValue | null>(null);

export function AppI18nProvider({
  orgIsRO = false,
  initialLocale,
  children,
}: {
  orgIsRO?: boolean;
  initialLocale?: PosLocale;
  children: ReactNode;
}) {
  const locale = initialLocale ?? defaultPosLocale(orgIsRO);

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
