"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { marketingHtmlLang } from "@/lib/marketing/locale";
import { marketingLocaleOptions } from "@/lib/marketing/locale-client";
import { useMarketingMessages, useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import { getAppText } from "@/lib/app-i18n";
import {
  readAppLocaleUnified,
  writeAppLocale,
  writePlatformLocale,
} from "@/lib/platform-locale";
import type { PosLocale } from "@/lib/pos-i18n";
import { APP_LOCALE_CHANGE_EVENT } from "@/lib/pos-i18n";

const appLocaleOptions = [
  { code: "en" as const, flag: "🌐", label: "English" },
  { code: "ro" as const, flag: "🇷🇴", label: "Română" },
];

type Props = {
  /** Marketing header: en/ro/it. App shell: en/ro only (same dropdown UI). */
  scope?: "marketing" | "app";
  orgIsRO?: boolean;
  className?: string;
};

function marketingPathForLocale(code: MarketingLocale): string {
  const url = new URL(window.location.href);
  if (code === "en") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", code);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function PlatformLocaleSwitcher({ scope = "marketing", orgIsRO = false, className }: Props) {
  const router = useRouter();
  const marketingLocale = useMarketingLocale();
  const [open, setOpen] = useState(false);
  const [appLocale, setAppLocale] = useState<PosLocale>(() => readAppLocaleUnified(orgIsRO));
  const rootRef = useRef<HTMLDivElement>(null);

  const isApp = scope === "app";
  const locale = isApp ? appLocale : marketingLocale;
  const options = isApp ? appLocaleOptions : marketingLocaleOptions;
  const t = useMarketingMessages();
  const appT = getAppText(appLocale);
  const current = options.find((o) => o.code === locale) ?? options[0];

  useEffect(() => {
    const lang = isApp
      ? appLocale === "ro"
        ? "ro"
        : "en"
      : marketingHtmlLang(marketingLocale);
    document.documentElement.setAttribute("lang", lang);
  }, [isApp, appLocale, marketingLocale]);

  useEffect(() => {
    if (!isApp) return;
    const sync = () => setAppLocale(readAppLocaleUnified(orgIsRO));
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, [isApp, orgIsRO]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function select(code: string) {
    if (isApp) {
      writeAppLocale(code as PosLocale);
      setAppLocale(code as PosLocale);
      router.refresh();
    } else {
      writePlatformLocale(code as MarketingLocale);
      router.push(marketingPathForLocale(code as MarketingLocale));
    }
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={isApp ? appT.shell.language : t.header.language}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="text-base leading-none" aria-hidden>
          {current.flag}
        </span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="uppercase tracking-wide sm:hidden">{locale}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map(({ code, flag, label }) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                type="button"
                onClick={() => select(code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                  locale === code ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-base leading-none" aria-hidden>
                  {flag}
                </span>
                <span className="flex-1">{label}</span>
                <span className="text-xs uppercase text-slate-400">{code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
