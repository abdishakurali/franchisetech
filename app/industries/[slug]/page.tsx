import { notFound } from "next/navigation";
import { IndustryLandingPage } from "@/components/marketing/IndustryLandingPage";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, findPage, industryPages, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages, localizeSeoPage } from "@/lib/marketing/i18n";

export function generateStaticParams() {
  return industryPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const raw = findPage(industryPages, (await params).slug);
  if (!raw) return {};
  return pageMetadata(localizeSeoPage(raw, locale), locale);
}

export default async function IndustrySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const raw = findPage(industryPages, (await params).slug);
  if (!raw) notFound();
  const page = localizeSeoPage(raw, locale);

  const ui = {
    painTitle: t.industryLanding.painTitle,
    featuresTitle: t.industryLanding.featuresTitle,
    compareTitle: t.industryLanding.compareTitle,
    compareLink: t.industryLanding.compareLink,
    getStarted: t.seoPage.getStarted,
    seePricing: t.cta.seePricing,
    faq: t.seoPage.faq,
    relevantFeatures: t.seoPage.relevantFeatures,
  };

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t.seoPage.industriesBreadcrumb, item: `${SITE_URL}/industries` },
            { "@type": "ListItem", position: 2, name: page.title, item: `${SITE_URL}${page.path}` },
          ],
        }}
      />
      <IndustryLandingPage page={page} ui={ui} />
    </MarketingShell>
  );
}
