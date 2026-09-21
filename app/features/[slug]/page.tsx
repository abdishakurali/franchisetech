import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { CTASection } from "@/components/marketing/MarketingShell";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { BrowserFrame } from "@/components/marketing/DeviceFrames";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, featurePages, findPage, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages, localizeSeoPage } from "@/lib/marketing/i18n";
import { isLeanPublicFeature } from "@/lib/product-scope";

function featurePath(slug: string): string {
  const paths: Record<string, string> = {
    pos: "/app/pos",
    "kitchen-display": "/app/kitchen",
    "stock-management": "/app/stock",
    "recipe-costing": "/app/recipes",
    "z-report": "/app/reports/z-report",
    "purchases-suppliers": "/app/suppliers",
    "setup-onboarding": "/app/setup-checklist",
    nir: "/app/purchases",
    offline: "/app/pos",
    "qr-code-receipts": "/help/romania-fiscalnet",
    "accountant-reports": "/app/reports/gestiune",
  };
  return paths[slug] ?? "/app";
}

export function generateStaticParams() {
  return featurePages.filter((page) => isLeanPublicFeature(page.slug)).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const slug = (await params).slug;
  if (!isLeanPublicFeature(slug)) return {};
  const raw = findPage(featurePages, slug);
  if (!raw) return {};
  const page = localizeSeoPage(raw, locale);
  return pageMetadata(page, locale);
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLeanPublicFeature(slug)) notFound();
  if (slug === "food-safety-records") {
    redirect("/features");
  }

  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const raw = findPage(featurePages, slug);
  if (!raw) notFound();
  const page = localizeSeoPage(raw, locale);

  return (
    <ClaudeMarketingShellAuth>
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t.seoPage.featuresBreadcrumb, item: `${SITE_URL}/features` },
            { "@type": "ListItem", position: 2, name: page.title, item: `${SITE_URL}${page.path}` },
          ],
        }}
      />

      <section className="relative overflow-hidden bg-[#0D0F0E] px-4 py-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_78%_0%,rgba(22,93,252,0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#5B9CFF]">{page.eyebrow}</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[#FAF8F4] sm:text-5xl">{page.h1}</h1>
              <p className="mt-5 text-lg text-[#FAF8F4]/72">{page.intro}</p>
              <ul className="mt-6 space-y-3">
                {page.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-[#FAF8F4]/80">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#5B9CFF]" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-[10px] bg-[#165DFC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3E7BFF]">
                  {t.seoPage.getStarted}
                </Link>
                <Link href="/features" className="rounded-[10px] border border-white/24 px-5 py-3 text-sm font-semibold text-[#FAF8F4] hover:border-white">
                  {t.seoPage.allFeatures}
                </Link>
              </div>
            </div>
            {page.heroComponent ? (
              <page.heroComponent />
            ) : (
              page.image && (
                <BrowserFrame src={page.image} alt={page.h1} priority className="shadow-xl" path={featurePath(page.slug)} fit="contain" />
              )
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#F3F0E8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-16">
          {page.sections.map((section, index) => (
            <div
              key={section.title}
              className={`grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5B5D57]">{section.body}</p>
              </div>
              {(index === 0 || index === 1) &&
                (page.heroComponent ? (
                  <page.heroComponent />
                ) : (
                  page.image && (
                    <BrowserFrame src={page.image} alt={section.title} path={featurePath(page.slug)} fit="contain" />
                  )
                ))}
              {index === 2 && (
                <div className="rounded-2xl border border-[#DFDCD2] bg-white p-6">
                  <h3 className="font-semibold text-[#0D0F0E]">{t.seoPage.readyTitle}</h3>
                  <p className="mt-2 text-sm text-[#5B5D57]">{t.seoPage.readyText}</p>
                  <Link href="/signup" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#165DFC] hover:underline">
                    {t.seoPage.getStarted} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E]">{t.seoPage.faq}</h2>
            <div className="mt-6 space-y-5">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-[#DFDCD2] pb-5">
                  <h3 className="font-semibold text-[#0D0F0E]">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#DFDCD2] p-5">
            <h2 className="font-semibold text-[#0D0F0E]">{t.seoPage.related}</h2>
            <div className="mt-4 space-y-3">
              {page.related.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center justify-between text-sm font-medium text-[#165DFC] hover:underline">
                  {link.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <CTASection />
    </ClaudeMarketingShellAuth>
  );
}
