import { describe, expect, it } from "vitest";
import { invoiceTotalsByRate } from "@/lib/invoice-totals";
import { computeInvoiceTotals } from "@/lib/anaf/ubl-builder";

// The 11 lines of the customer's sample Factură nr. 19631 (21.10.2026).
const sampleLines = [
  { quantity: 3, unitPrice: 100, vatRate: 11 },
  { quantity: 1, unitPrice: 27, vatRate: 11 },
  { quantity: 2, unitPrice: 28, vatRate: 11 },
  { quantity: 3, unitPrice: 29, vatRate: 11 },
  { quantity: 36, unitPrice: 6, vatRate: 11 },
  { quantity: 8, unitPrice: 15, vatRate: 21 },
  { quantity: 1, unitPrice: 85, vatRate: 21 },
  { quantity: 1, unitPrice: 47, vatRate: 21 },
  { quantity: 100, unitPrice: 0.095, vatRate: 21 },
  { quantity: 150, unitPrice: 0.195, vatRate: 21 },
  { quantity: 3, unitPrice: 6, vatRate: 21 },
];

describe("invoiceTotalsByRate", () => {
  it("reproduces the sample invoice exactly", () => {
    const totals = invoiceTotalsByRate(sampleLines);
    expect(totals.rates).toEqual([
      { rate: 11, base: 686, vat: 75.46 },
      { rate: 21, base: 308.75, vat: 64.84 },
    ]);
    expect(totals.base).toBe(994.75);
    expect(totals.vat).toBe(140.3);
    expect(totals.total).toBe(1135.05);
  });

  it("matches the e-Factura XML totals", () => {
    const xml = computeInvoiceTotals(sampleLines.map((l, i) => ({ id: i + 1, name: "x", unitCode: "C62", ...l })));
    const pdf = invoiceTotalsByRate(sampleLines);
    expect(xml).toEqual({ totalExclVat: pdf.base, totalVat: pdf.vat, totalInclVat: pdf.total });
  });
});
