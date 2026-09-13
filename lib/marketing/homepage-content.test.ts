import { describe, expect, it } from "vitest";
import { getHomepageContent } from "@/lib/marketing/homepage-content";

describe("simplified homepage content", () => {
  it.each(["ro", "en"] as const)(
    "has five-section content for %s",
    (locale) => {
      const content = getHomepageContent(locale);
      expect(content.benefits).toHaveLength(4);
      expect(content.screens).toHaveLength(4);
      expect(content.customerProof.stats.length).toBeGreaterThanOrEqual(2);
      expect(content.pricing.planText).toHaveLength(2);
    },
  );

  it("keeps the Romanian assisted-trial CTA", () => {
    expect(getHomepageContent("ro").trial).toContain("15 zile");
  });
});
