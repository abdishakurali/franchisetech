import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SkagLandingShell } from "@/components/marketing/SkagLandingShell";
import { Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { JsonLd } from "@/components/marketing/JsonLd";
import { RaportXLandingRedesign } from "@/components/marketing/RaportXLandingRedesign";
import { RaportZLandingRedesign } from "@/components/marketing/RaportZLandingRedesign";
import { WhyOwnersChoose } from "@/components/marketing/WhyOwnersChoose";
import { OwnerZReportProof } from "@/components/marketing/OwnerProofScreens";
import { ro } from "@/lib/marketing/i18n/ro";
import { SITE_URL } from "@/lib/marketing/seo";
import { marketingCard, marketingCtaPrimary, marketingCtaSecondary, marketingHeroBg, marketingHeroRadial } from "@/lib/marketing/tokens";
import { skagLandingPages, findSkagPage } from "@/lib/marketing/skag-landing-pages";

// Google Ads SKAG landing pages — Romanian, one per keyword (Campaigns.md Step 3).
// Content is fixed to Romanian regardless of detected locale: visitors here arrive
// from Romanian-language search queries, so H1 must match the ad headline word-for-word.

export function generateStaticParams() {
  return skagLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = findSkagPage((await params).slug);
  if (!page) return {};
  return {
    title: `${page.h1} — franchisetech`,
    description: page.metaDescription,
    alternates: { canonical: `/lp/${page.slug}` },
    robots: { index: false, follow: false },
  };
}

export default async function SkagLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const page = findSkagPage((await params).slug);
  if (!page) notFound();

  // Ad platforms auto-tag the landing URL with a click ID — it must survive the hop
  // to /signup or the conversion upload (lib/analytics/server-conversions.ts) has
  // nothing to attach the trial/paid conversion to. fbclid matters most here: Meta
  // is the channel actually driving this traffic, and its CAPI `fbc` match key is
  // built from it. The inbound utm_* tags are forwarded too rather than overwritten,
  // so a Meta visit is not misreported to /signup as google/cpc.
  const sp = await searchParams;
  const forwarded = new URLSearchParams();
  for (const key of ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid"] as const) {
    const value = sp[key];
    if (typeof value === "string" && value) forwarded.set(key, value);
  }
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
    const value = sp[key];
    if (typeof value === "string" && value) forwarded.set(key, value);
  }
  // Fall back to the SKAG defaults only when the visit arrived untagged.
  if (!forwarded.has("utm_source")) forwarded.set("utm_source", "google");
  if (!forwarded.has("utm_medium")) forwarded.set("utm_medium", "cpc");
  if (!forwarded.has("utm_campaign")) forwarded.set("utm_campaign", page.slug);
  const signupHref = `/signup?plan=starter&${forwarded.toString()}`;

  // Slugs with a purpose-built page. Everything else falls through to the generic
  // SKAG template below.
  const Redesign =
    page.slug === "raport-z-casa-de-marcat"
      ? RaportZLandingRedesign
      : page.slug === "raport-x-casa-de-marcat"
        ? RaportXLandingRedesign
        : null;

  if (Redesign) {
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "franchisetech",
            applicationCategory: "BusinessApplication",
            url: `${SITE_URL}/lp/${page.slug}`,
          }}
        />
        <MarketingShell>
          <Redesign signupHref={signupHref} />
        </MarketingShell>
      </>
    );
  }

  return (
    <SkagLandingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "franchisetech",
          applicationCategory: "BusinessApplication",
          url: `${SITE_URL}/lp/${page.slug}`,
        }}
      />
      <section className={`relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24 ${marketingHeroBg}`}>
        <div className={`pointer-events-none absolute inset-0 ${marketingHeroRadial}`} />
        <div className="relative mx-auto max-w-3xl text-center">
          <SectionLabel>franchisetech</SectionLabel>
          {/* H1 must match the ad headline word-for-word — Quality Score + user trust */}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {page.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {page.subhead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={signupHref}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition sm:w-auto sm:py-3 ${marketingCtaPrimary}`}
            >
              Începe proba de 15 zile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition sm:w-auto sm:py-3 ${marketingCtaSecondary}`}
            >
              Vezi prețurile
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Verificare card 1 € · anulezi oricând · suport în limba română
          </p>
          <p className="mt-3 text-sm font-medium text-slate-600">{ro.home.hero.socialProof}</p>
        </div>
        <div className="relative mx-auto mt-12 max-w-4xl px-4 sm:px-0">
          <OwnerZReportProof />
        </div>
      </section>

      <Section tone="slate">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {page.trustSignals.map((signal) => (
            <div key={signal} className={`${marketingCard} p-6 text-center`}>
              <Check className="mx-auto h-5 w-5 text-blue-600" />
              <p className="mt-3 text-sm font-medium text-slate-700">{signal}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <WhyOwnersChoose
          heading={ro.whyOwners.heading}
          items={ro.whyOwners.items}
          screenshotCaption={ro.whyOwners.screenshotCaption}
        />
      </Section>

      <Section tone="slate">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Gata în câteva minute, nu în câteva zile
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Configurați produsele, deschideți tura și faceți prima vânzare test — fără instalare,
            merge pe orice tabletă sau calculator. Suport în limba română pe tot parcursul probei.
          </p>
          <div className="mt-8">
            <Link
              href={signupHref}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition ${marketingCtaPrimary}`}
            >
              Începe proba de 15 zile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
    </SkagLandingShell>
  );
}
