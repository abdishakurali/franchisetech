import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";

const DISALLOW = ["/app/", "/api/"];

const crawlRules: MetadataRoute.Robots["rules"] = [
  { userAgent: "*", allow: "/", disallow: DISALLOW },
  { userAgent: "GPTBot", allow: "/", disallow: DISALLOW },
  { userAgent: "ChatGPT-User", allow: "/", disallow: DISALLOW },
  { userAgent: "Google-Extended", allow: "/", disallow: DISALLOW },
  { userAgent: "anthropic-ai", allow: "/", disallow: DISALLOW },
  { userAgent: "ClaudeBot", allow: "/", disallow: DISALLOW },
  { userAgent: "PerplexityBot", allow: "/", disallow: DISALLOW },
  { userAgent: "Applebot-Extended", allow: "/", disallow: DISALLOW },
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: crawlRules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
