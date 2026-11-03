// UBL 2.1 XML builder for ANAF e-Factura (CIUS-RO:1.0.1)
// All arithmetic uses integer-scaled integers to avoid float precision errors.
// Spec: urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1
// ANAF's validator rejects 1.0.0 with BR-RO-001 (checked 2026-11-03).

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
  /** Legal registration identifier (BT-30 / BT-47), e.g. the bare CUI "28279356". */
  legalId?: string;
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
  /** "S" = standard, "Z" = zero-rated, "E" = exempt, "AE" = reverse charge,
   *  "O" = not subject to VAT (seller not VAT registered). O carries no rate. */
  vatCategoryId?: "S" | "Z" | "E" | "AE" | "O";
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
  /** Payment terms text (BT-20). Needed, unless dueDate is set, when an amount is payable (BR-CO-25). */
  paymentTerms?: string;
  /** Exemption reason (BT-120, max 100 chars) for E/O lines, e.g. a Codul fiscal reference. */
  exemptionReason?: string;
  /** Lei per unit of `currency` (BNR rate) — required when currency is not RON and VAT is due (BR-RO-030, BR-53). */
  ronRate?: number;
};

/** Round to N decimal places using half-up (no banker's rounding). */
/**
 * Round half away from zero (Romanian practice), symmetric for negatives so a
 * storno line is the exact negative of the original. The 1e-9 nudge absorbs
 * binary float error (e.g. 9.5 × 21% = 1.99499999… must round to 2.00).
 */
function round(value: number, dp: number): number {
  const factor = Math.pow(10, dp);
  return (Math.sign(value) * Math.round(Math.abs(value) * factor + 1e-9)) / factor;
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

/**
 * A VAT identifier carries a country prefix (RO12345678). A bare CUI belongs
 * to a party that is not VAT registered and must not be declared as a VAT ID
 * (CIUS-RO): it goes in PartyLegalEntity/CompanyID instead.
 */
function hasVatId(taxId: string | undefined): boolean {
  return /^[A-Z]{2}[0-9A-Z]+$/i.test((taxId ?? "").trim());
}

/**
 * vatIdAllowed=false for category O invoices: BR-O-02 forbids the seller's and
 * the buyer's VAT identifiers. taxRegistrationId (BT-32) is the seller's plain
 * CUI under a non-VAT scheme, which BR-E-02 accepts for exempt invoices.
 */
function buildParty(
  party: UblParty,
  role: "supplier" | "customer",
  opts: { vatIdAllowed: boolean; taxRegistrationId?: string },
): string {
  const tag = role === "supplier" ? "cac:AccountingSupplierParty" : "cac:AccountingCustomerParty";
  const vatId = opts.vatIdAllowed && hasVatId(party.taxId) ? party.taxId : null;
  return `
  <${tag}>
    <cac:Party>
      <cac:PartyName><cbc:Name>${esc(party.name)}</cbc:Name></cac:PartyName>
      ${buildAddress(party.address)}
      ${vatId ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${esc(vatId)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
      ${!vatId && opts.taxRegistrationId ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${esc(opts.taxRegistrationId)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>TAX</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${esc(party.registrationName ?? party.name)}</cbc:RegistrationName>
        ${party.legalId ? `<cbc:CompanyID>${esc(party.legalId)}</cbc:CompanyID>` : ""}
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
    // E and O carry no VAT; O also carries no rate at all (BR-O-05).
    const noVat = line.vatCategoryId === "O" || line.vatCategoryId === "E";
    const vatRate = noVat ? 0 : round(line.vatRate, 2);
    const vatAmount = round(lineExtension * vatRate / 100, 2);
    const catId = line.vatCategoryId ?? (vatRate === 0 ? "Z" : "S");
    return { ...line, vatRate, unitPrice4, qty4, lineExtension, vatAmount, catId };
  });

  // Tax subtotals grouped by category and rate (Z and E/O are all 0%).
  const taxMap = new Map<string, TaxSubtotal>();
  for (const line of computedLines) {
    const key = `${line.catId}:${line.vatRate}`;
    const existing = taxMap.get(key);
    if (existing) {
      existing.taxableAmount = round(existing.taxableAmount + line.lineExtension, 2);
      existing.taxAmount = round(existing.taxAmount + line.vatAmount, 2);
    } else {
      taxMap.set(key, {
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

  const hasO = subtotals.some((st) => st.categoryId === "O");
  if (hasO && subtotals.length > 1) {
    throw new Error("A category O invoice must have a single VAT breakdown (BR-O-11)");
  }
  const exemptionXml = (categoryId: string) => {
    if (categoryId === "O") return `<cbc:TaxExemptionReasonCode>VATEX-EU-O</cbc:TaxExemptionReasonCode>`;
    if (categoryId === "E") {
      if (!input.exemptionReason) throw new Error("A category E invoice needs an exemption reason (BR-E-10)");
      return `<cbc:TaxExemptionReason>${esc(input.exemptionReason.slice(0, 100))}</cbc:TaxExemptionReason>`;
    }
    return "";
  };
  const taxSubtotalXml = subtotals.map((st) => `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currency}">${fmt(st.taxableAmount)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currency}">${fmt(st.taxAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>${st.categoryId}</cbc:ID>
          ${st.categoryId === "O" ? "" : `<cbc:Percent>${fmt(st.rate)}</cbc:Percent>`}
          ${exemptionXml(st.categoryId)}
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`).join("");

  // A non-RON invoice also states its VAT in lei (BR-RO-030 + BR-53).
  const foreign = currency !== "RON";
  if (foreign && totalTax !== 0 && !(input.ronRate && input.ronRate > 0)) {
    throw new Error("A non-RON invoice with VAT needs ronRate (BNR lei per unit)");
  }
  const ronTaxTotalXml = foreign
    ? `<cac:TaxTotal><cbc:TaxAmount currencyID="RON">${fmt(totalTax === 0 ? 0 : totalTax * (input.ronRate ?? 0))}</cbc:TaxAmount></cac:TaxTotal>`
    : "";
  // Seller identification: O forbids VAT IDs on both parties (BR-O-02); an
  // E invoice from a non-VAT seller identifies it by its plain CUI (BR-E-02).
  const sellerIsVat = hasVatId(input.seller.taxId);
  const usesE = subtotals.some((st) => st.categoryId === "E");
  const sellerTaxRegistration = !sellerIsVat && usesE ? input.seller.legalId ?? input.seller.taxId : undefined;

  const linesXml = computedLines.map((line) => `
  <cac:InvoiceLine>
    <cbc:ID>${line.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${esc(line.unitCode)}">${fmt(line.qty4, 4)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${fmt(line.lineExtension)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${esc(line.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${line.catId}</cbc:ID>
        ${line.catId === "O" ? "" : `<cbc:Percent>${fmt(line.vatRate)}</cbc:Percent>`}
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
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1</cbc:CustomizationID>
  <cbc:ID>${esc(input.invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${input.issueDate}</cbc:IssueDate>
  ${input.dueDate ? `<cbc:DueDate>${input.dueDate}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode>${typeCode}</cbc:InvoiceTypeCode>
  ${input.note ? `<cbc:Note>${esc(input.note)}</cbc:Note>` : ""}
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  ${foreign ? `<cbc:TaxCurrencyCode>RON</cbc:TaxCurrencyCode>` : ""}
  ${buildParty(input.seller, "supplier", { vatIdAllowed: !hasO, taxRegistrationId: sellerTaxRegistration })}
  ${buildParty(input.buyer, "customer", { vatIdAllowed: !hasO })}
  ${input.paymentTerms ? `<cac:PaymentTerms><cbc:Note>${esc(input.paymentTerms)}</cbc:Note></cac:PaymentTerms>` : ""}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${fmt(totalTax)}</cbc:TaxAmount>
    ${taxSubtotalXml}
  </cac:TaxTotal>
  ${ronTaxTotalXml}
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
    const noVat = line.vatCategoryId === "O" || line.vatCategoryId === "E";
    const vat = noVat ? 0 : round(ext * round(line.vatRate, 2) / 100, 2);
    totalExclVat = round(totalExclVat + ext, 2);
    totalVat = round(totalVat + vat, 2);
  }
  return {
    totalExclVat,
    totalVat,
    totalInclVat: round(totalExclVat + totalVat, 2),
  };
}
