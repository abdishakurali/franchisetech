import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PricingPlansSection } from "@/components/billing/PricingPlansSection";
import { PricingEmailSignup } from "@/components/marketing/PricingEmailSignup";
import { SITE_URL } from "@/lib/marketing/seo";
import { pricingPlans } from "@/lib/billing/plans";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { marketFromMarketingLocale, pricingNotIncludedText } from "@/lib/billing/market";

const demoUrl = process.env.NEXT_PUBLIC_DEMO_BOOKING_URL || null;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.pricing.title,
    description: t.pricing.description,
    alternates: { canonical: "/pricing" },
  };
}

export default async function PricingPage() {
  const locale = await getMarketingLocale();
  const market = marketFromMarketingLocale(locale);
  const t = getMarketingMessages(locale);

  const heroStats = [
    t.pricing.heroStatFrom,
    t.pricing.heroStatTrial,
    t.pricing.heroStatTill,
  ];

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "franchisetech",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: t.pricing.description,
          url: `${SITE_URL}/pricing`,
          offers: pricingPlans.filter((plan) => ["starter", "pro"].includes(plan.id)).map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: String(plan.amountCents / 100),
            priceCurrency: plan.currency.toUpperCase(),
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: String(plan.amountCents / 100),
              priceCurrency: plan.currency.toUpperCase(),
              unitText: "MONTH",
              billingDuration: "P1M",
            },
            url: `${SITE_URL}/signup?plan=${plan.id}`,
            availability: "https://schema.org/InStock",
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: t.pricing.faqs.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t.pricing.heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{t.pricing.heroText}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500">{heroStats.join(" · ")}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/signup?plan=starter"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a3ab8] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#152e93] sm:w-auto"
            >
              {t.cta.getStarted} <ArrowRight className="h-4 w-4" />
            </Link>
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                {t.cta.bookDemo}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <PricingPlansSection
            variant="marketing"
            market={market}
            locale={locale}
            labels={{
              mainPlan: t.pricing.mainPlan,
              seeFeatures: t.pricing.seeFeatures,
              getStarted: t.pricing.getStarted,
              freeSetupStrip: t.pricing.freeSetupStrip,
              setupFreeTitle: t.pricing.setupFreeTitle,
              setupFreeText: t.pricing.setupFreeText,
              multiTitle: t.pricing.multiTitle,
              multiText: t.pricing.multiText,
            }}
          />
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">{t.pricing.notIncludedTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{pricingNotIncludedText(market)}</p>
          <div className="mt-8 space-y-4">
            {t.pricing.faqs.map(([q, a]) => (
              <div key={q} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Suspense fallback={null}>
            <PricingEmailSignup
              title={t.pricing.embeddedSignupTitle}
              placeholder={t.pricing.embeddedSignupPlaceholder}
              getStarted={t.pricing.getStarted}
            />
          </Suspense>
        </div>
      </section>

      <CTASection title={t.cta.finalTitle} />
    </MarketingShell>
  );
}
