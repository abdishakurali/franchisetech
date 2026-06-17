import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { faqJsonLd, findPage, resourcePages, SITE_URL } from "@/lib/marketing/seo";

export function generateStaticParams() {
  return resourcePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = findPage(resourcePages, (await params).slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: { title: page.metaTitle, description: page.description, type: "article", url: page.path },
  };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = findPage(resourcePages, (await params).slug);
  if (!page) notFound();

  return (
    <MarketingShell>
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: page.title, description: page.description, author: { "@type": "Organization", name: "franchisetech" }, publisher: { "@type": "Organization", name: "franchisetech" }, mainEntityOfPage: `${SITE_URL}${page.path}` }} />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl">
          <Link href="/resources" className="text-sm font-medium text-blue-600 hover:underline">Resources</Link>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{page.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Start 15-day trial</Link><Link href="/features" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">See features</Link></div>
          <div className="mt-12 space-y-9">
            {page.sections.map((section) => <section key={section.title}><h2 className="text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-3 leading-8 text-slate-600">{section.body}</p></section>)}
          </div>
          <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
            
          </div>
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-950">FAQ</h2>
            <div className="mt-6 space-y-5">{page.faqs.map((faq) => <div key={faq.question} className="border-b border-slate-100 pb-5"><h3 className="font-semibold text-slate-950">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p></div>)}</div>
          </section>
          <section className="mt-12 rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-950">Related reading</h2>
            <div className="mt-4 space-y-3">{page.related.map((link) => <Link key={link.href} href={link.href} className="flex items-center justify-between text-sm font-medium text-blue-600 hover:underline">{link.label}<ArrowRight className="h-4 w-4" /></Link>)}</div>
          </section>
        </article>
      </section>
      <CTASection />
    </MarketingShell>
  );
}
