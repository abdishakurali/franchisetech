import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, PackagePlus, ReceiptText, ScanLine, ShoppingCart, WifiOff } from "lucide-react";
import { CTASection, MarketingShell, SectionLabel } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { featurePages, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages, localizeSeoPage } from "@/lib/marketing/i18n";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { isLeanPublicFeature } from "@/lib/product-scope";

const FEATURE_ICONS = { pos: ShoppingCart, "z-report": ReceiptText, offline: WifiOff, "setup-onboarding": PackagePlus, "qr-code-receipts": ScanLine } as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.featuresIndex.title,
    description: t.featuresIndex.description,
    keywords: marketingKeywords(locale),
    alternates: localeAlternates("/features", locale),
  };
}

export default async function FeaturesPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: t.seoPage.featuresBreadcrumb, item: `${SITE_URL}/features` }],
        }}
      />

      <section className="bg-gradient-to-b from-slate-50/80 to-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl text-center lg:text-left">
          <SectionLabel>{t.featuresIndex.heroLabel}</SectionLabel>
          <h1 className={`mx-auto mt-4 max-w-3xl lg:mx-0 ${marketingHeading}`}>{t.featuresIndex.heroTitle}</h1>
          <p className={`mx-auto mt-4 max-w-2xl lg:mx-0 ${marketingSubtext}`}>{t.featuresIndex.heroText}</p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {featurePages.filter((page) => isLeanPublicFeature(page.slug)).map((raw) => {
              const page = localizeSeoPage(raw, locale);
              return (
                <Link key={page.path} href={page.path} className={`group p-6 ${marketingCard}`}>
                  {(() => {
                    const Icon = FEATURE_ICONS[page.slug as keyof typeof FEATURE_ICONS] ?? CheckCircle;
                    return <Icon className="h-6 w-6 text-[#1a3ab8]" aria-hidden />;
                  })()}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#1a3ab8]">{page.eyebrow}</p>
                    <h2 className="mt-2 text-lg font-medium text-slate-900">{page.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">{page.description}</p>
                    <ul className="mt-4 space-y-2">
                      {page.bullets.slice(0, 3).map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm text-slate-700">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1a3ab8]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1a3ab8]">
                      {t.seoPage.viewFeature} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1a3ab8]">{t.featuresIndex.countryLabel}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{t.featuresIndex.countryTitle}</h2>
          <p className="mt-3 max-w-2xl text-slate-600">{t.featuresIndex.countryText}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.featuresIndex.countryCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs italic text-slate-500">
            {t.featuresIndex.countryDisclaimer}{" "}
            <Link href="/help" className="underline hover:text-slate-700">
              {t.featuresIndex.helpCentre}
            </Link>
          </p>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
