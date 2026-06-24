import { JsonLd } from "@/components/marketing/JsonLd";
import { aiEntityJsonLd } from "@/lib/marketing/ai-discovery";
import { BRAND, DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/marketing/seo";

export function GlobalSeoJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/franchise-tech-logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      "https://www.linkedin.com/company/franchisetech",
      "https://www.facebook.com/franchisetech",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: ["en", "ro"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/help?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const software = aiEntityJsonLd();

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <JsonLd data={software} />
    </>
  );
}
