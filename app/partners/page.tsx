import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Faq, MarketingShell, Section, SectionLabel } from "@/components/marketing/MarketingShell";
import { PartnerContactForm } from "@/components/marketing/PartnerContactForm";
import { PartnerEconomicsStrip } from "@/components/marketing/PartnerEconomicsStrip";
import { PartnerHowItWorks } from "@/components/marketing/PartnerHowItWorks";
import { PartnerPilotBanner } from "@/components/marketing/PartnerPilotBanner";
import { PartnerStickyWaitlistBar } from "@/components/marketing/PartnerStickyWaitlistBar";
import { JsonLd } from "@/components/marketing/JsonLd";
import { isPartnerProgramOpen } from "@/lib/partner-program";
import { SITE_URL } from "@/lib/marketing/seo";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.partners.title,
    description: t.partners.description,
    keywords: [...marketingKeywords(locale), "contabil HORECA", "program parteneri POS"],
    alternates: localeAlternates("/partners", locale),
    openGraph: {
      title: t.partners.title,
      description: t.partners.description,
      url: `${SITE_URL}/partners`,
      locale: marketingOpenGraphLocale(locale),
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: "franchisetech partner program" }],
    },
  };
}

export default async function PartnersPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const programOpen = isPartnerProgramOpen();

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: t.nav.partners, item: `${SITE_URL}/partners` }],
        }}
      />

      <section className="bg-gradient-to-b from-slate-50/80 to-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <SectionLabel>{t.partners.label}</SectionLabel>
          <h1 className={`mx-auto mt-4 max-w-3xl ${marketingHeading}`}>{t.partners.heroTitle}</h1>
          <p className={`mx-auto mt-5 max-w-2xl text-xl font-medium text-slate-800`}>{t.partners.heroText}</p>
          <p className="mt-4 text-sm font-medium text-blue-600">{t.partners.heroTag}</p>
          <PartnerEconomicsStrip items={t.partners.economics} />
        </div>
      </section>

      {!programOpen && (
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <PartnerPilotBanner title={t.partners.pilotBannerTitle} text={t.partners.pilotBannerText} />
        </section>
      )}

      <PartnerHowItWorks label={t.partners.howItWorksLabel} title={t.partners.howItWorksTitle} steps={t.partners.howItWorks} />

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>{t.partners.accountantsLabel}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.partners.accountantsTitle}</h2>
          <p className={`mt-3 ${marketingSubtext}`}>{t.partners.accountantsText}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {t.partners.accountantsPoints.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>{t.partners.otherArchetypesLabel}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.partners.otherArchetypesTitle}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {t.partners.otherArchetypes.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <h2 className={marketingHeading}>{t.partners.faqTitle}</h2>
        </div>
        <div className="mt-8 max-w-3xl">
          <Faq items={t.partners.faqs} />
        </div>
      </Section>

      <Section tone="slate" id="partner-form">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2 className={marketingHeading}>{programOpen ? t.partners.applyTitle : t.partners.waitlistTitle}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>
              {programOpen ? t.partners.applyText : t.partners.waitlistText}
            </p>
            <p className="mt-4 text-sm text-slate-500">
              {t.partners.endCustomers}{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                {t.partners.startTrial} <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
          <PartnerContactForm programOpen={programOpen} />
        </div>
      </Section>

      <div className="h-20" aria-hidden="true" />
      <PartnerStickyWaitlistBar programOpen={programOpen} />
    </MarketingShell>
  );
}
