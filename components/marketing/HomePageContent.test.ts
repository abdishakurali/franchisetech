import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  "components/marketing/HomePageContent.tsx",
  "utf8",
);

describe("homepage structure", () => {
  it("renders the approved sections in order", () => {
    const ids = ["product-proof", "benefits", "customer-proof", "pricing"];
    const positions = ids.map((id) => source.indexOf(`id=\"${id}\"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("removes secondary homepage sections", () => {
    for (const id of ["offline", "hardware", "adevar-unic"]) {
      expect(source).not.toContain(`id=\"${id}\"`);
    }
  });

  it("keeps the primary trial route and analytics", () => {
    expect(source).toContain('/signup?plan=starter');
    expect(source).toContain('captureClientEvent("cta_clicked"');
  });
});
