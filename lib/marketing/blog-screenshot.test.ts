import { describe, expect, it } from "vitest";
import { blogScreenshotFor } from "./blog-screenshot";
import { blogPosts } from "./blog";

describe("blogScreenshotFor", () => {
  it("keeps the screen the article already names", () => {
    expect(blogScreenshotFor({ image: "/marketing/live/stock.png", tags: ["raport-z"] }).src).toBe("/marketing/live/stock.png");
  });
  it("falls back to the tag, then to the dashboard", () => {
    expect(blogScreenshotFor({ image: "/marketing/hero-casa-marcat.jpg", tags: ["stoc-negativ"] }).src).toBe("/marketing/live/stock.png");
    expect(blogScreenshotFor({ tags: ["pfa"] }).src).toBe("/marketing/live/dashboard.png");
  });
  it("gives every published article a live screen", () => {
    for (const post of blogPosts) {
      expect(blogScreenshotFor(post).src).toMatch(/^\/marketing\/live\/(pos|stock|recipes|reports|dashboard)\.png$/);
    }
  });
});
