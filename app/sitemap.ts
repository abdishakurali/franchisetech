import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";
import { allSitemapPaths, isLocalizedPath } from "@/lib/marketing/sitemap-paths";
import { getVendorDirectorySitemapPaths } from "@/lib/marketing/vendor-sitemap";

const MARKETING_LOCALES = ["en", "ro"] as const;

function urlForPath(path: string, lang: (typeof MARKETING_LOCALES)[number]): string {
  const base = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  if (lang === "en") return base;
  const sep = path === "/" ? "/?" : "?";
  return `${base}${sep}lang=${lang}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // allSitemapPaths() stays synchronous — every other static page type is
  // untouched. The vendor directory is DB-backed, so it's fetched
  // separately and merged in here rather than converting the shared,
  // synchronous helper used by every other page type.
  const vendorPaths = await getVendorDirectorySitemapPaths();
  const paths = [...allSitemapPaths(), ...vendorPaths];

  for (const { path, priority, changeFrequency } of paths) {
    const langs = isLocalizedPath(path) ? MARKETING_LOCALES : (["en"] as const);
    for (const lang of langs) {
      entries.push({
        url: urlForPath(path, lang),
        lastModified: new Date(),
        changeFrequency,
        priority,
      });
    }
  }

  return entries;
}
