import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_URL } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "franchisetech — Simple POS and Business Control",
  description:
    "A simple cloud POS and business dashboard for cafes, takeaways, convenience shops, and small retail businesses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "franchisetech — Simple POS and Business Control",
    description:
      "Sell products, manage staff, track daily sales, and understand your shop without expensive POS lock-in.",
    url: SITE_URL,
    images: [
      { url: "/marketing/pos-hero.png", width: 1200, height: 750, alt: "franchisetech POS register" },
    ],
  },
};

const ownerOutcomes = [
  "Sell products from a simple cloud POS",
  "Set up products, categories, customers, and staff",
  "See daily sales, cash/card totals, and basic reports",
  "Start with a 15-day assisted trial before paying monthly",
];

const dailyControl = [
  ["Run the till", "Staff can sell products and take payment without a complicated system."],
  ["Manage products", "Keep products, categories, prices, and customers clear in one place."],
  ["See daily numbers", "Check sales, payment totals, and activity without waiting for end-of-month reports."],
  ["Stay independent", "Start on a browser, laptop, tablet, or existing device. Hardware can be reviewed later."],
];

const fit = [
  "Cafes",
  "Takeaways",
  "Small retail shops",
  "Convenience shops",
  "Owner-operated multi-location businesses",
];

export default function HomePage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "franchisetech",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "Simple cloud POS and business dashboard for independent shops",
          url: SITE_URL,
          offers: { "@type": "Offer", price: "39", priceCurrency: "EUR" },
        }}
      />

      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Simple cloud POS</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Simple POS and business control for independent shops.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Sell products, manage staff, track daily sales, and understand your shop without expensive POS lock-in.
            </p>
            <ul className="mt-6 space-y-2">
              {ownerOutcomes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700">
                Start 15-day assisted trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
                See pricing
              </Link>
            </div>
            <p className="mt-3 text-sm text-slate-500">Setup help available. No hardware required to start.</p>
          </div>
          <div className="relative">
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <Image src="/marketing/pos-hero.png" alt="franchisetech POS register" width={1200} height={750} className="aspect-[16/10] w-full rounded-lg object-cover" priority />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden w-3/5 rounded-xl border border-slate-200 bg-white p-2 shadow-xl sm:block">
              <Image src="/marketing/dashboard-hero.png" alt="franchisetech daily dashboard" width={600} height={375} className="rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">What it solves</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Know what happened in your shop today.</h2>
            <p className="mt-3 text-slate-600">
              franchisetech is for owners who want a simple till, clear product setup, daily sales visibility, and less dependence on locked-in POS contracts.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {dailyControl.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Who it is for</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Built for local independent businesses.</h2>
            <p className="mt-3 text-slate-600">
              Start with the core system: POS, products, customers, staff, sales tracking, and reports. Extra modules can wait until customers ask for them.
            </p>
            <Link href="/pricing" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fit.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-800 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-950">Start with one assisted trial.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            We set up your products, categories, payment methods, staff, first sale test, and owner dashboard walkthrough.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup" className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">Start 15-day trial</Link>
            <Link href="/pricing" className="rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">See pricing</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
