import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { blogPosts } from "@/lib/marketing/blog";
import { SITE_URL } from "@/lib/marketing/seo";

/**
 * Posts where a reader arrived anxious about a fine, an inspection, or being
 * out of compliance — not browsing features. Real traffic data (PostHog,
 * 2026-08-25) shows this exact cluster is what actually converts: lowest
 * bounce rates on the site sit on these topics, not on feature pages. Each
 * gets a CTA naming the specific record-keeping franchisetech actually
 * provides for that fear — never "we make you compliant" (the product
 * doesn't interpret law), only the concrete thing it keeps organised that
 * makes a control or a mistake easier to survive.
 */
const REGULATION_FEAR_CTAS: Record<string, { eyebrow: string; body: string; href: string; label: string }> = {
  "bon-fiscal-obligatoriu-cand-si-cum": {
    eyebrow: "Din regula fiscală în fluxul de lucru",
    body: "În franchisetech, bonul fiscal nu este o promisiune generică: vânzarea din POS păstrează produsele, TVA-ul, metoda de plată, statusul FiscalNet și datele pentru raportul Z într-un singur loc.",
    href: "/features/qr-code-receipts",
    label: "Vezi fluxul de bon fiscal",
  },
  "cum-anulezi-un-bon-fiscal-emis-gresit": {
    eyebrow: "Anulările rămân în evidență, nu în memorie",
    body: "O anulare sau un retur greșit gestionat e exact genul de neconcordanță pe care un control fiscal o caută. În franchisetech, fiecare anulare trece prin POS și rămâne înregistrată cu utilizatorul și ora, nu doar notată verbal.",
    href: "/features/pos",
    label: "Vezi cum funcționează POS-ul",
  },
  "program-legal-de-lucru-horeca-romania": {
    eyebrow: "Nu ținem evidența legală a orelor — dar simplificăm rotația",
    body: "franchisetech nu înlocuiește pontajul sau un specialist în legislația muncii. Ce oferă real: personal nelimitat pe plan, fără taxă per angajat, ca rotația de ture să nu coste extra de fiecare dată când adaugi un casier.",
    href: "/pricing",
    label: "Vezi planurile cu personal nelimitat",
  },
  "conectare-casa-marcat-anaf-erori-frecvente": {
    eyebrow: "Starea fiecărui bon, vizibilă înainte să devină problemă",
    body: "franchisetech arată starea fiecărui bon trimis prin FiscalNet — trimis, în așteptare sau eșuat — cu reîncercare directă din POS, nu abia descoperită la o reconciliere de sfârșit de lună.",
    href: "/features/qr-code-receipts",
    label: "Vezi statusul bonurilor fiscale",
  },
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.image ? { images: [{ url: `${SITE_URL}${post.image}`, width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          author: { "@type": "Organization", name: "franchisetech" },
          publisher: { "@type": "Organization", name: "franchisetech", url: SITE_URL },
          ...(post.image ? { image: `${SITE_URL}${post.image}` } : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE_URL}/blog` },
            { "@type": "ListItem", position: 2, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
          ],
        }}
      />

      <article className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Blog
          </Link>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-lg leading-7 text-slate-600">{post.description}</p>

          <time className="mt-3 block text-sm text-slate-400" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
          </time>

          {post.image && (
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-100">
              <Image src={post.image} alt={post.title} width={800} height={450} className="w-full object-cover" />
            </div>
          )}

          <div className="mt-10 space-y-10">
            {post.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xl font-bold text-slate-900">{section.heading}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.split("\n\n").map((para, i) => {
                    if (para.startsWith("- ")) {
                      const items = para.split("\n").filter((l) => l.startsWith("- "));
                      return (
                        <ul key={i} className="space-y-1.5 pl-4">
                          {items.map((item, j) => (
                            <li key={j} className="flex gap-2 text-sm leading-6 text-slate-600">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                              <span dangerouslySetInnerHTML={{ __html: item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p
                        key={i}
                        className="text-sm leading-7 text-slate-600"
                        dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {(() => {
            const fearCta = REGULATION_FEAR_CTAS[post.slug];
            if (fearCta) {
              return (
                <div className="mt-12 rounded-lg border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                  <p className="text-sm font-semibold text-slate-900">{fearCta.eyebrow}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{fearCta.body}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={fearCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      {fearCta.label} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/signup?plan=starter"
                      className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:border-blue-300"
                    >
                      Deschide casa gratuit 15 zile
                    </Link>
                  </div>
                </div>
              );
            }
            if (post.relatedFeature) {
              return (
                <div className="mt-12 rounded-lg border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                  <p className="text-sm font-semibold text-slate-900">Funcționalitate în franchisetech</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Vrei să gestionezi asta direct din aplicație? franchisetech are această funcționalitate inclusă.
                  </p>
                  <Link
                    href={post.relatedFeature}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Descoperă funcționalitatea <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </article>

      <section className="border-t border-slate-100 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-base font-semibold text-slate-900">Mai multe articole</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {blogPosts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 4)
              .map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm hover:border-blue-200"
                >
                  <span className="font-medium text-slate-900 hover:text-blue-700">{related.title}</span>
                  <span className="text-xs text-slate-500 line-clamp-2">{related.description}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
