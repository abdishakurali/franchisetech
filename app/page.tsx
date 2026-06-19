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
import { JsonLd } from "@/components/marketing/JsonLd";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, faqJsonLd, SITE_URL } from "@/lib/marketing/seo";
import { MARKETING_KEYWORDS, localeAlternates } from "@/lib/marketing/site-locale";

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: [...MARKETING_KEYWORDS],
  alternates: localeAlternates("/"),
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "en",
    images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: "franchisetech owner dashboard" }],
  },
};

const painPoints = [
  {
    title: "Till doesn't match the drawer",
    text: "See expected cash, card totals, and difference at close — not a guess after service.",
  },
  {
    title: "Margins stay hidden",
    text: "Recipe costing shows cost per portion and gross margin before you change the menu.",
  },
  {
    title: "Stock surprises mid-shift",
    text: "Low-stock alerts and purchases in the same place as POS — fewer emergency runs.",
  },
  {
    title: "Locked-in POS contracts",
    text: "Browser-based POS with unlimited staff. Start on devices you already own.",
  },
];

const featureHighlights = [
  { title: "POS register", text: "Sell fast. Track cash and card. Close the till.", href: "/features/pos", image: "/showcase/pos-cart.png", path: "/app/pos" },
  { title: "Kitchen display", text: "Paid orders on a prep board — new to done.", href: "/features/kitchen-display", image: "/showcase/kitchen-display.png", path: "/app/kitchen" },
  { title: "Stock & purchases", text: "Suppliers, purchases, and levels together.", href: "/features/purchases-suppliers", image: "/showcase/stock-levels.png", path: "/app/stock" },
  { title: "Recipes & margins", text: "Cost per portion and gross margin.", href: "/features/recipe-costing", image: "/showcase/recipe-costing.png", path: "/app/recipes" },
  { title: "Daily reports", text: "Sales, till close, and tax-ready totals.", href: "/features/z-report", image: "/showcase/reports-dashboard.png", path: "/app" },
  { title: "Guided setup", text: "Checklist from first product to first sale.", href: "/features/setup-onboarding", image: "/showcase/setup-guide.png", path: "/app/setup-checklist" },
];

const industries = [
  { title: "Cafes", text: "Counter service and recipe margins.", href: "/industries/cafes", image: "/marketing/industry-cafe.png" },
  { title: "Restaurants", text: "Table service, kitchen, and staff.", href: "/industries/restaurants", image: "/marketing/industry-restaurant.png" },
  { title: "Takeaways", text: "Speed at the till, clear end-of-day.", href: "/industries/takeaways", image: "/showcase/pos-cart.png" },
  { title: "Food trucks", text: "Mobile POS after service.", href: "/industries/food-trucks", image: "/marketing/industry-food-truck.png" },
  { title: "Kitchen ops", text: "Wall-mounted display for prep teams.", href: "/features/kitchen-display", image: "/marketing/industry-kitchen.png" },
];

const steps = [
  { title: "Set up", text: "Products, payments, and staff — guided in-app." },
  { title: "Open till", text: "Start a session and sell from any device." },
  { title: "Sell & report", text: "Close the day with clear sales and stock." },
];

const faqs = [
  { question: "How does the 15-day trial work?", answer: "Full access with setup help — products, staff, payment methods, a test sale, and a dashboard walkthrough. No credit card to start." },
  { question: "Do I need special POS hardware?", answer: "No. Runs in the browser on laptop, tablet, or existing hardware. Receipt printers when you are ready." },
  { question: "Can I see margins on menu items?", answer: "Yes. Recipe costing links ingredients to sale price so you see cost per portion and gross margin before you change the menu." },
  { question: "Is there per-seat pricing?", answer: "No. Unlimited staff at no extra per-user cost." },
  { question: "Can I manage stock from the same system as POS?", answer: "Yes. Purchases, suppliers, and stock levels sit beside sales so owners see what is low before the next service." },
];

const dashboardBullets = [
  "Sales today and vs yesterday",
  "Till open / close and expected cash",
  "Top products and low-stock alerts",
  "Reports: VAT, margins, purchases",
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
          inLanguage: "en",
          description: DEFAULT_DESCRIPTION,
          url: SITE_URL,
          offers: { "@type": "Offer", price: "39", priceCurrency: "EUR" },
        }}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.08),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="max-w-xl">
            <SectionLabel>Cloud POS for food businesses</SectionLabel>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              Know what happened in your cafe today — not next month.
            </h1>
            <p className={`mt-5 ${marketingSubtext}`}>
              POS, kitchen display, stock, and daily reports in one workspace. No per-seat fees. No POS lock-in.
            </p>
            <CtaRow secondaryHref="/features" secondaryLabel="See features" />
            <p className="mt-5 text-sm text-slate-400">15-day assisted trial · Unlimited staff</p>
          </div>
          <div className="relative">
            <BrowserFrame
              src="/showcase/pos-cart.png"
              alt="franchisetech POS — product grid, cart, and charge"
              path="/app/pos"
              priority
            />
            <div className="absolute -bottom-6 -left-4 hidden w-[42%] overflow-hidden rounded-2xl border border-white/80 shadow-xl sm:block lg:-left-8">
              <Image
                src="/marketing/hero-cafe-pos.png"
                alt="Cafe owner using franchisetech on tablet"
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
          <SectionLabel>Owner pain points</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>Built around what keeps you up at night.</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {painPoints.map((item) => (
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
            <SectionLabel>Owner dashboard</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>Today at a glance.</h2>
            <p className={`mt-4 ${marketingSubtext}`}>
              The same screen owners open after service — sales, till, stock alerts, and reports in one place.
            </p>
            <ul className="mt-6 space-y-2.5">
              {dashboardBullets.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ProductScreenshot
            src="/showcase/reports-dashboard.png"
            alt="franchisetech owner dashboard showing Today at a glance, sales, till, and business reports"
            path="/app"
            caption="Dashboard — sales, till status, stock watch, and reports"
          />
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>Features</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>One workspace. Every workflow.</h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureHighlights.map((item) => (
            <Link key={item.href} href={item.href} className={`group overflow-hidden ${marketingCard}`}>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={`${item.title} — franchisetech${item.path}`}
                  width={640}
                  height={400}
                  className="h-full w-full object-contain object-top transition duration-300 group-hover:scale-[1.01]"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{item.path}</p>
                <h3 className="mt-1 font-medium text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>Industries</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>Built for how you serve food.</h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((item) => (
            <Link key={item.href} href={item.href} className={`group overflow-hidden ${marketingCard}`}>
              <div className="aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.title} — franchisetech`}
                  width={640}
                  height={400}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
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
          <SectionLabel>How it works</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>Live in three steps.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
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
            <SectionLabel>Partners</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Reseller or consultant? Grow with our network.
            </h2>
            <p className="mt-2 text-slate-500">We run the platform. You bring local sales and onboarding.</p>
          </div>
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-300"
          >
            Partner with us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Section>
        <div className="max-w-xl">
          <h2 className={marketingHeading}>Questions from owners</h2>
        </div>
        <div className="mt-10 max-w-3xl">
          <Faq items={faqs} />
        </div>
      </Section>

      <FinalCta />
    </MarketingShell>
  );
}
