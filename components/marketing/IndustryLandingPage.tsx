import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaRow, FinalCta } from "@/components/marketing/MarketingCta";
import { HeroHeadline } from "@/components/marketing/HeroHeadline";
import { MarketingBrowserShot } from "@/components/marketing/MarketingBrowserShot";
import { OwnerPosProof } from "@/components/marketing/OwnerProofScreens";
import { SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { marketingCard, marketingHeroBg, marketingHeroRadial, marketingSubtext } from "@/lib/marketing/tokens";
import type { SeoPage } from "@/lib/marketing/seo";
import { comparisonPages } from "@/lib/marketing/comparisons";
import { isPrimaryIndustrySlug } from "@/lib/marketing/industry-verticals";

type IndustryUi = {
  painTitle: string;
  featuresTitle: string;
  compareTitle: string;
  compareLink: string;
  getStarted: string;
  seePricing: string;
  faq: string;
  relevantFeatures: string;
};

type IndustryLandingPageProps = {
  page: SeoPage;
  ui: IndustryUi;
};

function resolveHeadline(page: SeoPage) {
  if (page.heroHighlight) {
    return {
      before: page.heroBefore ?? "",
      highlight: page.heroHighlight,
      after: page.heroAfter ?? "",
    };
  }
  return { before: "", highlight: page.h1, after: "" };
}

export function IndustryLandingPage({ page, ui }: IndustryLandingPageProps) {
  const useVerticalLayout = isPrimaryIndustrySlug(page.slug) && Boolean(page.painPoints?.length);
  const headline = resolveHeadline(page);
  const showcase = page.showcase ?? (page.image ? { src: page.image, path: "/app", alt: page.h1 } : null);
  const competitorSlug = page.competitorSlug;
  const compareHref = competitorSlug ? `/compare/${competitorSlug}` : "/compare";
  const competitorName =
    comparisonPages.find((p) => p.slug === competitorSlug)?.competitor ?? competitorSlug ?? "Alternative";

  if (!useVerticalLayout) {
    return <LegacyIndustryLayout page={page} ui={ui} />;
  }

  return (
    <>
      <section className={`relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24 ${marketingHeroBg}`}>
        <div className={`pointer-events-none absolute inset-0 ${marketingHeroRadial}`} />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-10 xl:gap-14">
          <div className="w-full shrink-0 text-center lg:max-w-md lg:text-left xl:max-w-lg">
            <SectionLabel>{page.eyebrow}</SectionLabel>
            {page.heroHighlight ? (
              <HeroHeadline before={headline.before} highlight={headline.highlight} after={headline.after} />
            ) : (
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[2.75rem] lg:leading-[1.12]">
                {page.h1}
              </h1>
            )}
            <p className={`mt-4 ${marketingSubtext}`}>{page.heroSubheadline ?? page.intro}</p>
            <div className="mt-7">
              <CtaRow secondaryHref="/pricing" className="justify-center lg:justify-start" />
            </div>
          </div>
          {showcase ? (
            <div className="w-full min-w-0 flex-1 lg:max-w-none">
              <div className="rotate-[1.25deg] transition-transform duration-500 hover:rotate-0 lg:rotate-[1.75deg]">
                {"component" in showcase ? (
                  <showcase.component />
                ) : (
                  <MarketingBrowserShot
                    src={showcase.src}
                    alt={showcase.alt}
                    path={showcase.path}
                    chrome
                    priority
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {page.painPoints && page.painPoints.length > 0 ? (
        <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl lg:text-left">
              {ui.painTitle.replace("{industry}", page.eyebrow.toLowerCase())}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {page.painPoints.map((pain) => (
                <div key={pain.title} className={`p-6 ${marketingCard}`}>
                  <h3 className="text-lg font-semibold text-foreground">{pain.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mid">{pain.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.featureRows && page.featureRows.length > 0 ? (
        <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            <h2 className="sr-only">{ui.featuresTitle}</h2>
            {page.featureRows.map((row, i) => (
              <div
                key={row.title}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                <div>
                  <h3 className="text-xl font-bold text-foreground sm:text-2xl">{row.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-mid sm:text-base">{row.body}</p>
                </div>
                {"component" in row ? (
                  <row.component />
                ) : (
                  <MarketingBrowserShot
                    src={row.image}
                    alt={row.imageAlt}
                    path={row.path ?? "/app"}
                    chrome
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {page.competitorRows && page.competitorRows.length > 0 ? (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-2xl font-bold text-foreground">{ui.compareTitle}</h2>
              <Link href={compareHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brass hover:underline">
                {ui.compareLink} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 overflow-x-auto">
              <div className="min-w-[32rem] overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid grid-cols-3 bg-secondary px-4 py-3 text-sm font-bold text-foreground">
                  <span> </span>
                  <span>franchisetech</span>
                  <span>{competitorName}</span>
                </div>
                {page.competitorRows.map((row) => (
                  <div
                    key={row[0]}
                    className="grid grid-cols-3 gap-3 border-t border-border px-4 py-4 text-sm"
                  >
                    <strong className="pr-2">{row[0]}</strong>
                    <span className="text-foreground">{row[1]}</span>
                    <span className="text-muted-foreground">{row[2]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {page.testimonial ? (
        <section className="border-y border-border bg-accent/40 px-4 py-14 sm:px-6 lg:px-8">
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">&ldquo;{page.testimonial.quote}&rdquo;</p>
            <footer className="mt-4 text-sm text-muted-foreground">{page.testimonial.attribution}</footer>
          </blockquote>
        </section>
      ) : null}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{ui.faq}</h2>
            <div className="mt-6 space-y-5">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-border pb-5">
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-mid">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          {page.related.length > 0 ? (
            <aside className="h-fit rounded-xl border border-border p-5">
              <h2 className="font-bold text-foreground">{ui.relevantFeatures}</h2>
              <div className="mt-4 space-y-3">
                {page.related.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between text-sm font-medium text-brass hover:underline"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <FinalCta title={page.ctaTitle} />
      {page.ctaSubtitle ? (
        <p className="-mt-8 pb-12 text-center text-sm text-muted-foreground">{page.ctaSubtitle}</p>
      ) : null}
    </>
  );
}

/** Fallback for non-primary industry pages (romania, ireland, health-bars, etc.). */
function LegacyIndustryLayout({ page, ui }: IndustryLandingPageProps) {
  const HeroComponent = page.heroComponent;
  return (
    <>
      {HeroComponent ? (
        <div className="px-4 pb-2 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brass">{page.eyebrow}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.h1}</h1>
            <div className="mt-6 max-w-2xl">
              <HeroComponent />
            </div>
          </div>
        </div>
      ) : (
        page.image && (
          <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
            <img src={page.image} alt={page.h1} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-brass/70">{page.eyebrow}</p>
                <h1 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-4xl">{page.h1}</h1>
              </div>
            </div>
          </div>
        )
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {!page.image && !HeroComponent && (
            <>
              <p className="text-sm font-semibold uppercase tracking-wide text-brass">{page.eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{page.h1}</h1>
            </>
          )}
          <p className={`max-w-2xl text-lg text-mid ${page.image || HeroComponent ? "" : "mt-5"}`}>{page.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg bg-brass px-5 py-3.5 text-sm font-semibold text-ink hover:bg-brass/90 sm:w-auto"
            >
              {ui.getStarted}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center rounded-lg border border-border px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary sm:w-auto"
            >
              {ui.seePricing}
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {page.bullets.map((bullet) => (
              <div key={bullet} className="flex gap-3 rounded-xl border border-border p-4">
                <span className="text-sm font-medium text-foreground">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {page.sections.length > 0 ? (
        <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div className="grid gap-5">
              {page.sections.map((section) => (
                <div key={section.title} className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-mid">{section.body}</p>
                </div>
              ))}
            </div>
            <OwnerPosProof />
          </div>
        </section>
      ) : null}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground">{ui.faq}</h2>
          <div className="mt-6 space-y-5">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="border-b border-border pb-5">
                <h3 className="font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-mid">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
