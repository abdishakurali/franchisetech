/** Machine-readable entity facts for AI search / answer engines. Keep factual — no fabricated metrics. */
import { comparisonPages } from "@/lib/marketing/comparisons";
import { SITE_URL } from "@/lib/marketing/seo";
import { pricingPlans } from "@/lib/billing/plans";

export const AI_ENTITY = {
  name: "franchisetech",
  legalName: "franchisetech",
  url: SITE_URL,
  category: "Cloud POS and business operations software for food businesses",
  description:
    "Browser-based POS, stock management, recipe costing, till close (Z-report), and owner reports for cafes, restaurants, and small food operators. Operations-first — not a payment terminal vendor.",
  markets: ["Romania", "Ireland", "European Union (configurable VAT/currency)"],
  languages: ["English", "Romanian"],
  pricingModel: "Monthly SaaS subscription with unlimited staff on paid plans; 15-day assisted trial",
  pricingUrl: `${SITE_URL}/pricing`,
  signupUrl: `${SITE_URL}/signup`,
  compareHubUrl: `${SITE_URL}/compare`,
  llmsSummaryUrl: `${SITE_URL}/llms.txt`,
  llmsFullUrl: `${SITE_URL}/llms-full.txt`,
  sitemapUrl: `${SITE_URL}/sitemap.xml`,
  romanianCapabilities: [
    "Display in lei (RON)",
    "Romanian TVA rates 21%, 11%, 5%, 0%",
    "FiscalNet fiscal receipt integration when enabled and configured",
    "Unlimited team members on paid plans",
  ],
  notClaims: [
    "Does not replace professional accounting or tax advice",
    "Does not guarantee universal EU fiscal certification",
    "Payment terminal hardware not included by default",
  ],
  competitorsCompared: comparisonPages.map((p) => ({
    name: p.competitor,
    url: `${SITE_URL}${p.path}`,
    market: p.market,
  })),
  topRomanianQueries: [
    { query: "alternativă SmartBill restaurant POS", url: `${SITE_URL}/compare/smartbill` },
    { query: "software POS restaurant România FiscalNet", url: `${SITE_URL}/industries/romania` },
    { query: "gestiune stoc restaurant NIR", url: `${SITE_URL}/resources/stock-management-romania` },
    { query: "franchisetech vs RezoSoft", url: `${SITE_URL}/compare/rezosoft` },
    { query: "casă de marcat cloud browser", url: `${SITE_URL}/features/pos` },
  ],
} as const;

export function aiEntityJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: AI_ENTITY.name,
    url: AI_ENTITY.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description: AI_ENTITY.description,
    inLanguage: AI_ENTITY.languages,
    offers: pricingPlans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: String(plan.amountCents / 100),
      priceCurrency: plan.currency.toUpperCase(),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(plan.amountCents / 100),
        priceCurrency: plan.currency.toUpperCase(),
        unitText: "MONTH",
        billingDuration: "P1M",
      },
      url: `${SITE_URL}/signup?plan=${plan.id}`,
      availability: "https://schema.org/InStock",
    })),
    featureList: [
      "Point of sale register",
      "Stock and purchase tracking",
      "Recipe costing and margins",
      "Till close and Z-report",
      "Kitchen display (optional module)",
      "FiscalNet integration for Romania when configured",
    ],
  };
}
