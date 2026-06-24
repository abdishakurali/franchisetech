"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  defaultPosLocale,
  posText,
  type PosLocale,
} from "@/lib/pos-i18n";

export type PosT = (typeof posText)[PosLocale];

type PosI18nContextValue = {
  locale: PosLocale;
  t: PosT;
  setLocale: (next: PosLocale) => void;
};

const PosI18nContext = createContext<PosI18nContextValue | null>(null);

export function PosI18nProvider({
  orgIsRO,
  initialLocale,
  children,
}: {
  orgIsRO: boolean;
  initialLocale?: PosLocale;
  children: ReactNode;
}) {
  const resolved = initialLocale ?? defaultPosLocale(orgIsRO);
  const [overrideLocale, setOverrideLocale] = useState<PosLocale | null>(null);
  const locale = overrideLocale ?? resolved;
  const setLocale = (next: PosLocale) => setOverrideLocale(next);
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
