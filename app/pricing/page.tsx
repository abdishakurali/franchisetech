import type { Metadata } from "next";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PricingPlansSection } from "@/components/billing/PricingPlansSection";
import { SITE_URL } from "@/lib/marketing/seo";
import { pricingPlans } from "@/lib/billing/plans";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { marketFromMarketingLocale, pricingNotIncludedText } from "@/lib/billing/market";

export const metadata: Metadata = {
  title: "franchisetech Pricing",
  description: "Clear franchisetech pricing for small businesses that want a simple POS, product setup, staff control, and daily reports.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const locale = await getMarketingLocale();
  const market = marketFromMarketingLocale(locale);

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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Simple pricing
          </p>
          <h1 className="text-4xl font-bold text-slate-900">Clear pricing for small businesses that want control.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Choose a simple monthly plan. Setup is separate so your products, staff, payment methods, and first sale are configured properly.
          </p>
          <div className="mt-12 text-left">
            <PricingPlansSection variant="marketing" market={market} />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">What is not included yet</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{pricingNotIncludedText(market)}</p>
          <div className="mt-8 space-y-5">
            {[
              ["Do I need special hardware?", "No. You can start the trial on a browser, laptop, tablet, or existing device. Hardware can be reviewed later."],
              ["Can you set up my products?", "Yes. The setup fee includes product and category setup."],
              ["Can I cancel after the trial?", "Yes. The trial is 15 days. Payment starts only if you continue."],
              ["Is this for one shop or multiple shops?", "Starter and Pro are for one shop. Multi-location pricing is available for owners with 2+ shops."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Start with a 15-day assisted trial." />
    </MarketingShell>
  );
}
