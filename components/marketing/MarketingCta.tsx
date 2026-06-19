"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  APP_LOCALE_CHANGE_EVENT,
  POS_LOCALE_STORAGE_KEY,
  type PosLocale,
} from "@/lib/pos-i18n";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { Section } from "@/components/marketing/MarketingShell.primitives";

function readLocale(): PosLocale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(POS_LOCALE_STORAGE_KEY);
    if (raw === "en" || raw === "ro") return raw;
  } catch {
    /* ignore */
  }
  return "en";
}

export function CtaRow({
  secondaryHref = "/pricing",
  secondaryLabel,
}: {
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const [locale, setLocale] = useState<PosLocale>("en");
  const t = getMarketingMessages(locale);

  useEffect(() => {
    setLocale(readLocale());
    const sync = () => setLocale(readLocale());
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, []);

  const secondary = secondaryLabel ?? t.cta.seePricing;

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        {t.cta.startTrial} <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={secondaryHref}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        {secondary}
      </Link>
    </div>
  );
}

export function FinalCta({ title }: { title?: string }) {
  const [locale, setLocale] = useState<PosLocale>("en");
  const t = getMarketingMessages(locale);

  useEffect(() => {
    setLocale(readLocale());
    const sync = () => setLocale(readLocale());
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, []);

  return (
    <Section tone="slate">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title ?? t.cta.finalTitle}</h2>
        <p className="mt-3 text-slate-500">{t.cta.setupHelp}</p>
        <CtaRow />
      </div>
    </Section>
  );
}

export function CTASection({ title }: { title?: string }) {
  return <FinalCta title={title} />;
}
