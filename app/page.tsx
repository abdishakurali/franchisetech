import type { Metadata } from "next";
import { HomePageContentTop, HomePageContentBottom } from "@/components/marketing/HomePageContent";
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
    applicationName: "franchisetech",
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
  const faq = locale === "ro"
    ? [
        { question: "Pentru cine este franchisetech?", answer: "Pentru cafenele, restaurante mici, takeaway, brutării și patiserii cu 1–3 locații din România." },
        { question: "Cum funcționează perioada de probă?", answer: "Trialul asistat durează 15 zile și începe după verificarea unică de 1 € a cardului." },
        { question: "Cât costă?", answer: "Starter costă 49 €/lună, Pro 79 €/lună, Scale 109 €/lună, iar Multi-locație 89 €/locație suplimentară/lună (necesită Scale). TVA și serviciile terțe nu sunt incluse." },
      ]
    : [
        { question: "Who is franchisetech for?", answer: "Romanian cafés, takeaway, bakeries, shops, and service businesses." },
        { question: "How does the trial work?", answer: "The assisted trial lasts 15 days and starts after a one-time €1 card verification." },
        { question: "How much does it cost?", answer: "Starter is €49/month, Pro €79/month, Scale €109/month, and Multi-location €89/additional location/month (requires Scale). VAT and third-party services are excluded." },
      ];

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(faq)} />
      <HomePageContentTop />
      <HomePageContentBottom />
    </MarketingShell>
  );
}
