/**
 * Saga XML Export helpers for Romanian accounting software integration.
 *
 * Saga is one of the most widely used accounting software in Romania.
 * These helpers generate XML files compatible with Saga's import format.
 */

export type SagaNirArticle = {
  denumire: string;
  cantitate: number;
  um: string;
  pretUnitar: number;
  cotaTva: number;
};

export type SagaNir = {
  data: string;
  furnizor: string;
  nrFactura?: string;
  valoare: number;
  tva: number;
  articole: SagaNirArticle[];
};

export type SagaVanzare = {
  data: string;
  valoare: number;
  tva: number;
  totalTva19?: number;
  totalTva9?: number;
  totalTva5?: number;
  totalTva0?: number;
};

export type SagaExportData = {
  orgName: string;
  orgCui?: string;
  nirList?: SagaNir[];
  vanzariList?: SagaVanzare[];
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function generateNirXml(data: { orgName: string; orgCui?: string; nirList: SagaNir[] }): string {
  const { orgName, orgCui, nirList } = data;

  const nirElements = nirList.map((nir) => {
    const articoleElements = nir.articole
      .map(
        (art) =>
          `    <ARTICOL DENUMIRE="${escapeXml(art.denumire)}" CANT="${art.cantitate.toFixed(3)}" UM="${escapeXml(art.um)}" PRET="${art.pretUnitar.toFixed(2)}" CTVA="${art.cotaTva}"/>`
      )
      .join("\n");

    return `  <NIR DATA="${formatDate(nir.data)}" FURNIZOR="${escapeXml(nir.furnizor)}"${nir.nrFactura ? ` FACTURA="${escapeXml(nir.nrFactura)}"` : ""} VALOARE="${nir.valoare.toFixed(2)}" TVA="${nir.tva.toFixed(2)}">
${articoleElements}
  </NIR>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Export NIR pentru Saga -->
<!-- Generat de ${escapeXml(orgName)}${orgCui ? ` (CUI: ${orgCui})` : ""} -->
<!-- Data export: ${new Date().toISOString()} -->
<TRANZACTII>
${nirElements.join("\n")}
</TRANZACTII>`;
}

export function generateSalesXml(data: { orgName: string; orgCui?: string; vanzariList: SagaVanzare[] }): string {
  const { orgName, orgCui, vanzariList } = data;

  const vanzareElements = vanzariList.map((v) => {
    const tvaBreakdown: string[] = [];
    if (v.totalTva19 && v.totalTva19 > 0) {
      tvaBreakdown.push(`    <TOTAL_TVA19>${v.totalTva19.toFixed(2)}</TOTAL_TVA19>`);
    }
    if (v.totalTva9 && v.totalTva9 > 0) {
      tvaBreakdown.push(`    <TOTAL_TVA9>${v.totalTva9.toFixed(2)}</TOTAL_TVA9>`);
    }
    if (v.totalTva5 && v.totalTva5 > 0) {
      tvaBreakdown.push(`    <TOTAL_TVA5>${v.totalTva5.toFixed(2)}</TOTAL_TVA5>`);
    }
    if (v.totalTva0 && v.totalTva0 > 0) {
      tvaBreakdown.push(`    <TOTAL_TVA0>${v.totalTva0.toFixed(2)}</TOTAL_TVA0>`);
    }

    const breakdownContent = tvaBreakdown.length > 0 ? `\n${tvaBreakdown.join("\n")}\n  ` : "";

    return `  <VANZARE DATA="${formatDate(v.data)}" VALOARE="${v.valoare.toFixed(2)}" TVA="${v.tva.toFixed(2)}">${breakdownContent}</VANZARE>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Export Vanzari pentru Saga -->
<!-- Generat de ${escapeXml(orgName)}${orgCui ? ` (CUI: ${orgCui})` : ""} -->
<!-- Data export: ${new Date().toISOString()} -->
<TRANZACTII>
${vanzareElements.join("\n")}
</TRANZACTII>`;
}

export function generateCombinedXml(data: SagaExportData): string {
  const { orgName, orgCui, nirList = [], vanzariList = [] } = data;

  const nirElements = nirList.map((nir) => {
    const articoleElements = nir.articole
      .map(
        (art) =>
          `      <ARTICOL DENUMIRE="${escapeXml(art.denumire)}" CANT="${art.cantitate.toFixed(3)}" UM="${escapeXml(art.um)}" PRET="${art.pretUnitar.toFixed(2)}" CTVA="${art.cotaTva}"/>`
      )
      .join("\n");

    return `    <NIR DATA="${formatDate(nir.data)}" FURNIZOR="${escapeXml(nir.furnizor)}"${nir.nrFactura ? ` FACTURA="${escapeXml(nir.nrFactura)}"` : ""} VALOARE="${nir.valoare.toFixed(2)}" TVA="${nir.tva.toFixed(2)}">
${articoleElements}
    </NIR>`;
  });

  const vanzareElements = vanzariList.map((v) => {
    const tvaBreakdown: string[] = [];
    if (v.totalTva19 && v.totalTva19 > 0) {
      tvaBreakdown.push(`      <TOTAL_TVA19>${v.totalTva19.toFixed(2)}</TOTAL_TVA19>`);
    }
    if (v.totalTva9 && v.totalTva9 > 0) {
      tvaBreakdown.push(`      <TOTAL_TVA9>${v.totalTva9.toFixed(2)}</TOTAL_TVA9>`);
    }
    if (v.totalTva5 && v.totalTva5 > 0) {
      tvaBreakdown.push(`      <TOTAL_TVA5>${v.totalTva5.toFixed(2)}</TOTAL_TVA5>`);
    }
    if (v.totalTva0 && v.totalTva0 > 0) {
      tvaBreakdown.push(`      <TOTAL_TVA0>${v.totalTva0.toFixed(2)}</TOTAL_TVA0>`);
    }

    const breakdownContent = tvaBreakdown.length > 0 ? `\n${tvaBreakdown.join("\n")}\n    ` : "";

    return `    <VANZARE DATA="${formatDate(v.data)}" VALOARE="${v.valoare.toFixed(2)}" TVA="${v.tva.toFixed(2)}">${breakdownContent}</VANZARE>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Export combinat NIR + Vanzari pentru Saga -->
<!-- Generat de ${escapeXml(orgName)}${orgCui ? ` (CUI: ${orgCui})` : ""} -->
<!-- Data export: ${new Date().toISOString()} -->
<EXPORT>
  <NIR_LIST>
${nirElements.join("\n")}
  </NIR_LIST>
  <VANZARI_LIST>
${vanzareElements.join("\n")}
  </VANZARI_LIST>
</EXPORT>`;
}
