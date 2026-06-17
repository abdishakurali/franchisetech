import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, featurePages, findPage, pageMetadata, SITE_URL } from "@/lib/marketing/seo";

export function generateStaticParams() {
  return featurePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = findPage(featurePages, (await params).slug);
  if (!page) return {};
  return pageMetadata(page);
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = findPage(featurePages, (await params).slug);
  if (!page) notFound();

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Features", item: `${SITE_URL}/features` },
        { "@type": "ListItem", position: 2, name: page.title, item: `${SITE_URL}${page.path}` },
      ] }} />

      {/* Hero */}
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
                <Link href="/signup" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Start 15-day trial</Link>
                <Link href="/features" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">All features</Link>
              </div>
            </div>
            {page.image && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
                <Image
                  src={page.image}
                  alt={page.h1}
                  width={1400}
                  height={900}
                  className="w-full object-cover"
                  priority
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {page.sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ + sidebar */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">FAQ</h2>
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
            <h2 className="font-bold text-slate-950">Related</h2>
            <div className="mt-4 space-y-3">
              {page.related.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center justify-between text-sm font-medium text-blue-600 hover:underline">
                  {link.label}<ArrowRight className="h-4 w-4" />
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
