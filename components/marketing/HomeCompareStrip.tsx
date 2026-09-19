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
    <section className="border-y border-border bg-card px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brass">{t.home.compare.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{t.home.compare.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-mid">{t.home.compare.subtitle}</p>
          </div>
          <Link href="/compare" className="inline-flex items-center gap-1 text-sm font-semibold text-brass hover:underline">
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
                className="group flex items-center gap-4 rounded-xl border border-border bg-secondary/50 p-4 transition hover:border-brass/40 hover:bg-card hover:shadow-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-card p-1">
                  <Image src={brand.logoSrc} alt="" width={48} height={48} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-brass">
                    vs {brand.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.home.compare.cardCta}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
