// UBL 2.1 XML builder for ANAF e-Factura (CIUS-RO:1.0.0)
// All arithmetic uses integer-scaled integers to avoid float precision errors.
// Spec: urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.0

export type UblAddress = {
  street: string;
  city: string;
  postalCode?: string;
  /** ISO 3166-2:RO — e.g. RO-B, RO-CJ, RO-TM, RO-IS, RO-BV, RO-CT */
  countrySubentity: string;
  countryCode: string;
};

export type UblParty = {
  name: string;
  /** CIF/CUI — include RO prefix if VAT registered, e.g. "RO12345678" */
  taxId: string;
  address: UblAddress;
  registrationName?: string;
  /** e.g. "J40/1234/2020" */
  legalForm?: string;
  /** "S" = standard VAT, "O" = not VAT registered */
  taxSchemeId?: "S" | "O";
};

export type UblLineItem = {
  id: number;
  name: string;
  /** UN/ECE Rec 20 unit code — C62 = unit, KGM = kg, LTR = litre */
  unitCode: string;
  quantity: number;
  /** Unit price excl. VAT — stored as number, will be rounded to 4dp */
  unitPrice: number;
  /** VAT rate as percentage: 5, 9, or 19 */
  vatRate: number;
  /** "S" = standard, "Z" = zero-rated, "E" = exempt, "AE" = reverse charge */
  vatCategoryId?: "S" | "Z" | "E" | "AE";
};

export type InvoiceInput = {
  /** Your sequential invoice number, e.g. "FACTURA-2026-001" */
  invoiceNumber: string;
  /** 380 = invoice, 381 = credit note, 384 = corrective */
  invoiceTypeCode?: "380" | "381" | "384";
  issueDate: string;   // YYYY-MM-DD
  dueDate?: string;    // YYYY-MM-DD
  currency?: string;   // default RON
  seller: UblParty;
  buyer: UblParty;
  lines: UblLineItem[];
  /** Free-text note on the invoice */
  note?: string;
};

/** Round to N decimal places using half-up (no banker's rounding). */
function round(value: number, dp: number): number {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}

/** Format number to exactly N decimal places as string. */
function fmt(value: number, dp = 2): string {
  return round(value, dp).toFixed(dp);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildAddress(addr: UblAddress): string {
  return `
        <cac:PostalAddress>
          <cbc:StreetName>${esc(addr.street)}</cbc:StreetName>
          <cbc:CityName>${esc(addr.city)}</cbc:CityName>
          ${addr.postalCode ? `<cbc:PostalZone>${esc(addr.postalCode)}</cbc:PostalZone>` : ""}
          <cbc:CountrySubentity>${esc(addr.countrySubentity)}</cbc:CountrySubentity>
          <cac:Country><cbc:IdentificationCode>${esc(addr.countryCode)}</cbc:IdentificationCode></cac:Country>
        </cac:PostalAddress>`;
}

function buildParty(party: UblParty, role: "supplier" | "customer"): string {
  const tag = role === "supplier" ? "cac:AccountingSupplierParty" : "cac:AccountingCustomerParty";
  const schemeId = party.taxSchemeId ?? "S";
  return `
  <${tag}>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(party.name)}</cbc:Name></cac:PartyName>
      ${buildAddress(party.address)}
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${esc(party.taxId)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${esc(party.registrationName ?? party.name)}</cbc:RegistrationName>
        ${party.legalForm ? `<cbc:CompanyLegalForm>${esc(party.legalForm)}</cbc:CompanyLegalForm>` : ""}
      </cac:PartyLegalEntity>
    </cac:Party>
  </${tag}>`;
}

type TaxSubtotal = {
  taxableAmount: number;
  taxAmount: number;
  rate: number;
  categoryId: string;
};

export function buildInvoiceXml(input: InvoiceInput): string {
  const currency = input.currency ?? "RON";
  const typeCode = input.invoiceTypeCode ?? "380";

  // Compute line amounts with exact arithmetic
  const computedLines = input.lines.map((line) => {
    const unitPrice4 = round(line.unitPrice, 4);
    const qty4 = round(line.quantity, 4);
    const lineExtension = round(unitPrice4 * qty4, 2);
    const vatRate = round(line.vatRate, 2);
    const vatAmount = round(lineExtension * vatRate / 100, 2);
    const catId = line.vatCategoryId ?? (vatRate === 0 ? "Z" : "S");
    return { ...line, unitPrice4, qty4, lineExtension, vatAmount, catId };
  });

  // Tax subtotals grouped by rate
  const taxMap = new Map<number, TaxSubtotal>();
  for (const line of computedLines) {
    const existing = taxMap.get(line.vatRate);
    if (existing) {
      existing.taxableAmount = round(existing.taxableAmount + line.lineExtension, 2);
      existing.taxAmount = round(existing.taxAmount + line.vatAmount, 2);
    } else {
      taxMap.set(line.vatRate, {
        taxableAmount: line.lineExtension,
        taxAmount: line.vatAmount,
        rate: line.vatRate,
        categoryId: line.catId,
      });
    }
  }
  const subtotals = Array.from(taxMap.values());

  // Monetary totals
  const lineExtensionTotal = round(computedLines.reduce((s, l) => s + l.lineExtension, 0), 2);
  const totalTax = round(subtotals.reduce((s, st) => s + st.taxAmount, 0), 2);
  const totalIncl = round(lineExtensionTotal + totalTax, 2);

  const taxSubtotalXml = subtotals.map((st) => `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currency}">${fmt(st.taxableAmount)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currency}">${fmt(st.taxAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>${st.categoryId}</cbc:ID>
          <cbc:Percent>${fmt(st.rate)}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`).join("");

  const linesXml = computedLines.map((line) => `
  <cac:InvoiceLine>
    <cbc:ID>${line.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${esc(line.unitCode)}">${fmt(line.qty4, 4)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${fmt(line.lineExtension)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${esc(line.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${line.catId}</cbc:ID>
        <cbc:Percent>${fmt(line.vatRate)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currency}">${fmt(line.unitPrice4, 4)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.0</cbc:CustomizationID>
  <cbc:ID>${esc(input.invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${input.issueDate}</cbc:IssueDate>
  ${input.dueDate ? `<cbc:DueDate>${input.dueDate}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode>${typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  ${input.note ? `<cbc:Note>${esc(input.note)}</cbc:Note>` : ""}
  ${buildParty(input.seller, "supplier")}
  ${buildParty(input.buyer, "customer")}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${fmt(totalTax)}</cbc:TaxAmount>
    ${taxSubtotalXml}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${fmt(lineExtensionTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${fmt(lineExtensionTotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${fmt(totalIncl)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${fmt(totalIncl)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</Invoice>`;
}

/** Summary totals returned alongside the XML, useful for pre-filling DB fields. */
export function computeInvoiceTotals(lines: UblLineItem[]): {
  totalExclVat: number;
  totalVat: number;
  totalInclVat: number;
} {
  let totalExclVat = 0;
  let totalVat = 0;
  for (const line of lines) {
    const ext = round(round(line.unitPrice, 4) * round(line.quantity, 4), 2);
    const vat = round(ext * round(line.vatRate, 2) / 100, 2);
    totalExclVat = round(totalExclVat + ext, 2);
    totalVat = round(totalVat + vat, 2);
  }
  return {
    totalExclVat,
    totalVat,
    totalInclVat: round(totalExclVat + totalVat, 2),
  };
}
