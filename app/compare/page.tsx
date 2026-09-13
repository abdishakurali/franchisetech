import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PersuasionHero } from "@/components/marketing/PersuasionHero";
import { getCompetitorBrand } from "@/lib/marketing/competitor-brands";
import {
  breadcrumbSchema,
  comparisonPages,
  comparisonsByMarket,
  faqJsonLd,
  seoMeta,
  SITE_URL,
} from "@/lib/marketing/seo";
import {
  RO_COMPARE_HORECA_SLUGS,
  RO_COMPARE_INVOICING_SLUGS,
} from "@/lib/marketing/comparisons";
import { compareHubFaqs, compareUi } from "@/lib/marketing/compare-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";

export async function generateMetadata() {
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  return seoMeta({
    locale,
    path: "/compare",
    title: isRo
      ? "Comparații POS România — Ebriza, SmartBill, Expressoft | franchisetech"
      : "Compare POS & restaurant software — Ebriza, SmartBill, Expressoft | franchisetech",
    description: isRo
      ? "Comparații oneste franchisetech vs Ebriza, SmartBill, Expressoft, Boogit, POSnet, rKeeper și altele — POS, stoc, rețete, FiscalNet, raport Z și cost real."
      : "Honest comparisons: franchisetech vs Ebriza, SmartBill, Expressoft, and other Romanian restaurant POS options.",
  });
}

function CompareCard({
  slug,
  competitor,
  path,
  description,
  market,
  readLabel,
}: {
  slug: string;
  competitor: string;
  path: string;
  description: string;
  market: string;
  readLabel: string;
}) {
  const brand = getCompetitorBrand(slug);
  return (
    <Link
      href={path}
      className="group flex flex-col rounded-2xl border border-[#DFDCD2] bg-white p-6 transition hover:border-[#165DFC]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {brand ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-[#DFDCD2] bg-white p-1">
              <Image src={brand.logoSrc} alt="" width={48} height={48} className="h-full w-full object-contain" />
            </div>
          ) : null}
          <h2 className="text-lg font-semibold text-[#0D0F0E] group-hover:text-[#165DFC]">
            franchisetech vs {competitor}
          </h2>
        </div>
        {market === "ro" ? (
          <span className="shrink-0 rounded-full bg-[#F3F0E8] px-2 py-0.5 text-xs font-medium text-[#5B5D57]">RO</span>
        ) : null}
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#5B5D57]">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#165DFC]">
        {readLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default async function CompareHubPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const ui = compareUi(locale);
  const hubFaqs = compareHubFaqs(locale);
  const roPages = comparisonsByMarket("ro");
  const globalPages = comparisonsByMarket("global");
  const roHoreca = roPages.filter((p) => (RO_COMPARE_HORECA_SLUGS as readonly string[]).includes(p.slug));
  const roInvoicing = roPages.filter((p) => (RO_COMPARE_INVOICING_SLUGS as readonly string[]).includes(p.slug));
  const roOther = roPages.filter(
    (p) =>
      !(RO_COMPARE_HORECA_SLUGS as readonly string[]).includes(p.slug) &&
      !(RO_COMPARE_INVOICING_SLUGS as readonly string[]).includes(p.slug),
  );

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(hubFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: ui.breadcrumbHome, path: "/" },
          { name: ui.breadcrumbCompare, path: "/compare" },
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

      <PersuasionHero
        eyebrow={locale === "ro" ? "Comparații" : "Compare"}
        title={locale === "ro" ? "Comparații POS pentru restaurante și cafenele" : "Compare franchisetech with other POS and operations tools"}
        subtitle={
          locale === "ro"
            ? "Evaluări oneste — nu vindem hardware de plăți. Vă ajutăm să vedeți când franchisetech (casă + stoc + rețete + raport Z) are sens față de facturare, POS local sau terminale de card."
            : "Honest evaluations — we do not sell payment terminals. See when franchisetech (POS + stock + recipes + till close) fits vs payments-first or invoicing-first tools."
        }
      >
        <Link
          href="/signup"
          className="inline-flex rounded-[10px] bg-[#165DFC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3E7BFF]"
        >
          {t.cta.startTrial}
        </Link>
      </PersuasionHero>

      <section className="bg-[#F3F0E8] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-14">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">
              {locale === "ro" ? "POS HoReCa — restaurante și cafenele" : "HoReCa POS — restaurants & cafes"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5B5D57]">
              {locale === "ro"
                ? "Ebriza, Posnet, rKeeper și altele — operațiuni zilnice, delivery, multi-locație."
                : "Daily operations, delivery, and multi-site POS alternatives."}
            </p>
            <div className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-3">
              {roHoreca.map((p) => (
                <CompareCard
                  key={p.slug}
                  slug={p.slug}
                  competitor={p.competitor}
                  path={p.path}
                  description={p.description}
                  market={p.market}
                  readLabel={ui.readComparison}
                />
              ))}
            </div>
          </div>

          {roInvoicing.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">
                {locale === "ro" ? "Facturare & gestiune — România" : "Invoicing & stock — Romania"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#5B5D57]">
                {locale === "ro"
                  ? "SmartBill și altele — e-Factura și documente. franchisetech le completează pentru casă zilnică."
                  : "e-Factura and invoicing tools — franchisetech complements them for daily till operations."}
              </p>
              <div className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-3">
                {roInvoicing.map((p) => (
                  <CompareCard
                    key={p.slug}
                    slug={p.slug}
                    competitor={p.competitor}
                    path={p.path}
                    description={p.description}
                    market={p.market}
                    readLabel={ui.readComparison}
                  />
                ))}
              </div>
            </div>
          )}

          {roOther.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">
                {locale === "ro" ? "Alte alternative POS România" : "Other Romania POS alternatives"}
              </h2>
              <div className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-3">
                {roOther.map((p) => (
                  <CompareCard
                    key={p.slug}
                    slug={p.slug}
                    competitor={p.competitor}
                    path={p.path}
                    description={p.description}
                    market={p.market}
                    readLabel={ui.readComparison}
                  />
                ))}
              </div>
            </div>
          )}

          {globalPages.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">
                {locale === "ro" ? "Internațional — plăți și POS global" : "International — payments & global POS"}
              </h2>
              <div className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-3">
                {globalPages.map((p) => (
                  <CompareCard
                    key={p.slug}
                    slug={p.slug}
                    competitor={p.competitor}
                    path={p.path}
                    description={p.description}
                    market={p.market}
                    readLabel={ui.readComparison}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#DFDCD2] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0D0F0E]">{ui.faq}</h2>
          <dl className="mt-6 space-y-6">
            {hubFaqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-[#0D0F0E]">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-[#5B5D57]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
