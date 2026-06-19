"use client";

import { useEffect, useState } from "react";
import {
  APP_LOCALE_CHANGE_EVENT,
  defaultPosLocale,
  readPosLocalePreference,
  writePosLocalePreference,
  type PosLocale,
} from "@/lib/pos-i18n";

type Props = {
  orgIsRO?: boolean;
  className?: string;
};

export function AppLocaleSwitcher({ orgIsRO = false, className }: Props) {
  const fallback = defaultPosLocale(orgIsRO);
  const [locale, setLocale] = useState<PosLocale>(() => readPosLocalePreference(fallback));

  useEffect(() => {
    const sync = () => setLocale(readPosLocalePreference(fallback));
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, [fallback]);

  function select(next: PosLocale) {
    writePosLocalePreference(next);
    setLocale(next);
    window.dispatchEvent(new Event(APP_LOCALE_CHANGE_EVENT));
  }

  return (
    <div
      className={`inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold ${className ?? ""}`}
      role="group"
      aria-label="Language"
    >
      {(["en", "ro"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => select(code)}
          aria-pressed={locale === code}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            locale === code ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
