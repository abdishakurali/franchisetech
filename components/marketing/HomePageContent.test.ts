import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  "components/marketing/HomePageContent.tsx",
  "utf8",
);

describe("homepage structure", () => {
  it("renders the approved sections in order", () => {
    const ids = ["ce-face", "offline", "customer-proof", "final-cta"];
    const positions = ids.map((id) => source.indexOf(`id=\"${id}\"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("removes obsolete homepage sections", () => {
    for (const id of ["hardware", "adevar-unic", "pricing"]) {
      expect(source).not.toContain(`id=\"${id}\"`);
    }
  });

  it("keeps the primary signup route and analytics (trial retired 2026-09 — Free is permanent)", () => {
    expect(source).toContain('/signup?plan=free');
    expect(source).toContain('captureClientEvent("cta_clicked"');
  });
});
