import { describe, expect, it } from "vitest";
import { aiEntityJsonLd } from "./ai-discovery";

// The Free plan was retired from /pricing and signup on 2026-10-26. Structured
// data on every page must not keep advertising it to search engines.
describe("aiEntityJsonLd offers", () => {
  it("lists only the live paid plans, Pro €49 and Multi €79", () => {
    const offers = aiEntityJsonLd().offers;
    expect(offers.map((o) => [o.name, o.price])).toEqual([
      ["franchisetech Pro", "49"],
      ["franchisetech Multi", "79"],
    ]);
  });

  it("never advertises a €0 or Free offer", () => {
    for (const offer of aiEntityJsonLd().offers) {
      expect(Number(offer.price)).toBeGreaterThan(0);
      expect(offer.name).not.toMatch(/free/i);
      expect(offer.url).not.toContain("plan=free");
    }
  });
});
