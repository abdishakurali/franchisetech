/** Competitor visual identity for compare pages, OG images, and AI-readable summaries. */
export type CompetitorBrand = {
  slug: string;
  name: string;
  /** Public URL path — PNG preferred, SVG fallback. */
  logoSrc: string;
  accent: string;
  domain: string;
  market: "global" | "ro";
};

const BRANDS: CompetitorBrand[] = [
  { slug: "square", name: "Square", logoSrc: "/compare/logos/square.png", accent: "#006AFF", domain: "squareup.com", market: "global" },
  { slug: "sumup", name: "SumUp", logoSrc: "/compare/logos/sumup.png", accent: "#1A1F36", domain: "sumup.com", market: "global" },
  { slug: "lightspeed", name: "Lightspeed", logoSrc: "/compare/logos/lightspeed.png", accent: "#E02020", domain: "lightspeedhq.com", market: "global" },
  { slug: "smartbill", name: "SmartBill", logoSrc: "/compare/logos/smartbill.png", accent: "#2563EB", domain: "smartbill.ro", market: "ro" },
  { slug: "saga", name: "Saga", logoSrc: "/compare/logos/saga.svg", accent: "#0F766E", domain: "saga.ro", market: "ro" },
  { slug: "rezosoft", name: "RezoSoft", logoSrc: "/compare/logos/rezosoft.svg", accent: "#1D4ED8", domain: "rezosoft.ro", market: "ro" },
  { slug: "expressoft", name: "Expressoft", logoSrc: "/compare/logos/expressoft.png", accent: "#DC2626", domain: "expressoft.ro", market: "ro" },
  { slug: "hepos", name: "hePOS", logoSrc: "/compare/logos/hepos.svg", accent: "#EA580C", domain: "hepos.ro", market: "ro" },
  { slug: "vilicorest", name: "VilicoRest", logoSrc: "/compare/logos/vilicorest.svg", accent: "#7C3AED", domain: "vilicorest.ro", market: "ro" },
  { slug: "ebriza", name: "Ebriza", logoSrc: "/compare/logos/ebriza.svg", accent: "#4F46E5", domain: "ebriza.ro", market: "ro" },
  { slug: "oblio", name: "Oblio", logoSrc: "/compare/logos/oblio.svg", accent: "#0F766E", domain: "oblio.eu", market: "ro" },
  { slug: "bit-soft",  name: "Bit-Soft",  logoSrc: "/compare/logos/bit-soft.svg",  accent: "#1E293B", domain: "bit-soft.ro",  market: "ro" },
  { slug: "boogit",    name: "Boogit",    logoSrc: "/compare/logos/boogit.png",    accent: "#F97316", domain: "boogit.ro",    market: "ro" },
  { slug: "freyapos",  name: "FreyaPOS",  logoSrc: "/compare/logos/freyapos.svg",  accent: "#7C3AED", domain: "freyapos.ro",  market: "ro" },
  { slug: "posnet",    name: "POSnet",    logoSrc: "/compare/logos/posnet.svg",    accent: "#0369A1", domain: "posnet.ro",    market: "ro" },
  { slug: "rkeeper",   name: "rKeeper",   logoSrc: "/compare/logos/rkeeper.jpg",   accent: "#DC2626", domain: "rkeeper.ro",   market: "ro" },
  { slug: "nexuserp",  name: "Nexus ERP", logoSrc: "/compare/logos/nexuserp.webp", accent: "#1D4ED8", domain: "nexuserp.ro",  market: "ro" },
];

export const FRANCHISETECH_BRAND = {
  name: "franchisetech",
  logoSrc: "/franchise-tech-logo.png",
  logoFallbackSrc: "/franchise-tech-logo.svg",
  accent: "#2563EB",
};

const brandBySlug = new Map(BRANDS.map((b) => [b.slug, b]));

export function getCompetitorBrand(slug: string): CompetitorBrand | undefined {
  return brandBySlug.get(slug);
}

export function competitorLogoForOg(slug: string): string {
  const brand = brandBySlug.get(slug);
  return brand?.logoSrc ?? `/compare/logos/${slug}.svg`;
}

export function featuredCompareSlugs(locale: "en" | "ro"): string[] {
  if (locale === "ro") return ["ebriza", "nexuserp", "boogit", "expressoft"];
  return ["square", "sumup", "smartbill"];
}
