/**
 * Romanian invoice totals, computed the way the printed Factură shows them:
 * line value = round2(qty × unit price without VAT); line VAT = round2(value
 * × rate); per-rate and grand totals are sums of the rounded line amounts.
 * Same rounding as computeInvoiceTotals in lib/anaf/ubl-builder.ts, so the
 * PDF and the e-Factura XML always agree.
 */

export type InvoiceTotalsLine = { quantity: number; unitPrice: number; vatRate: number };

const round = (n: number, d: number) => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

export function invoiceLineAmounts(line: InvoiceTotalsLine) {
  const value = round(round(line.unitPrice, 4) * round(line.quantity, 4), 2);
  const vat = round((value * round(line.vatRate, 2)) / 100, 2);
  return { value, vat };
}

export function invoiceTotalsByRate(lines: InvoiceTotalsLine[]) {
  const byRate = new Map<number, { base: number; vat: number }>();
  let base = 0;
  let vat = 0;
  for (const line of lines) {
    const amounts = invoiceLineAmounts(line);
    const rate = round(line.vatRate, 2);
    const current = byRate.get(rate) ?? { base: 0, vat: 0 };
    byRate.set(rate, { base: round(current.base + amounts.value, 2), vat: round(current.vat + amounts.vat, 2) });
    base = round(base + amounts.value, 2);
    vat = round(vat + amounts.vat, 2);
  }
  return {
    rates: [...byRate.entries()].sort((a, b) => a[0] - b[0]).map(([rate, v]) => ({ rate, ...v })),
    base,
    vat,
    total: round(base + vat, 2),
  };
}
