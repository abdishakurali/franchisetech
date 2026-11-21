import { describe, expect, it } from "vitest";
import {
  RESEND_STUCK_PENDING_MS,
  buildResendItems,
  fiscalStatusLabelRo,
  isResendEligible,
  resendEligibleFilter,
  resendErrorMessage,
  resendPermission,
} from "@/lib/fiscalnet/resend";

const now = new Date("2026-11-21T12:00:00.000Z");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

describe("isResendEligible", () => {
  it("allows failed, timeout and unconfirmed receipts", () => {
    for (const s of ["failed", "timeout", "unconfirmed"]) {
      expect(isResendEligible({ fiscal_receipt_status: s, sold_at: minutesAgo(1) }, now)).toBe(true);
    }
  });

  it("allows api_pending only after 5 minutes", () => {
    expect(isResendEligible({ fiscal_receipt_status: "api_pending", sold_at: minutesAgo(4) }, now)).toBe(false);
    expect(isResendEligible({ fiscal_receipt_status: "api_pending", sold_at: minutesAgo(6) }, now)).toBe(true);
  });

  it("never allows a confirmed, in-flight, ambiguous or not-required receipt", () => {
    for (const s of ["success", "printing", "ambiguous", "not_required", "pending", "skipped"]) {
      expect(isResendEligible({ fiscal_receipt_status: s, sold_at: minutesAgo(60) }, now)).toBe(false);
    }
  });

  it("never allows a voided or refunded sale", () => {
    expect(isResendEligible({ status: "voided", fiscal_receipt_status: "failed" }, now)).toBe(false);
    expect(isResendEligible({ status: "refunded", fiscal_receipt_status: "failed" }, now)).toBe(false);
  });
});

describe("resendEligibleFilter", () => {
  it("matches isResendEligible: ready statuses plus stuck api_pending", () => {
    const cutoff = new Date(now.getTime() - RESEND_STUCK_PENDING_MS).toISOString();
    expect(resendEligibleFilter(now)).toBe(
      `fiscal_receipt_status.in.(failed,timeout,unconfirmed),and(fiscal_receipt_status.eq.api_pending,sold_at.lt.${cutoff})`,
    );
    expect(resendEligibleFilter(now)).not.toContain("success");
    expect(resendEligibleFilter(now)).not.toContain("printing");
  });
});

describe("resendPermission", () => {
  it("owners and managers may resend any sale", () => {
    expect(resendPermission("owner", null)).toEqual({ allowed: true, requiredSessionId: null });
    expect(resendPermission("manager", "s1")).toEqual({ allowed: true, requiredSessionId: null });
  });

  it("staff and cashiers only on the open till session", () => {
    expect(resendPermission("staff", "s1")).toEqual({ allowed: true, requiredSessionId: "s1" });
    expect(resendPermission("cashier", "s1")).toEqual({ allowed: true, requiredSessionId: "s1" });
    expect(resendPermission("cashier", null)).toEqual({ allowed: false });
  });

  it("other roles never", () => {
    for (const r of ["accountant", "kitchen", "viewer", null, undefined]) {
      expect(resendPermission(r, "s1")).toEqual({ allowed: false });
    }
  });
});

describe("buildResendItems", () => {
  it("rebuilds the lines the till sent: unit price, VAT group from vat_rates, line discount", () => {
    const items = buildResendItems(
      [
        { product_name: "Espresso", quantity: "2", unit_price: "9", vat_rate: "11", discount_pct: "0" },
        { product_name: "Croissant", quantity: 1, unit_price: 12.5, vat_rate: 21, discount_pct: 10 },
        { product_name: null, quantity: 1, unit_price: 5, vat_rate: 0 },
      ],
      { 11: 2, 21: 1 },
    );
    expect(items).toEqual([
      { productName: "Espresso", quantity: 2, unitPrice: 9, vatRate: 11, fiscalNetGroup: 2 },
      { productName: "Croissant", quantity: 1, unitPrice: 12.5, vatRate: 21, fiscalNetGroup: 1, discountPercent: 10 },
      { productName: "Produs", quantity: 1, unitPrice: 5, vatRate: 0, fiscalNetGroup: null },
    ]);
  });
});

describe("resendErrorMessage", () => {
  it("maps database refusals to short Romanian messages", () => {
    expect(resendErrorMessage("RESEND_IN_PROGRESS")).toMatch(/se trimite deja/);
    expect(resendErrorMessage("RESEND_NOT_SAME_SESSION")).toMatch(/manager/);
    expect(resendErrorMessage("RESEND_NOT_ELIGIBLE: fiscal status is success")).toMatch(/nu mai poate fi retrimis/);
    expect(resendErrorMessage("Could not find the function public.begin_fiscal_receipt_resend")).toMatch(/nu este încă activă/);
    expect(resendErrorMessage(undefined)).toMatch(/Încercați din nou/);
  });
});

describe("fiscalStatusLabelRo", () => {
  it("keeps unconfirmed apart from failed", () => {
    expect(fiscalStatusLabelRo("unconfirmed")).toMatch(/Neconfirmat/);
    expect(fiscalStatusLabelRo("failed")).toBe("Netrimis");
    expect(fiscalStatusLabelRo("success")).toBe("Confirmat");
    expect(fiscalStatusLabelRo(null)).toBe("Nu este cazul");
  });
});
