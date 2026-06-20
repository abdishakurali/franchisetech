import type { MetadataRoute } from "next";
import { SITE_URL, publicPaths } from "@/lib/marketing/seo";

const MARKETING_LOCALES = ["en", "ro", "it"] as const;

function urlForPath(path: string, lang: (typeof MARKETING_LOCALES)[number]): string {
  const base = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  if (lang === "en") return base;
  const sep = path === "/" ? "/?" : "?";
  return `${base}${sep}lang=${lang}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [...publicPaths, "/help", "/login", "/signup"];
  const allPaths = [...new Set(staticPaths)];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of allPaths) {
    for (const lang of MARKETING_LOCALES) {
      entries.push({
        url: urlForPath(path, lang),
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.6,
      });
    }
  }

  return entries;
}
