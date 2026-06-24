import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/romania", destination: "/industries/romania", permanent: true },
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
