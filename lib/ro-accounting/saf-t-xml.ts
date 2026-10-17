/**
 * SAF-T D406 XML export — stock movements (MasterFiles + MovementOfGoods).
 *
 * Real element names and nesting taken from ANAF's published schema
 * (Ro_SAFT_Schema_v249_2025.xsd, root AuditFile > Header / MasterFiles /
 * SourceDocuments > MovementOfGoods > StockMovement > StockMovementLine).
 * This is NOT the flat Saga-style shape — the OECD SAF-T schema several
 * required fields assume a general-ledger accounting system (a GL AccountID
 * on every line, opening/closing supplier balances, a customs commodity code
 * per product) that a POS/inventory product like this one does not track.
 * Those fields are populated with clearly-marked placeholders below rather
 * than fabricated figures — see DEFAULT_GL_ACCOUNT and the per-field comments.
 * This export is a structurally faithful draft, not a certified filing: it
 * must be validated by the business's accountant (and ideally against
 * ANAF's own validator) before being submitted for real.
 */

// Standard Romanian chart-of-accounts code for "Mărfuri" (goods/merchandise).
// Used as the GL AccountID placeholder everywhere the schema requires one —
// this product has no general ledger, so there is no real per-line account
// to report.
const DEFAULT_GL_ACCOUNT = "371";
const SELF_PARTY_CODE = "SELF";
const RETAIL_CUSTOMER_CODE = "CLIENTI-DIVERSI";
// Generic placeholder customs/commodity classification (8-digit CN format) —
// this product does not track per-product customs codes.
const DEFAULT_COMMODITY_CODE = "00000000";

export type SaftMovementTypeCode = "AR" | "VZ" | "SC" | "AJ" | "RT" | "SI";

/** All 6 real stock_movements.movement_type values, mapped to self-declared SAF-T codes. */
export const MOVEMENT_TYPE_TABLE: ReadonlyArray<{
  dbType: string;
  code: SaftMovementTypeCode;
  description: string;
}> = [
  { dbType: "purchase_received", code: "AR", description: "Aprovizionare (recepție marfă / NIR)" },
  { dbType: "sale_used", code: "VZ", description: "Vânzare (ieșire prin bon fiscal)" },
  { dbType: "wastage", code: "SC", description: "Scăzământ / pierdere" },
  { dbType: "manual_adjustment", code: "AJ", description: "Ajustare manuală de stoc" },
  { dbType: "return", code: "RT", description: "Retur marfă" },
  { dbType: "opening", code: "SI", description: "Sold inițial" },
] as const;

const MOVEMENT_TYPE_BY_DB_TYPE = new Map(MOVEMENT_TYPE_TABLE.map((m) => [m.dbType, m]));

export function movementTypeCodeFor(dbType: string): SaftMovementTypeCode {
  return MOVEMENT_TYPE_BY_DB_TYPE.get(dbType)?.code ?? "AJ";
}

function isGoodsIn(dbType: string): boolean {
  return dbType === "purchase_received" || dbType === "opening";
}

export type SaftHeader = {
  cif: string;
  companyName: string;
  selectionStartDate: string; // YYYY-MM-DD
  selectionEndDate: string; // YYYY-MM-DD
  // Required by ANAF's own schema (CompanyHeaderStructure: Address, Contact
  // with mandatory Telephone, and BankAccount are all minOccurs=1) — confirmed
  // by running the real ANAF DUKIntegrator validator against a generated file.
  street: string;
  city: string;
  phone: string;
  bankIban: string;
};

export type SaftTaxRate = {
  /** e.g. "TVA Standard 21%" */
  name: string;
  rate: number;
};

export type SaftSupplier = {
  supplierId: string;
  name: string;
};

export type SaftProduct = {
  productCode: string;
  description: string;
  unitOfMeasure: string;
};

export type SaftStockMovementInput = {
  productCode: string;
  quantity: number;
  unitOfMeasure: string;
  dbMovementType: string;
  movementDate: string; // ISO date/datetime
  bookValue?: number | null;
  supplierId?: string | null;
  comments?: string | null;
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toSaftDate(value: string): string {
  return value.slice(0, 10);
}

function buildHeader(header: SaftHeader): string {
  return `  <Header>
    <AuditFileVersion>2.4.9</AuditFileVersion>
    <AuditFileCountry>RO</AuditFileCountry>
    <AuditFileDateCreated>${toSaftDate(new Date().toISOString())}</AuditFileDateCreated>
    <SoftwareCompanyName>franchisetech</SoftwareCompanyName>
    <SoftwareID>franchisetech</SoftwareID>
    <SoftwareVersion>1.0</SoftwareVersion>
    <Company>
      <RegistrationNumber>${escapeXml(header.cif)}</RegistrationNumber>
      <Name>${escapeXml(header.companyName)}</Name>
      <Address>
        <StreetName>${escapeXml(header.street)}</StreetName>
        <City>${escapeXml(header.city)}</City>
        <Country>RO</Country>
      </Address>
      <Contact>
        <ContactPerson>
          <FirstName>NotUsed</FirstName>
          <LastName>${escapeXml(header.companyName)}</LastName>
        </ContactPerson>
        <Telephone>${escapeXml(header.phone)}</Telephone>
      </Contact>
      <BankAccount>
        <IBANNumber>${escapeXml(header.bankIban)}</IBANNumber>
      </BankAccount>
    </Company>
    <DefaultCurrencyCode>RON</DefaultCurrencyCode>
    <SelectionCriteria>
      <SelectionStartDate>${header.selectionStartDate}</SelectionStartDate>
      <SelectionEndDate>${header.selectionEndDate}</SelectionEndDate>
    </SelectionCriteria>
    <!-- ANAF's own DUKIntegrator validator rejects any HeaderComment value (including
         empty) with "not in list", implying a controlled vocabulary the XSD doesn't
         document and neither Ghidul D406 nor ANAF's SAF-T FAQ mention. Left empty
         rather than guessing a value for a fiscal document — resolve once a real
         accounting-software-generated D406 file shows what belongs here. -->
    <HeaderComment></HeaderComment>
    <SegmentIndex>1</SegmentIndex>
    <TotalSegmentsInsequence>1</TotalSegmentsInsequence>
    <TaxAccountingBasis>I</TaxAccountingBasis>
  </Header>`;
}

function buildTaxTable(rates: SaftTaxRate[]): string {
  const entries = rates
    .map(
      (r) => `        <TaxCodeDetails>
          <TaxCode>${escapeXml(r.name)}</TaxCode>
          <Description>${escapeXml(r.name)}</Description>
          <TaxPercentage>${r.rate}</TaxPercentage>
        </TaxCodeDetails>`,
    )
    .join("\n");
  return `    <TaxTable>
      <TaxTableEntry>
        <TaxType>TVA</TaxType>
        <Description>Taxa pe valoarea adăugată</Description>
${entries}
      </TaxTableEntry>
    </TaxTable>`;
}

function buildMovementTypeTable(): string {
  const entries = MOVEMENT_TYPE_TABLE.map(
    (m) => `      <MovementTypeTableEntry>
        <MovementType>${m.code}</MovementType>
        <Description>${escapeXml(m.description)}</Description>
      </MovementTypeTableEntry>`,
  ).join("\n");
  return `    <MovementTypeTable>
${entries}
    </MovementTypeTable>`;
}

function buildSuppliers(suppliers: SaftSupplier[]): string {
  if (!suppliers.length) return `    <Suppliers>\n    </Suppliers>`;
  const entries = suppliers
    .map(
      (s) => `      <Supplier>
        <SupplierID>${escapeXml(s.supplierId)}</SupplierID>
        <AccountID>${DEFAULT_GL_ACCOUNT}</AccountID>
        <OpeningCreditBalance>0.00</OpeningCreditBalance>
        <ClosingCreditBalance>0.00</ClosingCreditBalance>
      </Supplier>`,
    )
    .join("\n");
  return `    <Suppliers>
${entries}
    </Suppliers>`;
}

function buildProducts(products: SaftProduct[]): string {
  if (!products.length) return `    <Products>\n    </Products>`;
  const entries = products
    .map(
      (p) => `      <Product>
        <ProductCode>${escapeXml(p.productCode)}</ProductCode>
        <Description>${escapeXml(p.description)}</Description>
        <ProductCommodityCode>${DEFAULT_COMMODITY_CODE}</ProductCommodityCode>
        <UOMBase>${escapeXml(p.unitOfMeasure)}</UOMBase>
        <UOMStandard>${escapeXml(p.unitOfMeasure)}</UOMStandard>
        <UOMToUOMBaseConversionFactor>1</UOMToUOMBaseConversionFactor>
      </Product>`,
    )
    .join("\n");
  return `    <Products>
${entries}
    </Products>`;
}

function buildMasterFiles(input: {
  suppliers: SaftSupplier[];
  products: SaftProduct[];
  taxRates: SaftTaxRate[];
}): string {
  return `  <MasterFiles>
    <GeneralLedgerAccounts>
    </GeneralLedgerAccounts>
    <Customers>
    </Customers>
${buildSuppliers(input.suppliers)}
${buildProducts(input.products)}
${buildTaxTable(input.taxRates)}
${buildMovementTypeTable()}
  </MasterFiles>`;
}

function buildStockMovementLine(m: SaftStockMovementInput, lineNumber: number): string {
  const goodsIn = isGoodsIn(m.dbMovementType);
  const customerId = goodsIn ? SELF_PARTY_CODE : RETAIL_CUSTOMER_CODE;
  const supplierId = goodsIn ? (m.supplierId ? escapeXml(m.supplierId) : SELF_PARTY_CODE) : SELF_PARTY_CODE;
  const movementSubType = movementTypeCodeFor(m.dbMovementType);
  const bookValueTag =
    m.bookValue != null ? `\n        <BookValue>${m.bookValue.toFixed(2)}</BookValue>` : "";
  const commentsTag = m.comments
    ? `\n        <MovementComments>${escapeXml(m.comments)}</MovementComments>`
    : "";
  return `      <StockMovementLine>
        <LineNumber>${lineNumber}</LineNumber>
        <AccountID>${DEFAULT_GL_ACCOUNT}</AccountID>
        <CustomerID>${customerId}</CustomerID>
        <SupplierID>${supplierId}</SupplierID>
        <ProductCode>${escapeXml(m.productCode)}</ProductCode>
        <Quantity>${Math.abs(m.quantity).toFixed(3)}</Quantity>
        <UnitOfMeasure>${escapeXml(m.unitOfMeasure)}</UnitOfMeasure>
        <UOMToUOMPhysicalStockConversionFactor>1</UOMToUOMPhysicalStockConversionFactor>${bookValueTag}
        <MovementSubType>${movementSubType}</MovementSubType>${commentsTag}
      </StockMovementLine>`;
}

/** One <StockMovement> per (date, movement type) — same day-bucketing idiom as the Saga export. */
function buildStockMovements(movements: SaftStockMovementInput[]): string {
  const byKey = new Map<string, SaftStockMovementInput[]>();
  for (const m of movements) {
    const key = `${toSaftDate(m.movementDate)}||${m.dbMovementType}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(m);
  }

  const stockMovements = [...byKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, lines], index) => {
      const [date, dbMovementType] = key.split("||");
      const code = movementTypeCodeFor(dbMovementType);
      const linesXml = lines.map((m, i) => buildStockMovementLine(m, i + 1)).join("\n");
      return `    <StockMovement>
      <MovementReference>${date.replace(/-/g, "")}-${code}-${index + 1}</MovementReference>
      <MovementDate>${date}</MovementDate>
      <MovementType>${code}</MovementType>
${linesXml}
    </StockMovement>`;
    });

  return stockMovements.join("\n");
}

export function generateSaftXml(input: {
  header: SaftHeader;
  suppliers: SaftSupplier[];
  products: SaftProduct[];
  taxRates: SaftTaxRate[];
  movements: SaftStockMovementInput[];
}): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="mfp:anaf:dgti:d406:declaratie:v1">
${buildHeader(input.header)}
${buildMasterFiles(input)}
  <SourceDocuments>
    <MovementOfGoods>
      <NumberOfMovementLines>${input.movements.length}</NumberOfMovementLines>
${buildStockMovements(input.movements)}
    </MovementOfGoods>
  </SourceDocuments>
</AuditFile>`;
  return xml;
}
