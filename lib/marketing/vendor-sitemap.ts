import type { SitemapPathEntry } from "@/lib/marketing/sitemap-paths";
import { VENDOR_CATEGORIES } from "@/lib/marketing/vendor-categories";
import { getAllPublicVendorSlugs, getQualifyingCategoryCounties } from "@/lib/vendors/queries";

/**
 * DB-driven sitemap paths for the vendor directory. Kept as a separate,
 * async function rather than folding into allSitemapPaths() (which every
 * other static page type relies on staying synchronous) — merged in one
 * level up, in app/sitemap.ts, to minimize blast radius on shared
 * sitemap infrastructure.
 *
 * The category×county combinations here use the exact same query as
 * generateStaticParams in
 * app/resources/suppliers/[category]/[county]/page.tsx, so the sitemap
 * and the actually-generated pages can never drift apart.
 */
export async function getVendorDirectorySitemapPaths(): Promise<SitemapPathEntry[]> {
  const entries: SitemapPathEntry[] = [
    { path: "/resources/suppliers", priority: 0.7, changeFrequency: "weekly" },
    ...VENDOR_CATEGORIES.map((cat) => ({
      path: cat.path,
      priority: 0.65,
      changeFrequency: "weekly" as const,
    })),
  ];

  const qualifying = await getQualifyingCategoryCounties();
  for (const { category, county } of qualifying) {
    const cat = VENDOR_CATEGORIES.find((c) => c.slug === category);
    if (!cat) continue;
    entries.push({
      path: `${cat.path}/${county}`,
      priority: 0.6,
      changeFrequency: "monthly",
    });
  }

  const vendorSlugs = await getAllPublicVendorSlugs();
  for (const slug of vendorSlugs) {
    entries.push({
      path: `/resources/suppliers/vendor/${slug}`,
      priority: 0.55,
      changeFrequency: "monthly",
    });
  }

  return entries;
}
