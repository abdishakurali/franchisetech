import { describe, expect, it } from "vitest";
import { getHomepageContent } from "@/lib/marketing/homepage-content";

describe("simplified homepage content", () => {
  it.each(["ro", "en"] as const)(
    "has five-section content for %s",
    (locale) => {
      const content = getHomepageContent(locale);
      expect(content.benefits).toHaveLength(4);
      expect(content.screens).toHaveLength(4);
      expect(content.customerProof.title.length).toBeGreaterThan(0);
      expect(content.pricing.planText).toHaveLength(2);
    },
  );

  it("describes the 15-day no-card Pro trial, not a free-forever plan", () => {
    for (const locale of ["ro", "en"] as const) {
      const content = getHomepageContent(locale);
      expect(content.trialNote).toContain("15");
      expect(content.trialNote.toLowerCase()).not.toMatch(/forever|totdeauna/);
    }
  });
});
