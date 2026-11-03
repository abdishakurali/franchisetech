// Every shape below was accepted ("stare":"ok") by ANAF's public validator on
// 2026-11-03 (webservicesp.anaf.ro/prod/FCTEL/rest/validare/FACT1); these
// offline tests pin the rules that acceptance depended on.
import { describe, expect, it } from "vitest";
import { buildInvoiceXml, computeInvoiceTotals, type InvoiceInput } from "@/lib/anaf/ubl-builder";
import { parseValidationResponse } from "@/lib/anaf/client";

const seller = {
  name: "SALUT TECH S.R.L.", taxId: "49702253", legalId: "49702253",
  address: { street: "Str. Orhideelor nr. 15", city: "Dobroesti", countrySubentity: "RO-IF", countryCode: "RO" },
};
const buyer = {
  name: "CLIENT S.R.L.", taxId: "RO28279356", legalId: "28279356",
  address: { street: "Str. Test 1", city: "SECTOR2", countrySubentity: "RO-B", countryCode: "RO" },
};
const line = { id: 1, name: "Abonament Pro", unitCode: "C62", quantity: 1, unitPrice: 49, vatRate: 21 };
const invoice = (o: Partial<InvoiceInput>): InvoiceInput => ({
  invoiceNumber: "SLT-0001", issueDate: "2026-11-03", currency: "EUR", seller, buyer,
  paymentTerms: "Plătit cu cardul.", lines: [{ ...line, vatCategoryId: "O" }], ...o,
});

describe("CIUS-RO 1.0.1", () => {
  it("declares the specification version ANAF enforces (BR-RO-001)", () => {
    expect(buildInvoiceXml(invoice({}))).toContain("CIUS-RO:1.0.1</cbc:CustomizationID>");
  });

  it("writes payment terms when given (BR-CO-25)", () => {
    expect(buildInvoiceXml(invoice({}))).toContain("<cac:PaymentTerms><cbc:Note>Plătit cu cardul.</cbc:Note></cac:PaymentTerms>");
  });

  it("puts Note before DocumentCurrencyCode, as the UBL schema orders them", () => {
    const xml = buildInvoiceXml(invoice({ note: "x" }));
    expect(xml.indexOf("<cbc:Note>")).toBeLessThan(xml.indexOf("<cbc:DocumentCurrencyCode>"));
  });
});

describe("category O — seller not VAT registered", () => {
  const xml = buildInvoiceXml(invoice({}));

  it("carries no rate and the VATEX-EU-O reason, with zero VAT (BR-O-05, BR-O-09, BR-O-10)", () => {
    expect(xml).not.toContain("<cbc:Percent>");
    expect(xml).toContain("<cbc:TaxExemptionReasonCode>VATEX-EU-O</cbc:TaxExemptionReasonCode>");
    expect(xml).toContain('<cbc:TaxAmount currencyID="EUR">0.00</cbc:TaxAmount>');
  });

  it("never declares a VAT identifier, even for a VAT-registered buyer (BR-O-02)", () => {
    expect(xml).not.toContain("<cac:PartyTaxScheme>");
    expect(xml).toContain("<cbc:CompanyID>28279356</cbc:CompanyID>");
    expect(xml).toContain("<cbc:CompanyID>49702253</cbc:CompanyID>");
  });

  it("ignores a stray vatRate so the payable amount stays the net price", () => {
    expect(xml).toContain('<cbc:PayableAmount currencyID="EUR">49.00</cbc:PayableAmount>');
    expect(computeInvoiceTotals([{ ...line, vatCategoryId: "O" }])).toEqual({ totalExclVat: 49, totalVat: 0, totalInclVat: 49 });
  });

  it("refuses to mix O with another category (BR-O-11)", () => {
    expect(() => buildInvoiceXml(invoice({ lines: [{ ...line, vatCategoryId: "O" }, { ...line, id: 2, vatCategoryId: "S" }] }))).toThrow(/BR-O-11/);
  });
});

describe("category E — exempt", () => {
  it("needs a reason and identifies a non-VAT seller by its plain CUI (BR-E-10, BR-E-02)", () => {
    expect(() => buildInvoiceXml(invoice({ lines: [{ ...line, vatCategoryId: "E" }] }))).toThrow(/BR-E-10/);
    const xml = buildInvoiceXml(invoice({ lines: [{ ...line, vatCategoryId: "E" }], exemptionReason: "Scutit conform art. 310 Cod fiscal" }));
    expect(xml).toContain("<cbc:TaxExemptionReason>Scutit conform art. 310 Cod fiscal</cbc:TaxExemptionReason>");
    expect(xml).toContain("<cbc:CompanyID>49702253</cbc:CompanyID>\n        <cac:TaxScheme><cbc:ID>TAX</cbc:ID></cac:TaxScheme>");
  });
});

describe("non-RON invoices state VAT in lei (BR-RO-030, BR-53)", () => {
  it("adds TaxCurrencyCode RON and a RON tax total", () => {
    const xml = buildInvoiceXml(invoice({}));
    expect(xml).toContain("<cbc:TaxCurrencyCode>RON</cbc:TaxCurrencyCode>");
    expect(xml).toContain('<cbc:TaxAmount currencyID="RON">0.00</cbc:TaxAmount>');
  });

  it("converts VAT with the given BNR rate and refuses to guess one", () => {
    const vatSeller = { ...seller, taxId: "RO49702253" };
    expect(() => buildInvoiceXml(invoice({ seller: vatSeller, lines: [line] }))).toThrow(/ronRate/);
    const xml = buildInvoiceXml(invoice({ seller: vatSeller, lines: [line], ronRate: 5.0874 }));
    // 49 × 21% = 10.29 EUR × 5.0874 = 52.35 lei
    expect(xml).toContain('<cbc:TaxAmount currencyID="RON">52.35</cbc:TaxAmount>');
  });

  it("leaves RON invoices without a second tax total", () => {
    const xml = buildInvoiceXml(invoice({ currency: "RON" }));
    expect(xml).not.toContain("TaxCurrencyCode");
  });
});

describe("standard-rated invoices (the café path) are unchanged", () => {
  it("keeps the rate and the seller VAT ID", () => {
    const xml = buildInvoiceXml(invoice({ currency: "RON", seller: { ...seller, taxId: "RO49702253" }, lines: [line] }));
    expect(xml).toContain("<cbc:Percent>21.00</cbc:Percent>");
    expect(xml).toContain("<cbc:CompanyID>RO49702253</cbc:CompanyID>");
  });
});

describe("parseValidationResponse", () => {
  it("accepts only an explicit ok", () => {
    expect(parseValidationResponse('{"stare":"ok","trace_id":"t"}')).toEqual({ valid: true, errors: [] });
    expect(parseValidationResponse("<html>Service Unavailable</html>").valid).toBe(false);
    expect(parseValidationResponse('{"trace_id":"t"}').valid).toBe(false);
  });

  it("extracts rule codes from a real nok reply", () => {
    const nok = '{"stare":"nok","Messages":[{"message":"tipAssert=FailedAssert; codEroare=BR-RO-101; localizareEroare=/Invoice; textEroare=[BR-RO-101]-Daca Codul subdiviziunii tarii este RO-B, Orasul trebuie sa fie SECTOR1-6; expresieValidata=x"}],"trace_id":"t"}';
    const result = parseValidationResponse(nok);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/^BR-RO-101: /);
  });
});
