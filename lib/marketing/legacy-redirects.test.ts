import { describe, expect, it } from "vitest";
import { LEGACY_REDIRECTS } from "./legacy-redirects";
import { blogPosts } from "./blog";
import { comparisonPages } from "./comparisons";

const liveBlog = new Set(blogPosts.map((p) => `/blog/${p.slug}`));
const liveCompare = new Set(comparisonPages.map((p) => p.path));
const liveStatic = new Set(["/compare", "/industries", "/help", "/pricing", "/demo"]);

describe("legacy redirects", () => {
  it("every destination is a live page", () => {
    for (const [source, destination] of Object.entries(LEGACY_REDIRECTS)) {
      const live = liveBlog.has(destination) || liveCompare.has(destination) || liveStatic.has(destination);
      expect(live, `${source} → ${destination} is not live`).toBe(true);
    }
  });

  it("never shadows a live page", () => {
    for (const source of Object.keys(LEGACY_REDIRECTS)) {
      expect(liveBlog.has(source) || liveCompare.has(source), `${source} is live`).toBe(false);
    }
  });

  it("has no chains (a destination is never itself redirected)", () => {
    for (const destination of Object.values(LEGACY_REDIRECTS)) {
      expect(LEGACY_REDIRECTS[destination], destination).toBeUndefined();
    }
  });
});
