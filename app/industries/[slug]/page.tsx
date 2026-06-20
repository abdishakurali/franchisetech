import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { BrowserFrame } from "@/components/marketing/DeviceFrames";
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

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const raw = findPage(industryPages, (await params).slug);
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
            { "@type": "ListItem", position: 1, name: t.seoPage.industriesBreadcrumb, item: `${SITE_URL}/industries` },
            { "@type": "ListItem", position: 2, name: page.title, item: `${SITE_URL}${page.path}` },
          ],
        }}
      />

      {page.image && (
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
          <Image src={page.image} alt={page.h1} fill className="object-cover" priority unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">{page.eyebrow}</p>
              <h1 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-4xl">{page.h1}</h1>
            </div>
          </div>
        </div>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {!page.image && (
            <>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{page.eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{page.h1}</h1>
            </>
          )}
          <p className={`max-w-2xl text-lg text-slate-600 ${page.image ? "" : "mt-5"}`}>{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              {t.seoPage.getStarted}
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {t.cta.seePricing}
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {page.bullets.map((bullet) => (
              <div key={bullet} className="flex gap-3 rounded-xl border border-slate-200 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="grid gap-5">
            {page.sections.map((section) => (
              <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
          <BrowserFrame src="/showcase/pos-cart.png" alt={`franchisetech POS — ${page.eyebrow}`} path="/app/pos" fit="contain" />
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
            <h2 className="font-bold text-slate-950">{t.seoPage.relevantFeatures}</h2>
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
