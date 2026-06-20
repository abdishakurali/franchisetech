import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CtaRow,
  Faq,
  FinalCta,
  MarketingShell,
  Section,
  SectionLabel,
} from "@/components/marketing/MarketingShell";
import { HeroVisualCollage } from "@/components/marketing/HeroVisualCollage";
import { IndustryTabs } from "@/components/marketing/IndustryTabs";
import { JsonLd } from "@/components/marketing/JsonLd";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { faqJsonLd, SITE_URL } from "@/lib/marketing/seo";
import { MARKETING_KEYWORDS, localeAlternates } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { pricingPlans } from "@/lib/billing/plans";
import { showcaseAssets } from "@/lib/marketing/showcase";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.home.meta.title,
    description: t.home.meta.description,
    keywords: [...MARKETING_KEYWORDS],
    alternates: localeAlternates("/"),
    openGraph: {
      title: t.home.meta.title,
      description: t.home.meta.description,
      url: SITE_URL,
      locale: marketingOpenGraphLocale(locale),
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: t.home.dashboard.alt }],
    },
  };
}

export default async function HomePage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const starterPrice = pricingPlans.find((p) => p.id === "starter")?.price ?? "€39";
  const proPrice = pricingPlans.find((p) => p.id === "pro")?.price ?? "€79";
  const teaserText = t.pricing.homeTeaser.text
    .replace("{starter}", starterPrice)
    .replace("{pro}", proPrice);

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "franchisetech",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: locale,
          description: t.home.meta.description,
          url: SITE_URL,
          offers: { "@type": "Offer", price: "39", priceCurrency: "EUR" },
        }}
      />
      <JsonLd data={faqJsonLd([...t.home.faq.items])} />

      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.08),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="max-w-xl">
            <SectionLabel>{t.home.hero.label}</SectionLabel>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              {t.home.hero.title}
            </h1>
            <p className={`mt-5 ${marketingSubtext}`}>{t.home.hero.subtitle}</p>
            <CtaRow secondaryHref="/pricing" secondaryLabel={t.pricing.homeTeaser.cta} />
            <p className="mt-5 text-sm text-slate-500">
              {teaserText}{" "}
              <Link href="/pricing" className="font-medium text-blue-600 hover:underline">
                {t.pricing.homeTeaser.cta}
              </Link>
            </p>
            <p className="mt-2 text-sm text-slate-400">{t.home.hero.trialNote}</p>
          </div>
          <HeroVisualCollage
            posSrc={showcaseAssets.posCart.src}
            posAlt={t.home.hero.posAlt}
            posPath={showcaseAssets.posCart.path}
            cafeSrc="/marketing/hero-cafe-pos.png"
            cafeAlt={t.home.hero.cafeAlt}
            kitchenSrc={showcaseAssets.kitchenDisplay.src}
            kitchenAlt={t.home.hero.kitchenAlt}
            kitchenPath={showcaseAssets.kitchenDisplay.path}
            priority
          />
        </div>
      </section>

      <Section>
        <IndustryTabs
          label={t.home.industries.label}
          title={t.home.industries.title}
          items={t.home.industries.items}
          getStarted={t.cta.getStarted}
          learnMore={t.cta.learnMore}
        />
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>{t.home.pain.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.pain.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className={`p-6 ${marketingCard}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t.home.painStrip.beforeTitle}</h3>
            <ul className="mt-4 space-y-3">
              {t.home.painStrip.beforeItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`border-blue-100 bg-blue-50/40 p-6 ${marketingCard}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">{t.home.painStrip.afterTitle}</h3>
            <ul className="mt-4 space-y-3">
              {t.home.painStrip.afterItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>{t.home.socialProof.label}</SectionLabel>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.home.socialProof.quotes.map((quote) => (
            <div key={quote.name} className={`flex flex-col p-6 ${marketingCard}`}>
              <p className="flex-1 text-sm leading-6 text-slate-600">&ldquo;{quote.quote}&rdquo;</p>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-900">{quote.name}</p>
                <p className="text-xs text-slate-500">{quote.business}</p>
                <p className="mt-2 text-xs font-semibold text-blue-600">{quote.metric}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-xl">
          <h2 className={marketingHeading}>{t.home.faq.title}</h2>
        </div>
        <div className="mt-10 max-w-3xl">
          <Faq items={t.home.faq.items} />
        </div>
      </Section>

      <FinalCta />
    </MarketingShell>
  );
}
