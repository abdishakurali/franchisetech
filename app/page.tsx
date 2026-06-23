import type { Metadata } from "next";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, SITE_URL } from "@/lib/marketing/seo";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.home.meta.title,
    description: t.home.meta.description,
    keywords: marketingKeywords(locale),
    alternates: localeAlternates("/", locale),
    openGraph: {
      title: t.home.meta.title,
      description: t.home.meta.description,
      url: SITE_URL,
      locale: marketingOpenGraphLocale(locale),
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: t.home.dashboard.alt }],
    },
  };
}

export default async function HomePage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "franchisetech",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: locale,
          description: t.home.meta.description,
          url: SITE_URL,
          offers: { "@type": "Offer", price: "49", priceCurrency: "EUR" },
        }}
      />
      <JsonLd data={faqJsonLd([...t.home.faq.items])} />
      <HomePageContent />
    </MarketingShell>
  );
}
