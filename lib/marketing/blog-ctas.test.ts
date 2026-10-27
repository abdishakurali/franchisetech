import { describe, expect, it } from "vitest";
import { REGULATION_FEAR_CTAS, demoHref } from "./blog-ctas";
import { blogPosts } from "./blog";
import { featurePages } from "./seo";
import { isLeanPublicFeature } from "@/lib/product-scope";

const PUBLIC_NON_FEATURE = new Set(["/pricing", "/demo", "/contact"]);

describe("article CTAs", () => {
  // 2026-10-27: three CTAs pointed at feature pages hidden by product-scope and served 404.
  it("every CTA destination is a public route", () => {
    for (const [slug, cta] of Object.entries(REGULATION_FEAR_CTAS)) {
      if (cta.href.startsWith("/features/")) {
        const page = featurePages.find((p) => p.path === cta.href);
        expect(page, `${slug} → ${cta.href} is not a feature page`).toBeTruthy();
        expect(isLeanPublicFeature(page!.slug), `${slug} → ${cta.href} is hidden (404)`).toBe(true);
      } else {
        expect(PUBLIC_NON_FEATURE.has(cta.href), `${slug} → ${cta.href}`).toBe(true);
      }
    }
  });

  it("every CTA belongs to a published article", () => {
    const slugs = new Set(blogPosts.map((p) => p.slug));
    for (const slug of Object.keys(REGULATION_FEAR_CTAS)) {
      expect(slugs.has(slug), `no article ${slug}`).toBe(true);
    }
  });

  it("the five highest-traffic fiscal articles route readers to /demo", () => {
    for (const slug of [
      "e-obligatoriu-qr-code-pe-bonul-fiscal",
      "bon-fiscal-obligatoriu-cand-si-cum",
      "cum-anulezi-un-bon-fiscal-emis-gresit",
      "ce-este-raportul-z-si-cum-il-faci",
      "raport-x-vs-raport-z-diferenta",
    ]) {
      expect(REGULATION_FEAR_CTAS[slug]?.context, slug).toBeTruthy();
    }
  });

  it("demo links carry source article and CTA position", () => {
    expect(demoHref("ce-este-raportul-z-si-cum-il-faci", "blog_mid")).toBe("/demo?from=ce-este-raportul-z-si-cum-il-faci&cta=blog_mid");
  });

  it("CTA copy never claims franchisetech issues the receipt or the QR code", () => {
    for (const cta of Object.values(REGULATION_FEAR_CTAS)) {
      const text = `${cta.context ?? ""} ${cta.eyebrow} ${cta.body}`.toLowerCase();
      expect(text).not.toMatch(/franchisetech (emite|generează) (bonul|codul qr)/);
    }
  });
});
