import { describe, expect, it } from "vitest";
import { appText } from "@/lib/app-i18n";
import { draftStockBanner } from "./purchase";

describe("draftStockBanner", () => {
  it("appears for a draft, says stock was NOT updated and names the post button (ro)", () => {
    const b = draftStockBanner("draft", appText.ro, true);
    expect(b).not.toBeNull();
    expect(b!.title).toContain("NU");
    expect(b!.title.toLowerCase()).toContain("stocul");
    expect(b!.body).toContain(appText.ro.purchases.detail.generateNir); // «Generează NIR»
  });

  it("appears for a draft in en, naming the en button", () => {
    const b = draftStockBanner("draft", appText.en, true);
    expect(b!.title).toContain("NOT");
    expect(b!.body).toContain(appText.en.purchases.detail.generateNir);
  });

  it("tells staff that only an owner or manager can post", () => {
    expect(draftStockBanner("draft", appText.ro, false)!.body).toContain(appText.ro.purchases.detail.draftBannerStaff);
    expect(draftStockBanner("draft", appText.ro, true)!.body).not.toContain(appText.ro.purchases.detail.draftBannerStaff);
  });

  it("does not appear for any other status", () => {
    for (const status of ["posted", "received", "partial", "cancelled", null, undefined, ""]) {
      expect(draftStockBanner(status, appText.ro, true), String(status)).toBeNull();
    }
  });
});
