import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { industryPages, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages, localizeSeoPage } from "@/lib/marketing/i18n";
import { localeAlternates } from "@/lib/marketing/site-locale";

const primarySlugs = ["cafes", "restaurants", "takeaways", "food-trucks", "health-bars"] as const;
const primaryIndustries = industryPages.filter((p) =>
  primarySlugs.includes(p.slug as (typeof primarySlugs)[number])
);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.industriesIndex.title,
    description: t.industriesIndex.description,
    alternates: localeAlternates("/industries"),
  };
}

export default async function IndustriesPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: t.seoPage.industriesBreadcrumb, item: `${SITE_URL}/industries` }],
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{t.industriesIndex.label}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{t.industriesIndex.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{t.industriesIndex.heroText}</p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {primaryIndustries.map((raw) => {
              const page = localizeSeoPage(raw, locale);
              return (
                <Link
                  key={page.path}
                  href={page.path}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  {page.image && (
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      <Image
                        src={page.image}
                        alt={page.h1}
                        width={800}
                        height={450}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-sm font-semibold text-blue-600">{page.eyebrow}</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">{page.h1}</h2>
                    <p className="mt-2 text-sm text-slate-600">{page.intro}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                      {t.seoPage.viewIndustry} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
