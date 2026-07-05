"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredCompareSlugs, getCompetitorBrand } from "@/lib/marketing/competitor-brands";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";

export function HomeCompareStrip() {
  const { locale, t } = useMarketingLocaleContext();
  const slugs = featuredCompareSlugs(locale);

  return (
    <section className="border-y border-slate-100 bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{t.home.compare.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{t.home.compare.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">{t.home.compare.subtitle}</p>
          </div>
          <Link href="/compare" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
            {t.home.compare.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slugs.map((slug) => {
            const brand = getCompetitorBrand(slug);
            if (!brand) return null;
            return (
              <Link
                key={slug}
                href={`/compare/${slug}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-white hover:shadow-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                  <Image src={brand.logoSrc} alt="" width={48} height={48} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    vs {brand.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.home.compare.cardCta}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
