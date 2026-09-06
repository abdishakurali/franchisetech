import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";
import { allSitemapPaths } from "@/lib/marketing/sitemap-paths";
import { getVendorDirectorySitemapPaths } from "@/lib/marketing/vendor-sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // allSitemapPaths() stays synchronous — every other static page type is
  // untouched. The vendor directory is DB-backed, so it's fetched
  // separately and merged in here rather than converting the shared,
  // synchronous helper used by every other page type.
  const vendorPaths = await getVendorDirectorySitemapPaths();
  const paths = [...allSitemapPaths(), ...vendorPaths];

  // One canonical URL per page — no ?lang= variants. The canonical tag
  // (lib/marketing/site-locale.ts) always points at the clean URL, so
  // listing the query-param duplicate here just split ranking signal and
  // doubled the sitemap (441 entries for 227 real pages).
  return paths.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
