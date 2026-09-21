import type { Metadata } from "next";
import { DesignHome } from "@/components/marketing/ClaudeMarketing";
import { HomePageContentTop, HomePageContentBottom } from "@/components/marketing/HomePageContent";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, SITE_URL } from "@/lib/marketing/seo";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { getHomepageContent } from "@/lib/marketing/homepage-content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.home.meta.title,
    description: t.home.meta.description,
    applicationName: "franchisetech",
    keywords: marketingKeywords(locale),
    alternates: localeAlternates("/", locale),
    openGraph: {
      title: t.home.meta.title,
      description: t.home.meta.description,
      url: SITE_URL,
      locale: marketingOpenGraphLocale(locale),
      // Not the old /showcase/reports-dashboard.png — stale pre-pivot screenshot.
      images: [{ url: "/franchise-tech-logo.png", width: 900, height: 237, alt: t.home.dashboard.alt }],
    },
  };
}

export default async function HomePage() {
  const locale = await getMarketingLocale();
  if (locale === "ro") return <ClaudeMarketingShellAuth><DesignHome /></ClaudeMarketingShellAuth>;
  const faq = getHomepageContent(locale).faq;

  return (
    <ClaudeMarketingShellAuth>
      <JsonLd data={faqJsonLd(faq)} />
      <HomePageContentTop />
      <HomePageContentBottom />
    </ClaudeMarketingShellAuth>
  );
}
