import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { BrowserFrame } from "@/components/marketing/DeviceFrames";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, featurePages, findPage, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages, localizeSeoPage } from "@/lib/marketing/i18n";

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
  return featurePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const raw = findPage(featurePages, (await params).slug);
  if (!raw) return {};
  const page = localizeSeoPage(raw, locale);
  return pageMetadata(page, locale);
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "food-safety-records") {
    redirect("/features");
  }

  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const raw = findPage(featurePages, slug);
  if (!raw) notFound();
  const page = localizeSeoPage(raw, locale);

  return (
    <MarketingShell>
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

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{page.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{page.h1}</h1>
              <p className="mt-5 text-lg text-slate-600">{page.intro}</p>
              <ul className="mt-6 space-y-3">
                {page.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-slate-700">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  {t.seoPage.getStarted}
                </Link>
                <Link href="/features" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {t.seoPage.allFeatures}
                </Link>
              </div>
            </div>
            {page.image && (
              <BrowserFrame src={page.image} alt={page.h1} priority className="shadow-xl" path={featurePath(page.slug)} fit="contain" />
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-16">
          {page.sections.map((section, index) => (
            <div
              key={section.title}
              className={`grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </div>
              {page.image && index === 0 && (
                <BrowserFrame src={page.image} alt={section.title} path={featurePath(page.slug)} fit="contain" />
              )}
              {page.image && index === 1 && (
                <BrowserFrame src={page.image} alt={section.title} path={featurePath(page.slug)} fit="contain" />
              )}
              {index === 2 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-950">{t.seoPage.readyTitle}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t.seoPage.readyText}</p>
                  <Link href="/signup" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
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
            <h2 className="text-2xl font-bold text-slate-950">{t.seoPage.faq}</h2>
            <div className="mt-6 space-y-5">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-slate-100 pb-5">
                  <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-950">{t.seoPage.related}</h2>
            <div className="mt-4 space-y-3">
              {page.related.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center justify-between text-sm font-medium text-blue-600 hover:underline">
                  {link.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <CTASection />
    </MarketingShell>
  );
}
