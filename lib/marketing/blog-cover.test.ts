import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { blogCoverFor } from "./blog-cover";
import { blogPosts } from "./blog";

describe("blogCoverFor", () => {
  it("gives every post a cover whose file exists", () => {
    for (const post of blogPosts) {
      const cover = blogCoverFor(post.slug);
      expect(cover, `no cover for ${post.slug}: run node scripts/render-blog-covers.mjs`).toBeDefined();
      expect(existsSync(path.join(process.cwd(), "public", cover!.src))).toBe(true);
    }
  });

  it("labels every screenshot cover as demo data", () => {
    for (const post of blogPosts) {
      const cover = blogCoverFor(post.slug)!;
      if (cover.kind === "screen") expect(cover.alt).toContain("date de test");
    }
  });

  it("never puts an app screen on a fines or inspection post", () => {
    for (const post of blogPosts.filter((p) => p.tags.some((t) => ["amenzi", "control-anaf", "control-itm"].includes(t)))) {
      expect(blogCoverFor(post.slug)!.kind).toBe("card");
    }
  });

  it("returns nothing for an unknown slug so the icon fallback shows", () => {
    expect(blogCoverFor("no-such-post")).toBeUndefined();
  });
});
