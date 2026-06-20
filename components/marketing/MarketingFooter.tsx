"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import { MarketingBrand } from "@/components/marketing/MarketingBrand";
import { socialLinks } from "@/components/marketing/social";

export function MarketingFooterClient() {
  const locale = useMarketingLocale();
  const t = getMarketingMessages(locale);

  const productLinks = [
    ["/features", t.footer.features],
    ["/pricing", t.footer.pricing],
    ["/partners", t.footer.partners],
  ] as const;

  const supportLinks = [
    ["/help", t.footer.help],
    ["/resources", t.footer.resources],
  ] as const;

  const legalLinks = [
    ["/privacy", t.footer.privacy],
    ["/terms", t.footer.terms],
  ] as const;

  return (
    <footer className="bg-slate-950 px-4 py-12 text-slate-400 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 md:flex md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-white">{t.footer.getStartedTitle}</p>
            <p className="mt-2 text-sm">{t.footer.getStartedText}</p>
          </div>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 md:mt-0"
          >
            {t.footer.getStartedCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-4">
              <MarketingBrand variant="footer" />
            </div>
            <p className="max-w-sm text-sm">{t.footer.tagline}</p>
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
          <FooterColumn title={t.footer.features} links={productLinks} />
          <FooterColumn title={t.footer.help} links={supportLinks} />
          <FooterColumn title={t.footer.company} links={legalLinks} />
        </div>
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
