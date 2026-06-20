"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { marketingHtmlLang } from "@/lib/marketing/locale";
import { marketingLocaleOptions, writeMarketingLocaleClient } from "@/lib/marketing/locale-client";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { useMarketingLocale } from "@/lib/marketing/use-marketing-locale";

export function MarketingLocaleSwitcher() {
  const router = useRouter();
  const locale = useMarketingLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = getMarketingMessages(locale);
  const current = marketingLocaleOptions.find((o) => o.code === locale) ?? marketingLocaleOptions[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function select(next: MarketingLocale) {
    writeMarketingLocaleClient(next);
    setOpen(false);
    document.documentElement.lang = marketingHtmlLang(next);
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
          {marketingLocaleOptions.map(({ code, flag, label }) => (
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
