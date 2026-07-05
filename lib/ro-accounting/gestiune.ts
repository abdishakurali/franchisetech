/**
 * Raport de Gestiune (Stock Management Report) generator for Romanian accounting.
 *
 * This is a comprehensive report that combines all stock movements:
 * - Opening inventory value (Stoc inițial)
 * - NIR entries (purchases)
 * - Consumption (Bon de consum)
 * - Sales (Z-report values)
 * - Closing inventory value (Stoc final)
 *
 * Split by TVA rate (21%, 11%, 5%, 0%)
 */

export type GestiuneMovement = {
  date: string;
  documentType: "stoc_initial" | "nir" | "consum" | "vanzare" | "stoc_final" | "ajustare";
  documentNumber?: string;
  description: string;
  tva19: number;
  tva9: number;
  tva5: number;
  tva0: number;
  total: number;
};

export type GestiuneData = {
  orgName: string;
  orgCui?: string;
  gestiune?: string;
  dateFrom: string;
  dateTo: string;
  movements: GestiuneMovement[];
};

function formatRoDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const DOCUMENT_TYPE_LABELS: Record<GestiuneMovement["documentType"], string> = {
  stoc_initial: "Stoc inițial",
  nir: "NIR",
  consum: "Bon de consum",
  vanzare: "Vânzare (Z)",
  stoc_final: "Stoc final",
  ajustare: "Ajustare",
};

export function gestiuneHtml(data: GestiuneData): string {
  const { orgName, orgCui, gestiune, dateFrom, dateTo, movements } = data;

  // stoc_initial is a starting balance, not a period inflow -- must not be
  // folded into "intrari" totals (same fix as app/app/reports/gestiune/page.tsx).
  const totals = movements.reduce(
    (acc, m) => {
      if (m.documentType === "nir") {
        acc.intrari19 += m.tva19;
        acc.intrari9 += m.tva9;
        acc.intrari5 += m.tva5;
        acc.intrari0 += m.tva0;
        acc.intrariTotal += m.total;
      } else if (m.documentType === "consum" || m.documentType === "vanzare") {
        acc.iesiri19 += m.tva19;
        acc.iesiri9 += m.tva9;
        acc.iesiri5 += m.tva5;
        acc.iesiri0 += m.tva0;
        acc.iesiriTotal += m.total;
      }
      return acc;
    },
    { intrari19: 0, intrari9: 0, intrari5: 0, intrari0: 0, intrariTotal: 0, iesiri19: 0, iesiri9: 0, iesiri5: 0, iesiri0: 0, iesiriTotal: 0 }
  );

  const stocFinal = movements.find((m) => m.documentType === "stoc_final");

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>Raport de Gestiune</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10px; padding: 15px; max-width: 1100px; margin: 0 auto; }
    h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
    .subtitle { text-align: center; color: #666; margin-bottom: 10px; font-size: 11px; }
    .header { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
    .header-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .header-item { flex: 1; min-width: 150px; }
    .header-item label { color: #666; font-size: 9px; display: block; }
    .header-item span { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9px; }
    th, td { border: 1px solid #ccc; padding: 4px 6px; }
    th { background: #f5f5f5; font-weight: bold; text-align: center; font-size: 8px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { font-weight: bold; background: #e8f4e8; }
    .subtotal-row { background: #f9f9f9; font-weight: 600; }
    .stoc-row { background: #e8f0ff; }
    .type-nir { color: #16a34a; }
    .type-consum { color: #dc2626; }
    .type-vanzare { color: #2563eb; }
    .summary { margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .summary-box { border: 1px solid #ccc; border-radius: 4px; padding: 10px; }
    .summary-box h3 { font-size: 11px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    .summary-row { display: flex; justify-content: space-between; margin: 3px 0; }
    .summary-row label { color: #666; }
    .summary-row span { font-weight: bold; }
    @media print {
      body { padding: 0; font-size: 8px; }
      @page { margin: 10mm; size: landscape; }
      table { font-size: 7px; }
      th { font-size: 7px; }
    }
  </style>
</head>
<body>
  <h1>${orgName}</h1>
  ${orgCui ? `<div class="subtitle">CUI: ${orgCui}</div>` : ""}

  <h1>RAPORT DE GESTIUNE</h1>

  <div class="header">
    <div class="header-row">
      <div class="header-item">
        <label>Perioada:</label>
        <span>${formatRoDate(dateFrom)} - ${formatRoDate(dateTo)}</span>
      </div>
      ${gestiune ? `<div class="header-item"><label>Gestiune:</label><span>${gestiune}</span></div>` : ""}
      <div class="header-item">
        <label>Generat la:</label>
        <span>${new Date().toLocaleString("ro-RO")}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th rowspan="2">Data</th>
        <th rowspan="2">Tip document</th>
        <th rowspan="2">Nr. doc.</th>
        <th rowspan="2">Descriere</th>
        <th colspan="5" class="text-center">Valoare (lei)</th>
      </tr>
      <tr>
        <th style="width: 70px;">TVA 21%</th>
        <th style="width: 70px;">TVA 11%</th>
        <th style="width: 70px;">TVA 5%</th>
        <th style="width: 70px;">TVA 0%</th>
        <th style="width: 80px;">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${movements
        .map((m) => {
          const typeClass =
            m.documentType === "nir"
              ? "type-nir"
              : m.documentType === "consum"
                ? "type-consum"
                : m.documentType === "vanzare"
                  ? "type-vanzare"
                  : "";
          const rowClass =
            m.documentType === "stoc_initial" || m.documentType === "stoc_final" ? "stoc-row" : "";
          return `
        <tr class="${rowClass}">
          <td class="text-center">${formatRoDate(m.date)}</td>
          <td class="${typeClass}">${DOCUMENT_TYPE_LABELS[m.documentType]}</td>
          <td class="text-center">${m.documentNumber ?? "—"}</td>
          <td>${m.description}</td>
          <td class="text-right">${m.tva19.toFixed(2)}</td>
          <td class="text-right">${m.tva9.toFixed(2)}</td>
          <td class="text-right">${m.tva5.toFixed(2)}</td>
          <td class="text-right">${m.tva0.toFixed(2)}</td>
          <td class="text-right">${m.total.toFixed(2)}</td>
        </tr>
      `;
        })
        .join("")}

      <tr class="subtotal-row">
        <td colspan="4" class="text-right">Total intrări (Stoc inițial + NIR):</td>
        <td class="text-right">${totals.intrari19.toFixed(2)}</td>
        <td class="text-right">${totals.intrari9.toFixed(2)}</td>
        <td class="text-right">${totals.intrari5.toFixed(2)}</td>
        <td class="text-right">${totals.intrari0.toFixed(2)}</td>
        <td class="text-right">${totals.intrariTotal.toFixed(2)}</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="4" class="text-right">Total ieșiri (Consum + Vânzări):</td>
        <td class="text-right">${totals.iesiri19.toFixed(2)}</td>
        <td class="text-right">${totals.iesiri9.toFixed(2)}</td>
        <td class="text-right">${totals.iesiri5.toFixed(2)}</td>
        <td class="text-right">${totals.iesiri0.toFixed(2)}</td>
        <td class="text-right">${totals.iesiriTotal.toFixed(2)}</td>
      </tr>
      ${
        stocFinal
          ? `
      <tr class="total-row">
        <td colspan="4" class="text-right">Stoc final:</td>
        <td class="text-right">${stocFinal.tva19.toFixed(2)}</td>
        <td class="text-right">${stocFinal.tva9.toFixed(2)}</td>
        <td class="text-right">${stocFinal.tva5.toFixed(2)}</td>
        <td class="text-right">${stocFinal.tva0.toFixed(2)}</td>
        <td class="text-right">${stocFinal.total.toFixed(2)}</td>
      </tr>
      `
          : ""
      }
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-box">
      <h3>Stoc</h3>
      <div class="summary-row"><label>Stoc inițial:</label><span>${movements.find((m) => m.documentType === "stoc_initial")?.total.toFixed(2) ?? "0.00"} lei</span></div>
      <div class="summary-row"><label>Stoc final:</label><span>${stocFinal?.total.toFixed(2) ?? "0.00"} lei</span></div>
    </div>
    <div class="summary-box">
      <h3>Intrări</h3>
      <div class="summary-row"><label>NIR (achiziții):</label><span>${movements.filter((m) => m.documentType === "nir").reduce((s, m) => s + m.total, 0).toFixed(2)} lei</span></div>
      <div class="summary-row"><label>Total intrări:</label><span>${totals.intrariTotal.toFixed(2)} lei</span></div>
    </div>
    <div class="summary-box">
      <h3>Ieșiri</h3>
      <div class="summary-row"><label>Consum:</label><span>${movements.filter((m) => m.documentType === "consum").reduce((s, m) => s + m.total, 0).toFixed(2)} lei</span></div>
      <div class="summary-row"><label>Vânzări:</label><span>${movements.filter((m) => m.documentType === "vanzare").reduce((s, m) => s + m.total, 0).toFixed(2)} lei</span></div>
      <div class="summary-row"><label>Total ieșiri:</label><span>${totals.iesiriTotal.toFixed(2)} lei</span></div>
    </div>
  </div>
</body>
</html>
  `;
}
