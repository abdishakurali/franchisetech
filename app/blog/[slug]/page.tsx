import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import {
  blogContentForLocale,
  blogLocaleKey,
  blogPosts,
  getBlogPost,
} from "@/lib/marketing/blog/posts";
import { localeAlternates } from "@/lib/marketing/site-locale";
import { marketingOpenGraphLocale, type MarketingLocale } from "@/lib/marketing/locale";
import { SITE_URL } from "@/lib/marketing/seo";

function readMinutesLabel(locale: MarketingLocale, n: number): string {
  if (locale === "ro") return `${n} min citire`;
  if (locale === "it") return `${n} min di lettura`;
  return `${n} min read`;
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  const content = blogContentForLocale(post, locale);
  const path = `/blog/${post.slug}`;
  return {
    title: content.metaTitle,
    description: content.description,
    alternates: localeAlternates(path, locale),
    openGraph: {
      title: content.metaTitle,
      description: content.description,
      url: path,
      type: "article",
      locale: marketingOpenGraphLocale(locale),
      publishedTime: post.publishedAt,
      images: [{ url: post.image, width: 1200, height: 750, alt: content.title }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  const content = blogContentForLocale(post, locale);
  const lk = blogLocaleKey(locale);
  const path = `/blog/${post.slug}`;

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: content.title,
          description: content.description,
          image: `${SITE_URL}${post.image}`,
          datePublished: post.publishedAt,
          author: { "@type": "Organization", name: "franchisetech" },
          publisher: { "@type": "Organization", name: "franchisetech", logo: { "@type": "ImageObject", url: `${SITE_URL}/franchise-tech-logo.png` } },
          inLanguage: locale === "ro" ? "ro-RO" : "en",
          mainEntityOfPage: `${SITE_URL}${path}`,
        }}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          ← {t.blog.backToBlog}
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{content.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {t.blog.published} {new Date(post.publishedAt).toLocaleDateString(locale === "ro" ? "ro-RO" : "en-IE", { year: "numeric", month: "long", day: "numeric" })}
          {" · "}{readMinutesLabel(locale, content.readMinutes)}
        </p>
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <Image
            src={post.image}
            alt={post.imageAlt[lk]}
            fill
            className="object-cover object-top"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
        <p className="mt-8 text-lg leading-relaxed text-slate-600">{content.excerpt}</p>
        <div className="mt-10 space-y-8">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center">
          <p className="font-semibold text-slate-900">{t.blog.ctaTitle}</p>
          <p className="mt-2 text-sm text-slate-600">{t.blog.ctaText}</p>
          <Link
            href="/signup"
            className="mt-4 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t.cta.startTrial}
          </Link>
        </div>
      </article>
    </MarketingShell>
  );
}
