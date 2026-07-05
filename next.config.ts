import type { NextConfig } from "next";
import { INDUSTRY_VANITY_REDIRECTS } from "./lib/marketing/industry-vanity-redirects";

const industryVanityRedirects = Object.entries(INDUSTRY_VANITY_REDIRECTS).map(([source, destination]) => ({
  source,
  destination,
  permanent: true,
}));

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      ...industryVanityRedirects,
      { source: "/romania", destination: "/industries/romania", permanent: true },
      { source: "/preturi", destination: "/pricing", permanent: true },
      { source: "/prices", destination: "/pricing", permanent: true },
      { source: "/features/till-close", destination: "/features/z-report", permanent: true },
      { source: "/features/raport-z", destination: "/features/z-report", permanent: true },
      { source: "/compare/hepos", destination: "/compare/ebriza", permanent: true },
      { source: "/our-blog-1/:path*", destination: "/resources", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
