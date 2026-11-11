import { JsonLd } from "@/components/marketing/JsonLd";
import { aiEntityJsonLd } from "@/lib/marketing/ai-discovery";
import { BRAND, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { SUPPORT_PHONE_TEL } from "@/lib/marketing/contact-info";
import { DATA_CONTROLLER } from "@/lib/legal/controller";

// Crawlers get the Romanian site (no locale cookie), so the entity description
// is the Romanian homepage description, not the English DEFAULT_DESCRIPTION.
const ORG_DESCRIPTION = getMarketingMessages("ro").home.meta.description;

export function GlobalSeoJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    ...(DATA_CONTROLLER.legalName ? { legalName: DATA_CONTROLLER.legalName } : {}),
    url: SITE_URL,
    logo: `${SITE_URL}/franchise-tech-logo.png`,
    description: ORG_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: DATA_CONTROLLER.contactEmail,
      telephone: SUPPORT_PHONE_TEL.replace(/^tel:/, ""),
      areaServed: "RO",
      availableLanguage: ["ro", "en"],
    },
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
    description: ORG_DESCRIPTION,
    inLanguage: "ro-RO",
    publisher: { "@id": `${SITE_URL}/#organization` },
    // No SearchAction: /help has no ?q= search (the page tells visitors to
    // use Ctrl+F), so the declared search URL didn't work.
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
