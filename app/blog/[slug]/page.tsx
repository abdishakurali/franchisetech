import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { CTASection } from "@/components/marketing/MarketingShell";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { BlogTopicHeader } from "@/components/marketing/BlogTopicHeader";
import { BlogCtaLink } from "@/components/marketing/BlogCtaLink";
import { JsonLd } from "@/components/marketing/JsonLd";
import { blogPosts } from "@/lib/marketing/blog";
import { SITE_URL } from "@/lib/marketing/seo";
import { REGULATION_FEAR_CTAS, demoHref } from "@/lib/marketing/blog-ctas";

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
      // No image here on purpose — Next.js's file-convention opengraph-image.tsx
      // (this same directory) is picked up automatically and takes precedence.
      // It renders the post's own topic icon + title server-side, so every post
      // gets a real, always-accurate share image with nothing to source or go
      // stale, instead of reusing the old screenshot set's pre-pivot demo data.
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  const fearCta = REGULATION_FEAR_CTAS[post.slug];

  return (
    <ClaudeMarketingShellAuth>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          author: { "@type": "Organization", name: "franchisetech" },
          publisher: { "@type": "Organization", name: "franchisetech", url: SITE_URL },
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

          <BlogTopicHeader post={post} size="hero" className="mt-8" />

          <div className="mt-10 space-y-10">
            {post.sections.map((section, sectionIndex) => (
              <div key={section.heading}>
                {/* Mid-article CTA: most readers leave after the opening answer, so the bottom box alone is rarely seen. */}
                {fearCta && sectionIndex === 1 && (
                  <div className="mb-10 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-sm font-semibold text-slate-900">{fearCta.context ?? fearCta.eyebrow}</p>
                    <BlogCtaLink
                      href={fearCta.context ? demoHref(post.slug, "blog_mid") : fearCta.href}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                      ctaType="primary"
                      ctaLocation="blog_mid"
                      ctaText={fearCta.context ? "Solicitați o demonstrație" : fearCta.label}
                      blogSlug={post.slug}
                    >
                      {fearCta.context ? "Solicitați o demonstrație" : fearCta.label} <ArrowRight className="h-4 w-4" />
                    </BlogCtaLink>
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-900">{section.heading}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.split("\n\n").map((para, i) => {
                    // Product screenshots: a paragraph that is exactly ![alt](/marketing/…). Local files only.
                    const image = para.match(/^!\[([^\]]+)\]\((\/marketing\/[\w./-]+\.(?:png|jpg|jpeg|webp))\)$/);
                    if (image) {
                      return (
                        <Image
                          key={i}
                          src={image[2]}
                          alt={image[1]}
                          width={1440}
                          height={900}
                          sizes="(min-width: 768px) 768px, 100vw"
                          className="rounded-lg border border-slate-200"
                        />
                      );
                    }
                    if (para.startsWith("- ")) {
                      const items = para.split("\n").filter((l) => l.startsWith("- "));
                      return (
                        <ul key={i} className="space-y-1.5 pl-4">
                          {items.map((item, j) => (
                            <li key={j} className="flex gap-2 text-sm leading-6 text-slate-600">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                              <span dangerouslySetInnerHTML={{ __html: item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-700">$1</a>') }} />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p
                        key={i}
                        className="text-sm leading-7 text-slate-600"
                        dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-700">$1</a>') }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {(() => {
            if (fearCta) {
              return (
                <div className="mt-12 rounded-lg border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                  <p className="text-sm font-semibold text-slate-900">{fearCta.eyebrow}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{fearCta.body}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    {fearCta.context ? (
                      <BlogCtaLink
                        href={demoHref(post.slug, "blog_end")}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        ctaType="primary"
                        ctaLocation="blog_end"
                        ctaText="Solicitați o demonstrație gratuită"
                        blogSlug={post.slug}
                      >
                        Solicitați o demonstrație gratuită <ArrowRight className="h-4 w-4" />
                      </BlogCtaLink>
                    ) : null}
                    <BlogCtaLink
                      href={fearCta.href}
                      className={fearCta.context
                        ? "inline-flex items-center justify-center rounded-md border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:border-blue-300"
                        : "inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"}
                      ctaType={fearCta.context ? "secondary" : "primary"}
                      ctaLocation="blog_end"
                      ctaText={fearCta.label}
                      blogSlug={post.slug}
                    >
                      {fearCta.label}
                    </BlogCtaLink>
                  </div>
                </div>
              );
            }
            if (post.relatedFeature) {
              return (
                <div className="mt-12 rounded-lg border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                  <p className="text-sm font-semibold text-slate-900">Funcționalitate în franchisetech</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Vedeți ce înregistrează franchisetech pentru acest subiect și ce rămâne în sarcina casei de marcat sau a contabilului.
                  </p>
                  <BlogCtaLink
                    href={post.relatedFeature}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                    ctaType="primary"
                    ctaLocation="blog_related_feature"
                    ctaText="Descoperă funcționalitatea"
                    blogSlug={post.slug}
                  >
                    Descoperă funcționalitatea <ArrowRight className="h-4 w-4" />
                  </BlogCtaLink>
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
    </ClaudeMarketingShellAuth>
  );
}
