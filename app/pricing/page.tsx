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
  const starterPrice = pricingPlans.find((p) => p.id === "starter")?.price ?? "€39";

  const heroStats = [
    t.pricing.heroStatFrom.replace("{price}", starterPrice),
    t.pricing.heroStatTrial,
    t.pricing.heroStatTill,
  ];

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "franchisetech",
          description: "Simple POS and business control for independent shops.",
          offers: {
            "@type": "Offer",
            price: String(pricingPlans[0].amountCents / 100),
            priceCurrency: pricingPlans[0].currency.toUpperCase(),
            url: `${SITE_URL}/pricing`,
          },
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {t.pricing.badge}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t.pricing.heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{t.pricing.heroText}</p>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat} className="rounded-2xl border border-slate-200 bg-white px-4 py-6">
                <p className="text-xl font-bold text-slate-900 sm:text-2xl">{stat}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/signup?plan=pro"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {t.cta.getStarted} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <PricingPlansSection
            variant="marketing"
            market={market}
            labels={{
              mainPlan: t.pricing.mainPlan,
              seeFeatures: t.pricing.seeFeatures,
              getStarted: t.pricing.getStarted,
              setupFeeNote: t.pricing.setupFeeNote,
              multiTitle: t.pricing.multiTitle,
              multiText: t.pricing.multiText,
            }}
          />
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
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
