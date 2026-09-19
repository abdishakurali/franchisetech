"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingMessages, useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import { MarketingBrand } from "@/components/marketing/MarketingBrand";
import { socialLinks } from "@/components/marketing/social";
import { PRIMARY_INDUSTRY_NAV } from "@/lib/marketing/industry-verticals";

export function MarketingFooterClient() {
  const t = useMarketingMessages();
  const locale = useMarketingLocale();
  const year = new Date().getFullYear();
  const copyright = t.footer.copyright.replace("{year}", String(year));

  const productLinks = [
    ["/features", t.footer.features],
    ["/pricing", t.footer.pricing],
    ["/resources/suppliers", t.footer.partners],
  ] as const;

  const industryLinks = PRIMARY_INDUSTRY_NAV.filter((item) => item.slug !== "restaurants").map((item) => [
    item.path,
    locale === "ro" ? item.labelRo : item.labelEn,
  ] as const);

  const supportLinks = [
    ["/help", t.footer.help],
    ["/resources", t.footer.resources],
    ["/industries/romania", t.footer.romania],
  ] as const;

  const legalLinks = [
    ["/privacy", t.footer.privacy],
    ["/terms", t.footer.terms],
    ["/legal-disclaimer", t.footer.legalDisclaimer],
  ] as const;

  return (
    <footer className="bg-card px-4 py-12 text-mid sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-border bg-background p-8 md:flex md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-foreground">{t.footer.getStartedTitle}</p>
            <p className="mt-2 text-sm">{t.footer.getStartedText}</p>
          </div>
          <Link
            href="/signup?plan=starter"
            className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-brass px-6 py-3 text-sm font-medium text-ink transition hover:bg-brass/90 md:mt-0"
            onClick={() =>
              captureClientEvent("marketing_cta_clicked", {
                cta_type: "primary",
                cta_location: "footer",
                cta_text: t.footer.getStartedCta,
                href: "/signup?plan=starter",
                plan: null,
              })
            }
          >
            {t.footer.getStartedCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 border-b border-border pb-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <div className="mb-4">
              <MarketingBrand />
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <FooterColumn title={t.footer.features} links={productLinks} />
          <FooterColumn title={t.footer.industries} links={industryLinks} />
          <FooterColumn title={t.footer.help} links={supportLinks} />
          <FooterColumn title={t.footer.company} links={legalLinks} />
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">{copyright}</p>
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {t.footer.sslSecured}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {t.footer.secureCheckout}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
      <div className="space-y-2 text-sm">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="block text-mid hover:text-foreground">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
