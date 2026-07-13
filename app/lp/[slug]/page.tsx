import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingShell, Section, SectionLabel } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingBrowserShot } from "@/components/marketing/MarketingBrowserShot";
import { WhyOwnersChoose } from "@/components/marketing/WhyOwnersChoose";
import { showcaseAssets } from "@/lib/marketing/showcase";
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

  // Google auto-tags the ad's landing URL with gclid — must forward it to /signup
  // or the offline conversion upload (lib/analytics/server-conversions.ts) has
  // nothing to attach the trial/paid conversion to.
  const sp = await searchParams;
  const clickIdParams = new URLSearchParams();
  for (const key of ["gclid", "gbraid", "wbraid"] as const) {
    const value = sp[key];
    if (typeof value === "string" && value) clickIdParams.set(key, value);
  }
  const signupHref = `/signup?plan=starter&utm_source=google&utm_medium=cpc&utm_campaign=${page.slug}${
    clickIdParams.size ? `&${clickIdParams.toString()}` : ""
  }`;

  return (
    <MarketingShell>
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
          <MarketingBrowserShot
            src={showcaseAssets.posTableOrder.src}
            alt={ro.home.hero.tableOrderAlt}
            path={showcaseAssets.posTableOrder.path}
            chrome
            priority
          />
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
            Configurezi produsele, deschizi tura și faci prima vânzare test — fără instalare,
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
    </MarketingShell>
  );
}
