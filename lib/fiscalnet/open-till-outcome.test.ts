import { describe, expect, it } from "vitest";
import { openTillDestination } from "@/lib/fiscalnet/open-till-outcome";

describe("openTillDestination", () => {
  it("keeps the till open while surfacing a FiscalNet failure", () => {
    expect(openTillDestination({ fiscalActive: true, fiscalOk: false })).toBe("/app/pos?fiscal=opening_failed");
  });

  it("uses the clean POS route when FiscalNet succeeds or is inactive", () => {
    expect(openTillDestination({ fiscalActive: true, fiscalOk: true })).toBe("/app/pos");
    expect(openTillDestination({ fiscalActive: false, fiscalOk: false })).toBe("/app/pos");
  });
});
