import { ClaudeMarketingShell, DesignFeatures } from "@/components/marketing/ClaudeMarketing";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, PackagePlus, ReceiptText, ScanLine, ShoppingCart, WifiOff } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PersuasionHero } from "@/components/marketing/PersuasionHero";
import { marketingCard } from "@/lib/marketing/tokens";
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
  if (locale === "ro") return <ClaudeMarketingShell><DesignFeatures /></ClaudeMarketingShell>;
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

      <PersuasionHero eyebrow={t.featuresIndex.heroLabel} title={t.featuresIndex.heroTitle} subtitle={t.featuresIndex.heroText} />

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {featurePages.filter((page) => isLeanPublicFeature(page.slug)).map((raw) => {
              const page = localizeSeoPage(raw, locale);
              return (
                <Link key={page.path} href={page.path} className={`group p-6 ${marketingCard}`}>
                  {(() => {
                    const Icon = FEATURE_ICONS[page.slug as keyof typeof FEATURE_ICONS] ?? CheckCircle;
                    return <Icon className="h-6 w-6 text-[#165DFC]" aria-hidden />;
                  })()}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#165DFC]">{page.eyebrow}</p>
                    <h2 className="mt-2 text-lg font-medium text-[#0D0F0E]">{page.title}</h2>
                    <p className="mt-2 text-sm text-[#8F8F86]">{page.description}</p>
                    <ul className="mt-4 space-y-2">
                      {page.bullets.slice(0, 3).map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm text-[#5B5D57]">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#165DFC]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#165DFC]">
                      {t.seoPage.viewFeature} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[#DFDCD2] bg-[#F3F0E8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#165DFC]">{t.featuresIndex.countryLabel}</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">{t.featuresIndex.countryTitle}</h2>
          <p className="mt-3 max-w-2xl text-[#5B5D57]">{t.featuresIndex.countryText}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.featuresIndex.countryCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-[#DFDCD2] bg-white p-5">
                <h3 className="font-semibold text-[#0D0F0E]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{card.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs italic text-[#8F8F86]">
            {t.featuresIndex.countryDisclaimer}{" "}
            <Link href="/help" className="underline hover:text-[#5B5D57]">
              {t.featuresIndex.helpCentre}
            </Link>
          </p>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
