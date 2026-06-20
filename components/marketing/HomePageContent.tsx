"use client";

import Link from "next/link";
import { CtaRow, FinalCta } from "@/components/marketing/MarketingCta";
import { Faq, Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { HeroVisualCollage } from "@/components/marketing/HeroVisualCollage";
import { IndustryTabs } from "@/components/marketing/IndustryTabs";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";
import { pricingPlans } from "@/lib/billing/plans";
import { HomeCompareStrip } from "@/components/marketing/HomeCompareStrip";
import { showcaseAssets } from "@/lib/marketing/showcase";

export function HomePageContent() {
  const { t } = useMarketingLocaleContext();
  const starterPrice = pricingPlans.find((p) => p.id === "starter")?.price ?? "€39";
  const proPrice = pricingPlans.find((p) => p.id === "pro")?.price ?? "€79";
  const teaserText = t.pricing.homeTeaser.text
    .replace("{starter}", starterPrice)
    .replace("{pro}", proPrice);

  return (
    <>
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
        <IndustryTabs />
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

      <HomeCompareStrip />

      <Section tone="slate">
        <div className="max-w-xl">
          <h2 className={marketingHeading}>{t.home.faq.title}</h2>
        </div>
        <div className="mt-10 max-w-3xl">
          <Faq items={t.home.faq.items} />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
