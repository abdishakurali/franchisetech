"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  APP_LOCALE_CHANGE_EVENT,
  POS_LOCALE_STORAGE_KEY,
  writePosLocalePreference,
  type PosLocale,
} from "@/lib/pos-i18n";
import { MARKETING_LOCALE_COOKIE } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";

const LABELS: Record<PosLocale, string> = { en: "English", ro: "Română" };

function readInitialLocale(): PosLocale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(POS_LOCALE_STORAGE_KEY);
    if (raw === "en" || raw === "ro") return raw;
  } catch {
    /* ignore */
  }
  return "en";
}

function setLocaleCookie(locale: PosLocale) {
  document.cookie = `${MARKETING_LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

export function MarketingLocaleSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState<PosLocale>(readInitialLocale);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = getMarketingMessages(locale);

  useEffect(() => {
    const sync = () => setLocale(readInitialLocale());
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function select(next: PosLocale) {
    writePosLocalePreference(next);
    setLocaleCookie(next);
    setLocale(next);
    setOpen(false);
    window.dispatchEvent(new Event(APP_LOCALE_CHANGE_EVENT));
    document.documentElement.lang = next === "ro" ? "ro" : "en";
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.header.language}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="uppercase tracking-wide">{locale}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[9.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {(["en", "ro"] as const).map((code) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                type="button"
                onClick={() => select(code)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  locale === code ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{LABELS[code]}</span>
                <span className="text-xs uppercase text-slate-400">{code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
