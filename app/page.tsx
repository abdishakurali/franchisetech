import type { Metadata } from "next";
import Image from "next/image";
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
import { BrowserFrame } from "@/components/marketing/DeviceFrames";
import { ProductScreenshot } from "@/components/marketing/ProductScreenshot";
import { FeatureShowcaseCard } from "@/components/marketing/FeatureShowcaseCard";
import { JsonLd } from "@/components/marketing/JsonLd";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { faqJsonLd, SITE_URL } from "@/lib/marketing/seo";
import { MARKETING_KEYWORDS, localeAlternates } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { showcaseAssets, type ShowcaseKey } from "@/lib/marketing/showcase";

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
      locale: locale === "ro" ? "ro_RO" : "en",
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: t.home.dashboard.alt }],
    },
  };
}

export default async function HomePage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);

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
            <CtaRow secondaryHref="/features" secondaryLabel={t.cta.seeFeatures} />
            <p className="mt-5 text-sm text-slate-400">{t.home.hero.trialNote}</p>
          </div>
          <div className="relative">
            <BrowserFrame
              src={showcaseAssets.posCart.src}
              alt={t.home.hero.posAlt}
              path={showcaseAssets.posCart.path}
              priority
            />
            <div className="absolute -bottom-6 -left-4 hidden w-[42%] overflow-hidden rounded-2xl border border-white/80 shadow-xl sm:block lg:-left-8">
              <Image
                src="/marketing/hero-cafe-pos.png"
                alt={t.home.hero.cafeAlt}
                width={400}
                height={500}
                className="aspect-[4/5] w-full object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>{t.home.pain.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.pain.title}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.home.pain.items.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>{t.home.dashboard.label}</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>{t.home.dashboard.title}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{t.home.dashboard.text}</p>
            <ul className="mt-6 space-y-2.5">
              {t.home.dashboard.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ProductScreenshot
            src={showcaseAssets.ownerDashboard.src}
            alt={t.home.dashboard.alt}
            path={showcaseAssets.ownerDashboard.path}
            caption={t.home.dashboard.caption}
          />
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>{t.home.features.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.features.title}</h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.features.items.map((item) => {
            const asset = showcaseAssets[item.showcase as ShowcaseKey];
            return (
              <Link key={item.href} href={item.href} className="block">
                <FeatureShowcaseCard
                  src={asset.src}
                  path={asset.path}
                  alt={`${item.title} — franchisetech${asset.path}`}
                  title={item.title}
                  text={item.text}
                  learnMore={t.cta.learnMore}
                />
              </Link>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>{t.home.industries.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.industries.title}</h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.industries.items.map((item) => (
            <Link key={item.href} href={item.href} className={`group overflow-hidden ${marketingCard}`}>
              <div className="aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.title} — franchisetech`}
                  width={640}
                  height={400}
                  className={`h-full w-full ${"imageType" in item && item.imageType === "screenshot" ? "object-contain object-top bg-slate-100" : "object-cover"} transition duration-500 group-hover:scale-[1.03]`}
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{item.text}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-xl">
          <SectionLabel>{t.home.steps.label}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.home.steps.title}</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.home.steps.items.map((step, i) => (
            <div key={step.title} className="relative pl-12">
              <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                {i + 1}
              </span>
              <h3 className="font-medium text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-y border-slate-200/60 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-lg">
            <SectionLabel>{t.home.partners.label}</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{t.home.partners.title}</h2>
            <p className="mt-2 text-slate-500">{t.home.partners.text}</p>
          </div>
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-300"
          >
            {t.cta.partnerWithUs} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Section>
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
