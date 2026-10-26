import { afterEach, describe, expect, it } from "vitest";
import { getPriceId } from "@/lib/billing/plans";

describe("billing price configuration", () => {
  const originalGrowth = process.env.STRIPE_GROWTH_PRICE_ID;

  afterEach(() => {
    if (originalGrowth === undefined) delete process.env.STRIPE_GROWTH_PRICE_ID;
    else process.env.STRIPE_GROWTH_PRICE_ID = originalGrowth;
  });

  it("normalizes surrounding whitespace from hosted environment variables", () => {
    process.env.STRIPE_GROWTH_PRICE_ID = "  price_live_growth\n";
    expect(getPriceId("growth", "month")).toBe("price_live_growth");
  });
});
