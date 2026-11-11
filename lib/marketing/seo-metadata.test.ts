import { describe, expect, it } from "vitest";
import { blogPosts, relatedBlogPosts } from "@/lib/marketing/blog";
import { brandedTitle, pageMetadata, seoMeta } from "@/lib/marketing/seo";
import { localeAlternates } from "@/lib/marketing/site-locale";
import { allSitemapPaths } from "@/lib/marketing/sitemap-paths";

describe("brandedTitle", () => {
  it("opts titles that already name the brand out of the template", () => {
    expect(brandedTitle("POS cafenea | franchisetech")).toEqual({ absolute: "POS cafenea | franchisetech" });
    expect(brandedTitle("Prețuri POS fiscal pentru afaceri mici")).toBe("Prețuri POS fiscal pentru afaceri mici");
  });

  it("is applied by pageMetadata and seoMeta, which also always set an og:image", () => {
    const page = pageMetadata({ metaTitle: "X | franchisetech", description: "d", path: "/x" }, "ro");
    expect(page.title).toEqual({ absolute: "X | franchisetech" });
    expect(page.openGraph?.images).toBeTruthy();
    const meta = seoMeta({ title: "Y | franchisetech", description: "d", path: "/y", locale: "ro" });
    expect(meta.title).toEqual({ absolute: "Y | franchisetech" });
    expect(JSON.stringify(meta.openGraph?.images)).not.toContain("/marketing/live/pos.png");
  });
});

describe("localeAlternates", () => {
  it("returns only the clean canonical (no hreflang pointing at ?lang= duplicates)", () => {
    expect(localeAlternates("/pricing", "ro")).toEqual({ canonical: "/pricing" });
    expect(localeAlternates("/", "en")).toEqual({ canonical: "/" });
  });
});

describe("relatedBlogPosts", () => {
  it("never returns the post itself and prefers shared tags", () => {
    const post = blogPosts.find((p) => p.slug === "inventar-fizic-vs-scriptic-diferente")!;
    const related = relatedBlogPosts(post, 4);
    expect(related).toHaveLength(4);
    expect(related.map((p) => p.slug)).not.toContain(post.slug);
    expect(related.every((p) => p.tags.some((t) => post.tags.includes(t)))).toBe(true);
  });

  it("spreads footer links across many posts instead of the same four", () => {
    const linked = new Set(blogPosts.flatMap((p) => relatedBlogPosts(p, 4).map((r) => r.slug)));
    expect(linked.size).toBeGreaterThan(20);
  });
});

describe("sitemap paths", () => {
  it("lists every blog post with its publish date and leaves out /login", () => {
    const entries = allSitemapPaths();
    for (const post of blogPosts) {
      const entry = entries.find((e) => e.path === `/blog/${post.slug}`);
      expect(entry?.lastModified).toBe(post.publishedAt);
    }
    expect(entries.some((e) => e.path === "/login")).toBe(false);
    expect(entries.some((e) => e.path === "/pricing")).toBe(true);
    expect(entries.some((e) => e.path === "/industries/cafes")).toBe(true);
  });
});
