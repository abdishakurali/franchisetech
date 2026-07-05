"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaRow, FinalCta } from "@/components/marketing/MarketingCta";
import { Faq, Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { HeroVisualCollage } from "@/components/marketing/HeroVisualCollage";
import { HeroHeadline } from "@/components/marketing/HeroHeadline";
import { MarketingBrowserShot } from "@/components/marketing/MarketingBrowserShot";
import {
  marketingCard,
  marketingCtaPrimary,
  marketingHeading,
  marketingHeroBg,
  marketingHeroRadial,
  marketingSubtext,
} from "@/lib/marketing/tokens";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";
import { pricingPlans } from "@/lib/billing/plans";
import { HomeCompareStrip } from "@/components/marketing/HomeCompareStrip";
import { showcaseAssets } from "@/lib/marketing/showcase";
import { WhyOwnersChoose } from "@/components/marketing/WhyOwnersChoose";
import { PRIMARY_INDUSTRY_NAV } from "@/lib/marketing/industry-verticals";

export function HomePageContent() {
  const { t, locale } = useMarketingLocaleContext();
  const starterPrice = pricingPlans.find((p) => p.id === "starter")?.price ?? "€49";
  const proPrice = pricingPlans.find((p) => p.id === "pro")?.price ?? "€79";
  const multiPrice = pricingPlans.find((p) => p.id === "scale")?.price ?? "€109";

  const heroTrust = t.home.hero.trustSignals.map((s) => s.title);
  const trustChipDelays = [
    "marketing-hero-delay-5",
    "marketing-hero-delay-5",
    "marketing-hero-delay-6",
    "marketing-hero-delay-6",
  ] as const;

  return (
    <>
      {/* ── HERO: copy left, product right (one row on desktop) ─────── */}
      <section
        className={`relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pb-16 ${marketingHeroBg}`}
      >
        <div className={`pointer-events-none absolute inset-0 ${marketingHeroRadial}`} />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-10 xl:gap-14">
          <div className="w-full shrink-0 text-center lg:max-w-md lg:text-left xl:max-w-lg">
            <div className="marketing-hero-rise marketing-hero-delay-1">
              <SectionLabel>{t.home.hero.label}</SectionLabel>
            </div>
            <HeroHeadline
              before={t.home.hero.titleBefore ?? ""}
              highlight={t.home.hero.titleHighlight ?? t.home.hero.title}
              after={t.home.hero.titleAfter}
            />
            <p className={`marketing-hero-rise marketing-hero-delay-3 mt-4 ${marketingSubtext}`}>
              {t.home.hero.subtitle}
            </p>
            <div className="marketing-hero-rise marketing-hero-delay-3 mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {PRIMARY_INDUSTRY_NAV.map((item) => (
                <Link
                  key={item.slug}
                  href={item.path}
                  className="rounded-full border border-slate-200/90 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                >
                  {locale === "ro" ? item.labelRo : item.labelEn}
                </Link>
              ))}
            </div>
            <div className="marketing-hero-rise marketing-hero-delay-4 mt-7 lg:flex lg:flex-col lg:items-start">
              <CtaRow secondaryHref="/pricing" showDemo className="justify-center lg:justify-start" />
              <p className="mt-3 text-sm font-medium text-slate-600">{t.home.hero.socialProof}</p>
              <p className="mt-3 text-xs text-slate-500">{t.home.hero.trialNote}</p>
              <div className="mt-5 grid w-full max-w-md grid-cols-2 gap-2 justify-items-stretch sm:max-w-none lg:flex lg:max-w-none lg:flex-wrap lg:justify-start">
                {heroTrust.map((sig, i) => (
                  <span
                    key={sig}
                    className={`marketing-hero-rise ${trustChipDelays[i] ?? "marketing-hero-delay-6"} inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 lg:max-w-lg xl:max-w-xl">
            <HeroVisualCollage
              floorAlt={t.home.hero.tableFloorAlt}
              floorSrc={showcaseAssets.tableFloor.src}
              tableOrderAlt={t.home.hero.tableOrderAlt}
              tableOrderSrc={showcaseAssets.posTableOrder.src}
              dashboardSrc={showcaseAssets.ownerDashboard.src}
              dashboardAlt={t.home.hero.dashboardAlt ?? t.home.dashboard.alt}
              priority
            />
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ─────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-600">
              Integrări
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Funcționează cu platformele pe care le folosești deja
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
              Glovo se conectează automat, cu vânzările înregistrate separat, corect fiscal.
              Saga și ANAF — exporturile se generează automat.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { src: "/integrations/glovo.svg", alt: "Glovo", label: "Livrare", live: true },
              { src: "/integrations/bolt-food.svg", alt: "Bolt Food", label: "În curând", live: false },
              { src: "/integrations/tazz.webp", alt: "Tazz", label: "În curând", live: false },
              { src: "/integrations/saga.svg", alt: "Saga C", label: "Contabilitate", live: true },
              { src: "/integrations/anaf.svg", alt: "ANAF", label: "Fiscal", live: true },
            ].map((item) => (
              <div
                key={item.alt}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-5 transition ${
                  item.live
                    ? "border-slate-200 bg-white hover:border-blue-200"
                    : "border-dashed border-slate-200 bg-slate-50/60"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={100}
                  height={48}
                  className={`max-h-9 w-auto max-w-[100px] object-contain ${item.live ? "" : "opacity-50 grayscale"}`}
                />
                <span className={`text-xs font-medium ${item.live ? "text-slate-400" : "text-amber-600"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TILL PROOF ───────────────────────────────────────────────── */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <MarketingBrowserShot
            src={showcaseAssets.ownerDashboard.src}
            alt={t.home.dashboard.alt}
            path={showcaseAssets.ownerDashboard.path}
            priority
            chrome
          />
          <div>
            <SectionLabel>{t.home.dashboard.label}</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>{t.home.dashboard.title}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{t.home.dashboard.text}</p>
            <ul className="mt-6 space-y-3">
              {t.home.dashboard.bullets.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/features/z-report"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
            >
              {t.cta.learnMore} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── WHY OWNERS ───────────────────────────────────────────────── */}
      <Section tone="slate">
        <WhyOwnersChoose
          heading={t.whyOwners.heading}
          items={t.whyOwners.items}
          screenshotCaption={t.whyOwners.screenshotCaption}
        />
      </Section>

      <HomeCompareStrip />

      {/* ── 3 OUTCOMES (condensed) ───────────────────────────────────── */}
      <Section>
        <div className="mb-8 max-w-2xl">
          <SectionLabel>{t.home.pain.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.pain.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {t.home.outcomeCards.map((card) => (
            <a
              key={card.headline}
              href={card.href}
              className={`group flex flex-col overflow-hidden p-0 ${marketingCard}`}
            >
              <div className="overflow-hidden bg-slate-50">
                <Image
                  src={card.img}
                  alt={card.imgAlt}
                  width={640}
                  height={400}
                  className="w-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col gap-2 px-5 pb-5 pt-4">
                <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-700">
                  {card.headline}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">{card.body}</p>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* ── PAIN BEFORE / AFTER ──────────────────────────────────────── */}
      <Section tone="slate">
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`p-6 ${marketingCard}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {t.home.painStrip.beforeTitle}
            </h3>
            <ul className="mt-5 space-y-4">
              {t.home.painStrip.beforeItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`border-blue-100 bg-blue-50/50 p-6 ${marketingCard}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {t.home.painStrip.afterTitle}
            </h3>
            <ul className="mt-5 space-y-4">
              {t.home.painStrip.afterItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── 3 STEPS ──────────────────────────────────────────────────── */}
      <Section>
        <div className="mb-10 text-center">
          <SectionLabel>{t.home.steps.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.steps.title}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {t.home.steps.items.map((step, i) => (
            <div key={step.title} className={`p-6 text-center ${marketingCard}`}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PRICING STRIP ────────────────────────────────────────────── */}
      <Section tone="slate">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>{t.home.pricingStrip.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.pricingStrip.title}</h2>
          <p className={`mx-auto mt-3 max-w-2xl ${marketingSubtext}`}>
            {t.home.pricingStrip.subtitle}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { name: t.home.pricingStrip.starter, price: starterPrice },
              { name: t.home.pricingStrip.pro, price: proPrice },
              { name: t.home.pricingStrip.multi, price: multiPrice },
            ].map((plan) => (
              <div key={plan.name} className={`p-6 text-center ${marketingCard}`}>
                <p className="text-sm font-semibold text-slate-500">{plan.name}</p>
                <p className="mt-1 text-4xl font-bold tabular-nums text-slate-900">
                  {plan.price}
                </p>
                <p className="text-sm text-slate-500">{t.home.pricingStrip.month}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium text-slate-700">
            {t.home.pricingStrip.ownerDigest}
          </p>
          <Link
            href="/pricing"
            className={`mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition ${marketingCtaPrimary}`}
          >
            {t.home.pricingStrip.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Section>
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
