import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CompareBrandLogosLabeled } from "@/components/marketing/CompareBrandLogos";
import { competitorLogoForOg } from "@/lib/marketing/competitor-brands";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import {
  breadcrumbSchema,
  comparisonPages,
  faqJsonLd,
  findPage,
  pageMetadata,
  SITE_URL,
} from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import {
  compareSignupHref,
  compareUi,
  localizeComparisonPage,
} from "@/lib/marketing/compare-locale";
import { CompareStickyTrialBar } from "@/components/marketing/CompareStickyTrialBar";

export function generateStaticParams() {
  return comparisonPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const page = findPage(comparisonPages, (await params).slug);
  if (!page) return {};
  return pageMetadata(
    { metaTitle: page.metaTitle, description: page.description, path: page.path },
    locale,
  );
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const ui = compareUi(locale);
  const raw = findPage(comparisonPages, (await params).slug);
  if (!raw) notFound();
  const page = localizeComparisonPage(raw, locale);

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: ui.breadcrumbHome, path: "/" },
          { name: ui.breadcrumbCompare, path: "/compare" },
          { name: `vs ${page.competitor}`, path: page.path },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.metaTitle,
          description: page.description,
          url: `${SITE_URL}${page.path}`,
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: `${SITE_URL}${competitorLogoForOg(page.slug)}`,
            name: `${page.competitor} logo comparison`,
          },
          isPartOf: { "@type": "WebSite", name: "franchisetech", url: SITE_URL },
        }}
      />

      <section className="relative overflow-hidden bg-[#0D0F0E] px-4 py-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_78%_0%,rgba(22,93,252,0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl">
          <Link href="/compare" className="text-sm font-medium text-[#5B9CFF] hover:underline">
            ← {ui.allComparisons}
          </Link>
          <div className="mt-6">
            <CompareBrandLogosLabeled competitorSlug={page.slug} />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[#5B9CFF]">
            {page.market === "ro" ? ui.comparisonRo : ui.comparison}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[#FAF8F4] sm:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-[#FAF8F4]/72">{page.intro}</p>
          <p className="mt-4 max-w-3xl rounded-[10px] border border-[#5B9CFF]/25 bg-white/5 px-4 py-3 text-sm leading-6 text-[#FAF8F4]/90">
            {page.betterFor}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={compareSignupHref(page.slug, locale)}
              className="rounded-[10px] bg-[#165DFC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3E7BFF]"
            >
              {t.cta.startTrial}
            </Link>
            <Link
              href="/pricing"
              className="rounded-[10px] border border-white/24 px-5 py-3 text-sm font-semibold text-[#FAF8F4] hover:border-white"
            >
              {t.cta.seePricing}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#DFDCD2] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0D0F0E]">franchisetech</h2>
            <ul className="mt-4 space-y-2">
              {page.franchisetechStrengths.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[#5B5D57]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00A63D]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#DFDCD2] bg-[#F3F0E8] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F0E]">{page.competitor}</h2>
            <ul className="mt-4 space-y-2">
              {page.competitorStrengths.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[#5B5D57]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8F8F86]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-x-auto">
          <div className="min-w-[32rem] overflow-hidden rounded-2xl border border-[#DFDCD2] bg-white">
            <div className="grid grid-cols-3 bg-[#F3F0E8] px-4 py-3 text-sm font-semibold text-[#0D0F0E]">
              <span>{ui.tableArea}</span>
              <span>{ui.tableFranchisetech}</span>
              <span>{page.competitor}</span>
            </div>
            {page.rows.map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-3 gap-3 border-t border-[#DFDCD2] px-4 py-4 text-sm"
              >
                <strong className="pr-2 text-[#0D0F0E]">{row[0]}</strong>
                <span className="text-[#5B5D57]">{row[1]}</span>
                <span className="text-[#5B5D57]">{row[2]}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-6xl text-xs text-[#8F8F86]">{ui.disclaimer}</p>
      </section>

      {page.sections.length > 0 ? (
        <section className="bg-[#F3F0E8] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-10">
            {page.sections.map((section) => (
              <article key={section.title}>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0D0F0E]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5B5D57]">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-[#DFDCD2] bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0D0F0E]">{ui.faq}</h2>
          <dl className="mt-6 space-y-6">
            {page.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-[#0D0F0E]">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-[#5B5D57]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 text-sm font-medium">
          {page.related.map((link) => (
            <Link key={link.href} href={link.href} className="text-[#165DFC] hover:underline">
              {link.label} <ArrowRight className="inline h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>

      <CTASection />
      <CompareStickyTrialBar competitorSlug={page.slug} locale={locale} />
      <div className="h-20 print:hidden" aria-hidden />
    </MarketingShell>
  );
}
