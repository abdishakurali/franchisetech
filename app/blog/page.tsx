import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { getMarketingMessages } from "@/lib/marketing/i18n";
import { blogContentForLocale, blogPosts } from "@/lib/marketing/blog/posts";
import { localeAlternates } from "@/lib/marketing/site-locale";
import { marketingOpenGraphLocale, type MarketingLocale } from "@/lib/marketing/locale";

function readMinutesLabel(locale: MarketingLocale, n: number): string {
  if (locale === "ro") return `${n} min citire`;
  if (locale === "it") return `${n} min di lettura`;
  return `${n} min read`;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);
  return {
    title: t.blog.meta.title,
    description: t.blog.meta.description,
    alternates: localeAlternates("/blog", locale),
    openGraph: {
      title: t.blog.meta.title,
      description: t.blog.meta.description,
      locale: marketingOpenGraphLocale(locale),
      images: [{ url: "/showcase/reports-dashboard.png", width: 1200, height: 750 }],
    },
  };
}

export default async function BlogIndexPage() {
  const locale = await getMarketingLocale();
  const t = getMarketingMessages(locale);

  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{t.blog.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{t.blog.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{t.blog.subtitle}</p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {blogPosts.map((post) => {
            const content = blogContentForLocale(post, locale);
            const lk = locale === "ro" ? "ro" : "en";
            return (
              <article
                key={post.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={post.image}
                    alt={post.imageAlt[lk]}
                    fill
                    className="object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{content.eyebrow}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-700">
                      {content.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{content.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{readMinutesLabel(locale, content.readMinutes)}</span>
                    <Link href={`/blog/${post.slug}`} className="font-semibold text-blue-600 hover:text-blue-800">
                      {t.blog.readMore} →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </MarketingShell>
  );
}
