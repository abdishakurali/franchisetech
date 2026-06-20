import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
