import { notFound } from "next/navigation";
import { MarketingShell, CTASection } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { VendorFilterBar } from "@/components/marketing/suppliers/VendorFilterBar";
import { VendorGrid } from "@/components/marketing/suppliers/VendorGrid";
import { VendorCategorySidebar } from "@/components/marketing/suppliers/VendorCategorySidebar";
import { findVendorCategory } from "@/lib/marketing/vendor-categories";
import {
  getCounties,
  getPublicVendors,
  getQualifyingCategoryCounties,
  isQualifyingCategoryCounty,
} from "@/lib/vendors/queries";
import { breadcrumbSchema, seoMeta, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";

/**
 * force-dynamic (not revalidate/ISR) specifically on this route: when
 * generateStaticParams returns few/zero entries (true today — zero
 * vendors yet), Next's production build treats any request for a path
 * outside that pre-rendered set as an on-demand static-optimization
 * candidate, and generateMetadata's call to getMarketingLocale() (which
 * reads cookies()/headers()) throws DYNAMIC_SERVER_USAGE in that path —
 * confirmed via a local production build test (dev mode renders fine;
 * only `next build && next start` reproduces it). The sibling
 * [category]/page.tsx doesn't hit this because its generateStaticParams
 * always returns the full, non-empty 11-category list. Once real vendor
 * data exists and this route has a healthy pre-rendered set, revisit
 * whether ISR can be re-enabled safely.
 */
export const dynamic = "force-dynamic";

/**
 * Only pre-generate category×county combinations with enough vendors to
 * justify a distinct page (see MIN_VENDORS_FOR_COUNTY_PAGE in
 * lib/vendors/queries.ts) — this is what structurally prevents thin,
 * duplicate-content SEO pages, not just an editorial guideline.
 */
export async function generateStaticParams() {
  const qualifying = await getQualifyingCategoryCounties();
  return qualifying.map((q) => ({ category: q.category, county: q.county }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; county: string }>;
}) {
  const { category: categorySlug, county: countySlug } = await params;
  const category = findVendorCategory(categorySlug);
  if (!category) return {};
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  const counties = await getCounties();
  const county = counties.find((c) => c.slug === countySlug);
  if (!county) return {};

  return seoMeta({
    locale,
    path: `${category.path}/${countySlug}`,
    title: isRo
      ? `${category.labelRo} — ${county.name} | Furnizori HoReCa | franchisetech`
      : `${category.labelEn} — ${county.name} | HoReCa suppliers | franchisetech`,
    description: isRo
      ? `Furnizori verificați de ${category.labelRo.toLowerCase()} care deservesc județul ${county.name}.`
      : `Verified ${category.labelEn.toLowerCase()} suppliers serving ${county.name} county.`,
  });
}

export default async function VendorCategoryCountyPage({
  params,
}: {
  params: Promise<{ category: string; county: string }>;
}) {
  const { category: categorySlug, county: countySlug } = await params;
  const category = findVendorCategory(categorySlug);
  if (!category) notFound();

  // Re-check at request time (not just relying on the statically generated
  // set) since ISR revalidation means a combination could stop qualifying
  // between builds — a non-qualifying combo must never render, only 404.
  const qualifies = await isQualifyingCategoryCounty(category.slug, countySlug);
  if (!qualifies) notFound();

  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  const [counties, vendors] = await Promise.all([
    getCounties(),
    getPublicVendors({ category: category.slug, county: countySlug }),
  ]);
  const county = counties.find((c) => c.slug === countySlug);
  if (!county) notFound();

  const path = `${category.path}/${countySlug}`;

  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: isRo ? "Acasă" : "Home", path: "/" },
          { name: isRo ? "Furnizori" : "Suppliers", path: "/resources/suppliers" },
          { name: isRo ? category.labelRo : category.labelEn, path: category.path },
          { name: county.name, path },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${isRo ? category.labelRo : category.labelEn} — ${county.name}`,
          url: `${SITE_URL}${path}`,
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {isRo ? category.labelRo : category.labelEn}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {isRo
              ? `${category.labelRo} — ${county.name}`
              : `${category.labelEn} — ${county.name}`}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            {isRo
              ? `Furnizori verificați de ${category.labelRo.toLowerCase()} care deservesc județul ${county.name}.`
              : `Verified ${category.labelEn.toLowerCase()} suppliers serving ${county.name} county.`}
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <VendorCategorySidebar />
          </aside>
          <div className="space-y-8">
            <VendorFilterBar
              counties={counties}
              currentCategory={category.slug}
              currentCounty={countySlug}
              locale={locale}
            />
            <VendorGrid
              vendors={vendors}
              locale={locale}
              emptyMessage={
                isRo
                  ? "Niciun furnizor listat momentan pentru această combinație."
                  : "No suppliers currently listed for this combination."
              }
            />
          </div>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
