import { describe, expect, it } from "vitest";
import { friendlySaleErrorFromCode } from "@/lib/pos-i18n";

describe("friendlySaleErrorFromCode", () => {
  it("gives the specific VAT-review message in English instead of the generic fallback", () => {
    const msg = friendlySaleErrorFromCode(
      "vat_review_required",
      "Produsul necesită validarea cotei TVA înainte de vânzare.",
      "en",
    );
    expect(msg).toBe("This product needs its VAT rate reviewed before it can be sold.");
  });

  it("renders the VAT-review message in Romanian too", () => {
    const msg = friendlySaleErrorFromCode(
      "vat_review_required",
      "Produsul necesită validarea cotei TVA înainte de vânzare.",
      "ro",
    );
    expect(msg).toBe("Produsul necesită validarea cotei TVA înainte de vânzare.");
  });

  it("gives a specific message for cash_insufficient, not the generic fallback", () => {
    const msg = friendlySaleErrorFromCode("cash_insufficient", "Cash received is less than the total due.", "en");
    expect(msg).toBe("Amount received is less than the total due.");
  });

  it("gives a specific message for payment_mismatch", () => {
    const msg = friendlySaleErrorFromCode("payment_mismatch", "Payment total is less than the sale total.", "en");
    expect(msg).toBe("The amount paid doesn't match the sale total.");
  });

  it("falls back to the free-text matcher for an unknown code (arbitrary DB error)", () => {
    const msg = friendlySaleErrorFromCode("unknown", "Cart is empty.", "en");
    expect(msg).toBe("Cart is empty.");
  });

  it("falls back to the free-text matcher when no code is provided at all", () => {
    const msg = friendlySaleErrorFromCode(undefined, "Cart is empty.", "en");
    expect(msg).toBe("Cart is empty.");
  });
});
