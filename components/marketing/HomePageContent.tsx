"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutGrid, ShoppingBag, ChefHat, BarChart3, Monitor, MapPin } from "lucide-react";
import { CtaRow, FinalCta } from "@/components/marketing/MarketingCta";
import { Faq, Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { HeroVisualCollage } from "@/components/marketing/HeroVisualCollage";
import { IndustryTabs } from "@/components/marketing/IndustryTabs";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";
import { pricingPlans } from "@/lib/billing/plans";
import { HomeCompareStrip } from "@/components/marketing/HomeCompareStrip";
import { showcaseAssets } from "@/lib/marketing/showcase";

const panelImages = [
  "/marketing/pos-hero.png",
  "/marketing/recipe-costing-hero.png",
  "/marketing/reports-zreport.png",
];

export function HomePageContent() {
  const { t } = useMarketingLocaleContext();
  const starterPrice = pricingPlans.find((p) => p.id === "starter")?.price ?? "€49";
  const proPrice = pricingPlans.find((p) => p.id === "pro")?.price ?? "€79";
  const multiPrice = pricingPlans.find((p) => p.id === "multi_location")?.price ?? "€99";
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

      <Section tone="slate">
        <div className="text-center">
          <h2 className={marketingHeading}>{t.home.panels.heading}</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {t.home.panels.items.map((panel, i) => (
            <div key={i} className={`flex flex-col gap-4 overflow-hidden p-0 ${marketingCard}`}>
              <div className="overflow-hidden rounded-t-xl bg-slate-100">
                <Image
                  src={panelImages[i]}
                  alt={panel.label}
                  width={480}
                  height={300}
                  className="w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 px-5 pb-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">{panel.label}</span>
                <h3 className="text-base font-semibold text-slate-900">{panel.title}</h3>
                <p className="text-sm text-slate-600">{panel.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>{t.home.features.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.features.title}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.features.items.map((item, i) => {
            const icons = [LayoutGrid, Monitor, ShoppingBag, ChefHat, BarChart3, MapPin];
            const Icon = icons[i] ?? LayoutGrid;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col p-5 transition hover:border-blue-200 hover:shadow-sm ${marketingCard}`}
              >
                <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-blue-700">{item.title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-600">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                  {t.cta.learnMore} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-6">
          <Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
            {t.home.features.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </Section>

      <Section tone="slate">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>{t.home.pricingStrip.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.pricingStrip.title}</h2>
          <p className={`mx-auto mt-3 max-w-2xl ${marketingSubtext}`}>{t.home.pricingStrip.subtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { name: t.home.pricingStrip.starter, price: starterPrice },
              { name: t.home.pricingStrip.pro, price: proPrice },
              { name: t.home.pricingStrip.multi, price: multiPrice },
            ].map((plan) => (
              <div key={plan.name} className={`p-5 text-center ${marketingCard}`}>
                <p className="text-sm font-semibold text-slate-500">{plan.name}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{plan.price}</p>
                <p className="text-sm text-slate-500">/mo</p>
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t.home.pricingStrip.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

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
