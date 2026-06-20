import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";
import { allSitemapPaths } from "@/lib/marketing/sitemap-paths";

const MARKETING_LOCALES = ["en", "ro", "it"] as const;

function urlForPath(path: string, lang: (typeof MARKETING_LOCALES)[number]): string {
  const base = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  if (lang === "en") return base;
  const sep = path === "/" ? "/?" : "?";
  return `${base}${sep}lang=${lang}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of allSitemapPaths()) {
    for (const lang of MARKETING_LOCALES) {
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
