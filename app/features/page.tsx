import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Receipt } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { featurePages, SITE_URL } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "franchisetech Features for Food Businesses",
  description: "Explore franchisetech POS, stock management, recipe costing, Z-report, and food-safety record features for cafes and small food businesses.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Features", item: `${SITE_URL}/features` }] }} />

      {/* Hero */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Features</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Everything you need to run your food business</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">POS, stock, suppliers, purchases, recipes, reports, and records in one workspace. No per-seat pricing.</p>
        </div>
      </section>

      {/* Feature cards with images */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {featurePages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {page.image && (
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <Image
                      src={page.image}
                      alt={page.title}
                      width={800}
                      height={450}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-sm font-semibold text-blue-600">{page.eyebrow}</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">{page.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{page.description}</p>
                  <ul className="mt-4 space-y-2">
                    {page.bullets.slice(0, 3).map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{bullet}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    View feature <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROMANIA / FISCALNET FEATURE ── */}
      <section className="border-t border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Country-specific workflows</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Receipts and local settings</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Set up receipt rules, tax rates, payment methods, and daily close records only for the locations that need them. These tools stay optional and are enabled in settings.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🧾", title: "Fiscal receipts", body: "Receipt files or local printer workflow when configured." },
              { icon: "📊", title: "Tax rates by product", body: "Assign the right tax rate per product and keep sales reports clear." },
              { icon: "💳", title: "Payment code mapping", body: "Cash, card, online, voucher, and other payment types are mapped once in settings." },
              { icon: "📋", title: "Owner reconciliation", body: "Daily close, Z-report, and exports for accountant review." },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-2xl">{card.icon}</p>
                <h3 className="mt-3 font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500 italic">
            franchisetech supports configurable receipt workflows. Businesses remain responsible for their own legal, fiscal, and accountant review.{" "}
            <Link href="/help/romania-fiscalnet" className="underline hover:text-slate-700">Receipt setup guide →</Link>
          </p>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
