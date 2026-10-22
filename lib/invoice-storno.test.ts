import { describe, expect, it } from "vitest";
import { buildStornoLines } from "@/lib/invoice-storno";
import { invoiceTotalsByRate } from "@/lib/invoice-totals";
import { computeInvoiceTotals } from "@/lib/anaf/ubl-builder";
import { displayInvoiceNumber, isDraftPlaceholderNumber } from "@/lib/invoice-numbering";

const original = [
  { id: 1, name: "Matcha", unitCode: "GRM", quantity: 50, unitPrice: 1, vatRate: 11, productId: "p1", stockQty: 0.05 },
  { id: 2, name: "Pahare", unitCode: "C62", quantity: 100, unitPrice: 0.095, vatRate: 21 },
];

describe("buildStornoLines", () => {
  it("negates quantities and stock quantities, keeps prices and VAT", () => {
    const storno = buildStornoLines(original);
    expect(storno[0]).toMatchObject({ quantity: -50, stockQty: -0.05, unitPrice: 1, vatRate: 11, productId: "p1" });
    expect(storno[1]).toMatchObject({ quantity: -100, unitPrice: 0.095 });
    expect(storno[1]).not.toHaveProperty("stockQty");
  });

  it("totals are the exact negative of the original (PDF and XML)", () => {
    const a = invoiceTotalsByRate(original);
    const b = invoiceTotalsByRate(buildStornoLines(original));
    expect(b.base).toBe(-a.base);
    expect(b.vat).toBe(-a.vat);
    expect(b.total).toBe(-a.total);
    const xml = computeInvoiceTotals(buildStornoLines(original));
    expect(xml.totalInclVat).toBe(b.total);
  });

  it("is idempotent in sign: a line that is already negative stays negative", () => {
    expect(buildStornoLines([{ quantity: -3, stockQty: -1 }])[0]).toMatchObject({ quantity: -3, stockQty: -1 });
  });
});

describe("invoice numbering display", () => {
  it("shows drafts without a final number as Ciornă", () => {
    expect(isDraftPlaceholderNumber("CIORNA-1A2B3C4D")).toBe(true);
    expect(displayInvoiceNumber("CIORNA-1A2B3C4D")).toBe("Ciornă (nr. la emitere)");
    expect(displayInvoiceNumber("19631")).toBe("19631");
  });
});
