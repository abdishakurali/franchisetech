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
    // facebook.com/franchisetech belongs to an unrelated company (checked
    // 2026-11-05), so it is not listed; add our own profiles once they exist.
    sameAs: [
      "https://www.linkedin.com/company/franchisetech",
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
