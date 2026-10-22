import { describe, expect, it } from "vitest";
import { buildInvoiceXml } from "@/lib/anaf/ubl-builder";

const address = { street: "Str. Cristea Mateescu 4", city: "Sector 2", countrySubentity: "RO-B", countryCode: "RO" };

function xmlFor(buyerTaxId: string) {
  return buildInvoiceXml({
    invoiceNumber: "19631",
    issueDate: "2026-10-21",
    seller: { name: "S.C. GOURMET COFFEE SRL", taxId: "RO8654353", legalId: "8654353", legalForm: "J2022008186238, Capital social 750 000 RON", address },
    buyer: { name: "ABI FLOWERS BOUTIQUE S.R.L.", taxId: buyerTaxId, legalId: buyerTaxId.replace(/^RO/i, ""), address },
    lines: [{ id: 1, name: "CAFEA PRAJITA PREMIUM 3", unitCode: "KGM", quantity: 3, unitPrice: 100, vatRate: 11 }],
  });
}

function customerParty(xml: string) {
  return xml.slice(xml.indexOf("<cac:AccountingCustomerParty>"), xml.indexOf("</cac:AccountingCustomerParty>"));
}

describe("UBL party identifiers", () => {
  it("does not declare a bare CUI as a VAT identifier", () => {
    const party = customerParty(xmlFor("28279356"));
    expect(party).not.toContain("<cac:PartyTaxScheme>");
    expect(party).toContain("<cbc:CompanyID>28279356</cbc:CompanyID>");
  });

  it("declares a RO-prefixed VAT identifier in PartyTaxScheme", () => {
    const party = customerParty(xmlFor("RO28279356"));
    expect(party).toContain("<cac:PartyTaxScheme>");
    expect(party).toContain("<cbc:CompanyID>RO28279356</cbc:CompanyID>");
  });

  it("prints the seller's registration and share capital as legal form", () => {
    const xml = xmlFor("28279356");
    expect(xml).toContain("<cbc:CompanyLegalForm>J2022008186238, Capital social 750 000 RON</cbc:CompanyLegalForm>");
  });
});
