"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  APP_LOCALE_CHANGE_EVENT,
  POS_LOCALE_STORAGE_KEY,
  type PosLocale,
} from "@/lib/pos-i18n";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { socialLinks } from "@/components/marketing/social";

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

export function MarketingFooterClient() {
  const [locale, setLocale] = useState<PosLocale>(readLocale);
  const t = getMarketingMessages(locale);

  useEffect(() => {
    const sync = () => setLocale(readLocale());
    window.addEventListener(APP_LOCALE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_LOCALE_CHANGE_EVENT, sync);
  }, []);

  const featureLinks = [
    ["/features/pos", t.footer.featureLinks.pos],
    ["/features/kitchen-display", t.footer.featureLinks.kitchen],
    ["/features/stock-management", t.footer.featureLinks.stock],
    ["/features/recipe-costing", t.footer.featureLinks.recipes],
    ["/features/z-report", t.footer.featureLinks.zreport],
    ["/features/purchases-suppliers", t.footer.featureLinks.purchases],
  ] as const;

  const industryLinks = [
    ["/industries/cafes", t.footer.industryLinks.cafes],
    ["/industries/restaurants", t.footer.industryLinks.restaurants],
    ["/industries/takeaways", t.footer.industryLinks.takeaways],
    ["/industries/food-trucks", t.footer.industryLinks.foodTrucks],
    ["/industries/health-bars", t.footer.industryLinks.healthBars],
  ] as const;

  const companyLinks = [
    ["/partners", t.footer.partners],
    ["/pricing", t.footer.pricing],
    ["/resources", t.footer.resources],
    ["/help", t.footer.help],
    ["/privacy", t.footer.privacy],
    ["/terms", t.footer.terms],
  ] as const;

  return (
    <footer className="bg-slate-950 px-4 py-12 text-slate-400 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className="h-9 w-9 shrink-0 rounded-lg" />
              <span className="text-lg font-semibold tracking-tight">franchisetech</span>
            </Link>
          </div>
          <p className="max-w-sm text-sm">{t.footer.tagline}</p>
          <p className="mt-4 max-w-sm text-xs">{t.footer.subtagline}</p>
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map(([href, label, Icon]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`franchisetech on ${label}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition-colors hover:border-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <FooterColumn title={t.footer.features} links={featureLinks} />
        <FooterColumn title={t.footer.industries} links={industryLinks} />
        <FooterColumn title={t.footer.company} links={companyLinks} />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-white">{title}</p>
      <div className="space-y-2 text-sm">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="block hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
