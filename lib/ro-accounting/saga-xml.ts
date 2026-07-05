/**
 * Saga C XML export — element-based schema matching Saga's actual importer.
 *
 * Routing logic (built into Saga):
 *   FurnizorCIF == own company CIF  →  Ieșiri (sales)
 *   FurnizorCIF != own company CIF  →  Intrări / NIR (purchases)
 *
 * Reference: manual.sagasoft.ro/sagac/topic-76-import-date.html
 */

export type SagaLinie = {
  descriere: string;
  um: string;
  cantitate: number;
  pret: number;      // unit price excl. VAT
  valoare: number;   // line total excl. VAT
  procTva: number;   // VAT rate as integer (9, 19, 5, 0)
  tva: number;       // VAT amount
  // Required for cantitativ-valorică gestiuni: must match the article code in Saga's nomenclature
  codArticolFurnizor?: string;
};

export type SagaFactura = {
  furnizorNume: string;
  furnizorCif: string;
  clientNume: string;
  clientCif: string;
  facturaNumar: string;
  facturaData: string; // DD.MM.YYYY
  gestiune?: string;
  linii: SagaLinie[];
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatSagaDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

function renderLinie(linie: SagaLinie, nr: number): string {
  const codTag = linie.codArticolFurnizor
    ? `\n          <CodArticolFurnizor>${escapeXml(linie.codArticolFurnizor)}</CodArticolFurnizor>`
    : "";
  return `        <Linie>
          <LinieNrCrt>${nr}</LinieNrCrt>
          <Descriere>${escapeXml(linie.descriere)}</Descriere>${codTag}
          <UM>${escapeXml(linie.um)}</UM>
          <Cantitate>${linie.cantitate.toFixed(3)}</Cantitate>
          <Pret>${linie.pret.toFixed(2)}</Pret>
          <Valoare>${linie.valoare.toFixed(2)}</Valoare>
          <ProcTVA>${linie.procTva}</ProcTVA>
          <TVA>${linie.tva.toFixed(2)}</TVA>
        </Linie>`;
}

function renderFactura(factura: SagaFactura): string {
  const liniiXml = factura.linii.map((l, i) => renderLinie(l, i + 1)).join("\n");
  const gestiuneXml = factura.gestiune
    ? `\n      <Gestiune>${escapeXml(factura.gestiune)}</Gestiune>`
    : "";
  return `  <Factura>
    <Antet>
      <FurnizorNume>${escapeXml(factura.furnizorNume)}</FurnizorNume>
      <FurnizorCIF>${escapeXml(factura.furnizorCif)}</FurnizorCIF>
      <ClientNume>${escapeXml(factura.clientNume)}</ClientNume>
      <ClientCIF>${escapeXml(factura.clientCif)}</ClientCIF>
      <FacturaNumar>${escapeXml(factura.facturaNumar)}</FacturaNumar>
      <FacturaData>${factura.facturaData}</FacturaData>${gestiuneXml}
    </Antet>
    <Detalii>
      <Continut>
${liniiXml}
      </Continut>
    </Detalii>
  </Factura>`;
}

export function generateFacturiXml(facturi: SagaFactura[]): string {
  const body = facturi.map(renderFactura).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Facturi>\n${body}\n</Facturi>`;
}
