import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { comparisonPages } from "./comparisons";
import { compareSignupHref } from "./compare-locale";
import { getHomepageContent } from "./homepage-content";
import { localizeSeoPage, ro } from "./i18n";
import { industryPages } from "./seo";

// Public copy must match what the product sells today (Pro €49, Multi €79 +
// €29/extra location, 15-day no-card trial). The Free plan was retired on
// 2026-10-26 and the Core/Operations/Scale names before that.
const RETIRED = /\bplanul Free\b|\bFree 0€|\b0€ Free\b|din Free\b|\bOperations\b|\bScale\b/;

const PRIMARY = ["cafes", "restaurants", "takeaways", "patisserie-bakery"];

describe("public trust copy", () => {
  it("compare pages never offer a retired plan", () => {
    for (const page of comparisonPages) {
      expect(JSON.stringify(page), page.slug).not.toMatch(RETIRED);
    }
    expect(compareSignupHref("ebriza", "ro")).toContain("plan=growth");
  });

  it("every Romanian industry page shows current plans and no competitor price claims", () => {
    for (const raw of industryPages) {
      const slug = raw.slug;
      const page = localizeSeoPage(raw, "ro");
      const text = JSON.stringify({ ...page, featureRows: page.featureRows?.map(({ title, body }) => ({ title, body })) });
      expect(text, slug).not.toMatch(RETIRED);
      expect(text, slug).not.toContain("doar la ofertă");
      expect(text, slug).not.toContain("quote-only");
    }
  });

  it("Romanian primary industry pages have Romanian feature cards that keep their illustrations", () => {
    for (const slug of PRIMARY) {
      const raw = industryPages.find((p) => p.slug === slug)!;
      const page = localizeSeoPage(raw, "ro");
      expect(page.featureRows?.length, slug).toBe(raw.featureRows?.length);
      page.featureRows?.forEach((row, i) => {
        expect(row.title, slug).not.toBe(raw.featureRows![i].title);
        expect("component" in row || "image" in row, slug).toBe(true);
      });
    }
  });

  it("the comparison column is generic, not a named competitor", () => {
    expect(ro.industryLanding.compareColumn).toBe("POS clasic");
  });

  it("the homepage FAQ describes the real trial, not a permanent free plan", () => {
    const text = JSON.stringify([getHomepageContent("ro"), getHomepageContent("en")]);
    expect(text).not.toMatch(/Planul Free|never expires|nu expiră/);
    expect(text).toContain("15 zile");
  });

  it("legal pages are in Romanian and name the operator", () => {
    for (const file of ["app/terms/page.tsx", "app/privacy/page.tsx", "app/legal-disclaimer/page.tsx"]) {
      const src = readFileSync(file, "utf8");
      expect(src, file).toContain('lang="ro"');
      expect(src, file).not.toMatch(/Last updated|Terms of Service|Privacy Policy|Contact us at|We may /);
    }
    for (const file of ["app/terms/page.tsx", "app/privacy/page.tsx"]) {
      expect(readFileSync(file, "utf8"), file).toContain("DATA_CONTROLLER.legalName");
    }
  });
});
