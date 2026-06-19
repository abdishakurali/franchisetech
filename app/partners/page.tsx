import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Faq, MarketingShell, Section, SectionLabel } from "@/components/marketing/MarketingShell";
import { PartnerContactForm } from "@/components/marketing/PartnerContactForm";
import { JsonLd } from "@/components/marketing/JsonLd";
import { partnerClients } from "@/lib/marketing/partners";
import { SITE_URL } from "@/lib/marketing/seo";
import { MARKETING_KEYWORDS, localeAlternates } from "@/lib/marketing/site-locale";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.partners.title,
    description: t.partners.description,
    keywords: [...MARKETING_KEYWORDS, "POS reseller", "hospitality software partner"],
    alternates: localeAlternates("/partners"),
    openGraph: {
      title: t.partners.title,
      description: t.partners.description,
      url: `${SITE_URL}/partners`,
      locale: locale === "ro" ? "ro_RO" : "en",
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: "franchisetech partner program" }],
    },
  };
}

export default async function PartnersPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);

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
        <div className="mx-auto max-w-6xl">
          <SectionLabel>{t.partners.label}</SectionLabel>
          <h1 className={`mt-4 max-w-3xl ${marketingHeading}`}>{t.partners.heroTitle}</h1>
          <p className={`mt-5 max-w-2xl ${marketingSubtext}`}>{t.partners.heroText}</p>
          <p className="mt-4 text-sm font-medium text-blue-600">{t.partners.heroTag}</p>
        </div>
      </section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>{t.partners.requirementsLabel}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.partners.requirementsTitle}</h2>
          <p className={`mt-3 ${marketingSubtext}`}>{t.partners.requirementsText}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.partners.requirements.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>{t.partners.benefitsLabel}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.partners.benefitsTitle}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.partners.benefits.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>{t.partners.networkLabel}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{t.partners.networkTitle}</h2>
          <p className={`mt-3 ${marketingSubtext}`}>{t.partners.networkText}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          {partnerClients.map((client) => (
            <div
              key={client.name}
              className={`flex min-h-[140px] items-center justify-center rounded-2xl border p-8 ${
                client.darkBg ? "border-slate-800 bg-slate-950" : "border-slate-200/70 bg-white"
              }`}
            >
              <Image
                src={client.logo}
                alt={`${client.name} logo`}
                width={280}
                height={120}
                className="max-h-24 w-auto object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <h2 className={marketingHeading}>{t.partners.faqTitle}</h2>
        </div>
        <div className="mt-8 max-w-3xl">
          <Faq items={t.partners.faqs} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2 className={marketingHeading}>{t.partners.applyTitle}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{t.partners.applyText}</p>
            <p className="mt-4 text-sm text-slate-500">
              {t.partners.endCustomers}{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                {t.partners.startTrial} <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
          <PartnerContactForm />
        </div>
      </Section>
    </MarketingShell>
  );
}
