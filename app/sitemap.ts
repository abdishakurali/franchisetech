import type { MetadataRoute } from "next";
import { SITE_URL, publicPaths } from "@/lib/marketing/seo";
import { blogPosts } from "@/lib/marketing/blog/posts";

const MARKETING_LOCALES = ["en", "ro", "it"] as const;

function urlForPath(path: string, lang: (typeof MARKETING_LOCALES)[number]): string {
  const base = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  if (lang === "en") return base;
  const sep = path === "/" ? "/?" : "?";
  return `${base}${sep}lang=${lang}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [...publicPaths, "/blog", "/help", "/login", "/signup"];
  const blogPaths = blogPosts.map((p) => `/blog/${p.slug}`);
  const allPaths = [...new Set([...staticPaths, ...blogPaths])];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of allPaths) {
    for (const lang of MARKETING_LOCALES) {
      entries.push({
        url: urlForPath(path, lang),
        lastModified: new Date(),
        changeFrequency: path === "/" || path.startsWith("/blog") ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path.startsWith("/blog") ? 0.75 : 0.6,
      });
    }
  }

  return entries;
}
