import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Faq, MarketingShell, Section, SectionLabel } from "@/components/marketing/MarketingShell";
import { PartnerContactForm } from "@/components/marketing/PartnerContactForm";
import { JsonLd } from "@/components/marketing/JsonLd";
import { partnerBenefits, partnerClients, partnerRequirements } from "@/lib/marketing/partners";
import { PARTNERS_DESCRIPTION, PARTNERS_TITLE, SITE_URL } from "@/lib/marketing/seo";
import { MARKETING_KEYWORDS, localeAlternates } from "@/lib/marketing/site-locale";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";

export const metadata: Metadata = {
  title: PARTNERS_TITLE,
  description: PARTNERS_DESCRIPTION,
  keywords: [...MARKETING_KEYWORDS, "POS reseller", "hospitality software partner"],
  alternates: localeAlternates("/partners"),
  openGraph: {
    title: PARTNERS_TITLE,
    description: PARTNERS_DESCRIPTION,
    url: `${SITE_URL}/partners`,
    locale: "en",
    images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750, alt: "franchisetech partner program" }],
  },
};

const faqs = [
  { question: "What does franchisetech handle vs the partner?", answer: "We run the platform, hosting, updates, and core support. You sell, onboard, and support clients locally." },
  { question: "Who is a good fit?", answer: "POS resellers, accountants, hospitality consultants, and multi-site operators with an existing food-business client base." },
  { question: "Is there a formal reseller agreement?", answer: "We discuss terms after your application. Commercial models can vary by volume." },
  { question: "How fast will you respond?", answer: "We aim to respond within 2 business days." },
];

export default function PartnersPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: "Partners", item: `${SITE_URL}/partners` }],
        }}
      />

      <section className="bg-gradient-to-b from-slate-50/80 to-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Partner program</SectionLabel>
          <h1 className={`mt-4 max-w-3xl ${marketingHeading}`}>
            Power your client network with a platform built for food businesses.
          </h1>
          <p className={`mt-5 max-w-2xl ${marketingSubtext}`}>
            franchisetech handles product, hosting, updates, and core support. You bring sales, onboarding, and long-term relationships.
          </p>
          <p className="mt-4 text-sm font-medium text-blue-600">We run the platform. You grow the network.</p>
        </div>
      </section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>Requirements</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>Who we partner with</h2>
          <p className={`mt-3 ${marketingSubtext}`}>You should already serve food businesses and be ready to onboard them on a modern SaaS stack.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {partnerRequirements.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-2xl">
          <SectionLabel>Benefits</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>What partners get</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {partnerBenefits.map((item) => (
            <div key={item.title} className={`p-6 ${marketingCard}`}>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <SectionLabel>Our network</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>Businesses on franchisetech</h2>
          <p className={`mt-3 ${marketingSubtext}`}>Operators already running daily service on the platform.</p>
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
          <h2 className={marketingHeading}>Partner FAQ</h2>
        </div>
        <div className="mt-8 max-w-3xl">
          <Faq items={faqs} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2 className={marketingHeading}>Apply to partner</h2>
            <p className={`mt-4 ${marketingSubtext}`}>
              Tell us about your network and how you serve food businesses. We respond within 2 business days.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              End customers:{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                start your trial <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
          <PartnerContactForm />
        </div>
      </Section>
    </MarketingShell>
  );
}
