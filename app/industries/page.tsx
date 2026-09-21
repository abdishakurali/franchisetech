import { DesignIndustries } from "@/components/marketing/ClaudeMarketing";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { industryPages, SITE_URL } from "@/lib/marketing/seo";
import { PRIMARY_INDUSTRY_NAV, PRIMARY_INDUSTRY_SLUGS } from "@/lib/marketing/industry-verticals";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages, localizeSeoPage } from "@/lib/marketing/i18n";
import { localeAlternates } from "@/lib/marketing/site-locale";
import { LEAN_PRODUCT_SCOPE_ENABLED } from "@/lib/product-scope";

const primaryIndustries = industryPages.filter((p) =>
  PRIMARY_INDUSTRY_SLUGS.includes(p.slug as (typeof PRIMARY_INDUSTRY_SLUGS)[number]) &&
  (!LEAN_PRODUCT_SCOPE_ENABLED || p.slug === "cafes" || p.slug === "takeaways")
);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.industriesIndex.title,
    description: t.industriesIndex.description,
    alternates: localeAlternates("/industries", locale),
  };
}

export default async function IndustriesPage() {
  const locale = await getMarketingLocale();
  if (locale === "ro") return <ClaudeMarketingShellAuth><DesignIndustries /></ClaudeMarketingShellAuth>;
  const t = getMarketingMessages(locale);

  return (
    <ClaudeMarketingShellAuth>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: t.seoPage.industriesBreadcrumb, item: `${SITE_URL}/industries` }],
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1a3ab8]">{t.industriesIndex.label}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{t.industriesIndex.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{t.industriesIndex.heroText}</p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {primaryIndustries.map((raw) => {
              const page = localizeSeoPage(raw, locale);
              const nav = PRIMARY_INDUSTRY_NAV.find((n) => n.slug === page.slug);
              const Icon = nav?.icon;
              return (
                <Link
                  key={page.path}
                  href={page.path}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#1a3ab8]/30 hover:shadow-md"
                >
                  <div className="flex aspect-[16/9] items-center justify-center bg-slate-100">
                    {Icon && <Icon className="h-10 w-10 text-[#1a3ab8]" strokeWidth={1.5} aria-hidden />}
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-[#1a3ab8]">{page.eyebrow}</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">{page.h1}</h2>
                    <p className="mt-2 text-sm text-slate-600">{page.intro}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {t.industriesIndex.cardIncludes.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1a3ab8]">
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
    </ClaudeMarketingShellAuth>
  );
}
