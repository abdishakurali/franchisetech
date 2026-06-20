import { HELP_ARTICLES } from "@/lib/help/articles";
import { comparisonPages, COMPARE_HUB_PATH } from "@/lib/marketing/comparisons";
import {
  featurePages,
  industryPages,
  publicPaths,
  resourcePages,
} from "@/lib/marketing/seo";

export type SitemapPathEntry = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/pricing": 0.9,
  "/signup": 0.5,
  "/login": 0.3,
};

function priorityFor(path: string): number {
  if (path in PRIORITY) return PRIORITY[path];
  if (path.startsWith("/compare/")) return 0.75;
  if (path === COMPARE_HUB_PATH) return 0.8;
  if (path.startsWith("/industries/romania")) return 0.85;
  if (path.startsWith("/resources/")) return 0.7;
  if (path.startsWith("/features/")) return 0.75;
  if (path.startsWith("/help/")) return 0.65;
  if (path === "/partners") return 0.6;
  return 0.6;
}

function frequencyFor(path: string): SitemapPathEntry["changeFrequency"] {
  if (path === "/" || path === "/pricing") return "weekly";
  if (path.startsWith("/legal") || path === "/privacy" || path === "/terms") return "yearly";
  return "monthly";
}

/** All indexable marketing paths (without locale query). */
export function allSitemapPaths(): SitemapPathEntry[] {
  const paths = new Set<string>([
    ...publicPaths,
    COMPARE_HUB_PATH,
    "/partners",
    "/help",
    "/login",
    "/signup",
    ...HELP_ARTICLES.map((a) => `/help/${a.slug}`),
    "/help/romania-fiscalnet",
  ]);

  return [...paths]
    .sort((a, b) => a.localeCompare(b))
    .map((path) => ({
      path,
      priority: priorityFor(path),
      changeFrequency: frequencyFor(path),
    }));
}

export const sitemapStats = {
  features: featurePages.length,
  industries: industryPages.length,
  comparisons: comparisonPages.length,
  resources: resourcePages.length,
  helpArticles: HELP_ARTICLES.length,
};
