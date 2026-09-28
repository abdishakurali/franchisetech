import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, SectionLabel } from "@/components/marketing/MarketingShell";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { BlogTopicHeader } from "@/components/marketing/BlogTopicHeader";
import { JsonLd } from "@/components/marketing/JsonLd";
import { marketingCard, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { blogPosts } from "@/lib/marketing/blog";
import { SITE_URL } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "Blog — Resurse pentru cafenele și restaurante",
  description:
    "Ghiduri practice pentru proprietarii de cafenele și restaurante din România: raport Z, NIR, rețete, contabilitate, gestiune stoc.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <ClaudeMarketingShellAuth>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: "Blog", item: `${SITE_URL}/blog` }],
        }}
      />

      <section className="bg-gradient-to-b from-secondary/80 to-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Resurse</SectionLabel>
          <h1 className={`mt-4 max-w-3xl ${marketingHeading}`}>Ghiduri pentru HoReCa</h1>
          <p className={`mt-4 max-w-2xl ${marketingSubtext}`}>
            Articole practice despre raport Z, NIR, rețete, gestiune stoc și contabilitate pentru cafenele și restaurante din România.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={`group flex flex-col overflow-hidden ${marketingCard}`}>
                <BlogTopicHeader post={post} size="card" variant="embedded" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-brass">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-base font-semibold text-foreground group-hover:text-brass">{post.title}</h2>
                  <p className="flex-1 text-sm leading-6 text-muted-foreground">{post.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <time className="text-xs text-muted-foreground" dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brass">
                      Citește <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </ClaudeMarketingShellAuth>
  );
}
