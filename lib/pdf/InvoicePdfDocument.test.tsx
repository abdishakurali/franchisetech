import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfDocument, type InvoicePdfData } from "@/lib/pdf/InvoicePdfDocument";

// The customer's sample Factură nr. 19631.
const sample: InvoicePdfData = {
  number: "19631",
  issueDate: "2026-10-21",
  dueDate: "2026-10-21",
  currency: "RON",
  seller: {
    name: "S.C.GOURMET COFFEE SRL",
    cif: "RO8654353",
    regCom: "J2022008186238",
    shareCapital: "750 000 RON",
    address: "PANTELIMON str. SFINTUL GHEORGHE nr. 20 bl. HALA C1",
    county: "ILFOV",
    bankAccounts: [
      { bank: "Banca Intesa Sanpaolo Romania SA", iban: "RO30WBAN005896113729RO01", currency: "RON" },
      { bank: "Banca Intesa Sanpaolo Romania SA", iban: "RO84WBAN005896113729EU01", currency: "EURO" },
    ],
  },
  buyer: {
    name: "ABI FLOWERS BOUTIQUE S.R.L.",
    cif: "28279356",
    regCom: "J2011003889400",
    address: "BUCURESTI SECTOR 2, STR. CRISTEA MATEESCU, NR. 4",
  },
  lines: [
    { name: "CAFEA PRAJITA PREMIUM 3", unitCode: "KGM", quantity: 3, unitPrice: 100, vatRate: 11 },
    { name: "CAFEA PRAJITA MATTINA DI ROMA 250 G PUNGA", unitCode: "C62", quantity: 1, unitPrice: 27, vatRate: 11 },
    { name: "LAPTE UHT 3.2 % BARISTA 1L MLK", unitCode: "C62", quantity: 36, unitPrice: 6, vatRate: 11 },
    { name: "PAHARE CARTON 6 OZ DOLCE NERA", unitCode: "C62", quantity: 100, unitPrice: 0.095, vatRate: 21 },
    { name: "PAHAR 8 OZ DOLCE NERA ROM SET/50", unitCode: "SET", quantity: 3, unitPrice: 6, vatRate: 21 },
  ],
  issuerName: "IVAN FLORENTINA",
  issuerIdDoc: "IF 609813",
  delegateName: "CURIER",
  draft: true,
};

describe("InvoicePdfDocument", () => {
  it("renders a PDF for the sample invoice, including Romanian diacritics", async () => {
    const buffer = await renderToBuffer(InvoicePdfDocument({ data: { ...sample, buyer: { ...sample.buyer, name: "Cafenea Ștefănescu SRL" } } }));
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    if (process.env.INVOICE_PDF_OUT) writeFileSync(process.env.INVOICE_PDF_OUT, buffer);
  }, 20_000);
});
