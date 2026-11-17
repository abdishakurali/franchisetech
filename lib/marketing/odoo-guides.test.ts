import { describe, expect, it } from "vitest";
import { ODOO_GUIDES, getOdooGuide } from "./odoo-guides";
import { allSitemapPaths } from "./sitemap-paths";

describe("Odoo guides", () => {
  it("has five guides with unique, URL-safe slugs", () => {
    expect(ODOO_GUIDES).toHaveLength(5);
    const slugs = ODOO_GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("never claims partner or certified status", () => {
    for (const guide of ODOO_GUIDES) {
      const text = [guide.title, guide.description, guide.body, guide.sources, guide.closing].join("\n");
      expect(text).not.toMatch(/partner status|odoo partner|certified/i);
    }
  });

  it("keeps a sources line, a closing line and no unfilled placeholders", () => {
    for (const guide of ODOO_GUIDES) {
      expect(guide.sources.startsWith("Sources:")).toBe(true);
      expect(guide.closing.length).toBeGreaterThan(0);
      expect(`${guide.body}\n${guide.closing}`).not.toContain("[link");
      expect(guide.body.startsWith(guide.description)).toBe(true);
    }
  });

  it("is listed in the sitemap and found by slug", () => {
    const paths = new Set(allSitemapPaths().map((entry) => entry.path));
    for (const guide of ODOO_GUIDES) {
      expect(paths.has(`/odoo/guides/${guide.slug}`)).toBe(true);
      expect(getOdooGuide(guide.slug)).toBe(guide);
    }
    expect(getOdooGuide("missing")).toBeUndefined();
  });
});
