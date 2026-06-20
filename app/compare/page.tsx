import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { getCompetitorBrand } from "@/lib/marketing/competitor-brands";
import {
  breadcrumbSchema,
  comparisonPages,
  comparisonsByMarket,
  faqJsonLd,
  seoMeta,
  SITE_URL,
} from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";

const HUB_FAQS = [
  {
    question: "What is the best POS alternative in Romania?",
    answer:
      "It depends on your priority: invoicing (SmartBill/Saga), payments hardware (Square/SumUp class), or daily operations (POS + stock + recipes + till close). franchisetech targets the last — compare honestly on our SmartBill, Saga, RezoSoft, and Expressoft pages.",
  },
  {
    question: "Can I switch POS without losing my fiscal setup?",
    answer:
      "FiscalNet and fiscal printer setup stay on your till PC. Run a parallel trial, verify receipts with your accountant, then migrate products and workflows — do not assume automatic migration from another vendor.",
  },
  {
    question: "Does franchisetech replace my accountant software?",
    answer:
      "Not necessarily. Many operators keep invoicing/accounting tools and use franchisetech for daily POS, stock, recipes, and Z-style till close. Professional tax advice remains your responsibility.",
  },
];

export async function generateMetadata() {
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  return seoMeta({
    locale,
    path: "/compare",
    title: isRo
      ? "Comparații POS România — SmartBill, Saga, RezoSoft | franchisetech"
      : "Compare POS & restaurant software — Square, SmartBill, Saga | franchisetech",
    description: isRo
      ? "Comparații oneste franchisetech vs SmartBill, Saga, RezoSoft, Expressoft, hePOS și altele — POS, stoc, rețete, FiscalNet și raport Z."
      : "Honest comparisons: franchisetech vs Square, SumUp, Lightspeed, SmartBill, Saga, and Romanian restaurant POS options.",
  });
}

function CompareCard({
  slug,
  competitor,
  path,
  description,
  market,
}: {
  slug: string;
  competitor: string;
  path: string;
  description: string;
  market: string;
}) {
  const brand = getCompetitorBrand(slug);
  return (
    <Link
      href={path}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {brand ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
              <Image src={brand.logoSrc} alt="" width={48} height={48} className="h-full w-full object-contain" />
            </div>
          ) : null}
          <h2 className="text-lg font-semibold text-slate-950 group-hover:text-blue-700">
            franchisetech vs {competitor}
          </h2>
        </div>
        {market === "ro" ? (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">RO</span>
        ) : null}
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
        Read comparison <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default async function CompareHubPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const roPages = comparisonsByMarket("ro");
  const globalPages = comparisonsByMarket("global");

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(HUB_FAQS)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "franchisetech comparisons",
          url: `${SITE_URL}/compare`,
          description: "POS and restaurant software comparisons for Romania and international markets.",
          hasPart: comparisonPages.map((p) => ({
            "@type": "WebPage",
            name: p.metaTitle,
            url: `${SITE_URL}${p.path}`,
          })),
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {locale === "ro" ? "Comparații" : "Compare"}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {locale === "ro"
              ? "Comparații POS pentru restaurante și cafenele"
              : "Compare franchisetech with other POS and operations tools"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            {locale === "ro"
              ? "Evaluări oneste — nu vindem hardware de plăți. Vă ajutăm să vedeți când franchisetech (casă + stoc + rețete + raport Z) are sens față de facturare, POS local sau terminale de card."
              : "Honest evaluations — we do not sell payment terminals. See when franchisetech (POS + stock + recipes + till close) fits vs payments-first or invoicing-first tools."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t.cta.startTrial}
            </Link>
            <Link
              href="/resources/choose-pos-romania"
              className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {locale === "ro" ? "Checklist alegere POS" : "POS selection checklist"}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-950">
            {locale === "ro" ? "🇷🇴 România — alternative POS restaurant" : "🇷🇴 Romania — restaurant POS alternatives"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {locale === "ro"
              ? "Căutări frecvente: alternativă SmartBill, Saga POS, RezoSoft, Expressoft."
              : "Common searches: SmartBill alternative, Saga POS, RezoSoft, Expressoft for restaurants."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roPages.map((p) => (
              <CompareCard
                key={p.slug}
                slug={p.slug}
                competitor={p.competitor}
                path={p.path}
                description={p.description}
                market={p.market}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-950">
            {locale === "ro" ? "Internațional — plăți și POS global" : "International — payments & global POS"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {globalPages.map((p) => (
              <CompareCard
                key={p.slug}
                slug={p.slug}
                competitor={p.competitor}
                path={p.path}
                description={p.description}
                market={p.market}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-slate-950">FAQ</h2>
          <dl className="mt-6 space-y-6">
            {HUB_FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-slate-900">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
