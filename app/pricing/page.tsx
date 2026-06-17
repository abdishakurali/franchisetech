import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_URL } from "@/lib/marketing/seo";
import { pricingPlans } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "franchisetech Pricing",
  description: "Clear franchisetech pricing for small businesses that want a simple POS, product setup, staff control, and daily reports.",
  alternates: { canonical: "/pricing" },
};

// Public pricing page now reads from the same central config used by checkout and
// the in-app billing page — prices can never drift out of sync again.
const publicPlans = pricingPlans.filter((p) => p.id !== "multi_location");

export default function PricingPage() {
  return (
    <MarketingShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name: "franchisetech", description: "Simple POS and business control for independent shops.", offers: { "@type": "Offer", price: String(pricingPlans[0].amountCents / 100), priceCurrency: pricingPlans[0].currency.toUpperCase(), url: `${SITE_URL}/pricing` } }} />
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50">Simple pricing</Badge>
          <h1 className="text-4xl font-bold text-slate-900">Clear pricing for small businesses that want control.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Choose a simple monthly plan. Setup is separate so your products, staff, payment methods, and first sale are configured properly.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {publicPlans.map((plan) => (
              <div key={plan.id} className={`relative rounded-2xl border-2 p-8 text-left ${plan.highlighted ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}>
                {plan.highlighted && <Badge className="absolute right-4 top-4 border-0 bg-blue-600 text-white hover:bg-blue-600">Main plan</Badge>}
                <p className={`mb-2 text-sm font-semibold uppercase tracking-wide ${plan.highlighted ? "text-blue-700" : "text-slate-500"}`}>{plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}</p>
                <p className="mb-1 text-4xl font-bold text-slate-900">{plan.price}</p>
                <p className="mb-4 text-sm text-slate-500">{plan.cadence.replace("/", "per ")}</p>
                <p className="mb-6 text-sm leading-6 text-slate-600">{plan.description}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"><Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Start {plan.id.charAt(0).toUpperCase() + plan.id.slice(1)} trial</Button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-950">Setup — €199 one-time</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Good setup saves time and prevents mistakes. We configure the basics before your team starts using it.</p>
            <ul className="mt-6 space-y-3">
              {["Product/category setup", "Staff setup", "Payment method setup", "First sale test", "Training", "Dashboard walkthrough"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 className="h-4 w-4 text-blue-500" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-950">Multi-location</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">For owners with 2+ shops or a second location opening soon.</p>
            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <p className="text-3xl font-bold text-slate-950">
                {pricingPlans.find((p) => p.id === "multi_location")?.price ?? "€99"}/month
              </p>
              <p className="mt-3 text-sm text-slate-600">Everything in Pro, multiple locations, central reporting, FiscalNet integration.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">What is not included yet</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Hardware setup, cash drawers, fiscal integrations, accounting integrations, online ordering, loyalty, advanced inventory, and table service are not part of the core package.
          </p>
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
