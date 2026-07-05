/**
 * Bon de Consum (Consumption Voucher) generator for Romanian accounting.
 *
 * This document shows ingredients consumed from recipes during a period.
 * Required for Romanian accounting to track raw material consumption.
 */

const W = 80;

function centre(s: string, w = W): string {
  const pad = Math.max(0, Math.floor((w - s.length) / 2));
  return " ".repeat(pad) + s;
}

function padRow(label: string, value: string, w = W): string {
  const gap = w - label.length - value.length;
  return label + (gap > 0 ? " ".repeat(gap) : " ") + value;
}

const LINE = "=".repeat(W);
const DASH = "-".repeat(W);

export type ConsumptionItem = {
  productName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type BonConsumData = {
  orgName: string;
  orgCui?: string;
  documentNumber: string;
  date: string;
  items: ConsumptionItem[];
  notes?: string;
  predator?: string;
  primitor?: string;
};

export function formatRoMoney(amount: number): string {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " lei";
}

export function formatRoDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function bonConsumTxt(data: BonConsumData): { text: string; filename: string } {
  const { orgName, orgCui, documentNumber, date, items, notes, predator, primitor } = data;

  const total = items.reduce((sum, item) => sum + item.totalCost, 0);
  const formattedDate = formatRoDate(date);

  const lines: string[] = [
    LINE,
    centre(orgName.toUpperCase()),
    orgCui ? centre(`CUI: ${orgCui}`) : "",
    LINE,
    centre("BON DE CONSUM (COLECTIV)"),
    centre("Formular 14-3-4/aA"),
    centre(`Nr. ${documentNumber}`),
    DASH,
    padRow("Data:", formattedDate),
    DASH,
    "",
    `${"Nr.".padEnd(5)} ${"Produs".padEnd(30)} ${"UM".padEnd(8)} ${"Cant.".padStart(10)} ${"Preț unit.".padStart(12)} ${"Valoare".padStart(12)}`,
    DASH,
  ];

  items.forEach((item, idx) => {
    lines.push(
      `${String(idx + 1).padEnd(5)} ${item.productName.substring(0, 30).padEnd(30)} ${item.unit.padEnd(8)} ${item.quantity.toFixed(2).padStart(10)} ${item.unitCost.toFixed(2).padStart(12)} ${item.totalCost.toFixed(2).padStart(12)}`
    );
  });

  lines.push(
    DASH,
    `${"".padEnd(5)} ${"TOTAL".padEnd(30)} ${"".padEnd(8)} ${"".padStart(10)} ${"".padStart(12)} ${total.toFixed(2).padStart(12)}`,
    LINE,
  );

  if (notes) {
    lines.push("", `Observații: ${notes}`, "");
  }

  lines.push(
    "",
    `Gestionar predător: ${predator ?? "___________________________"}`,
    "",
    `Gestionar primitor: ${primitor ?? "___________________________"}`,
    "",
    LINE,
    `Tipărit la: ${new Date().toLocaleString("ro-RO")}`,
  );

  const filename = `bon-consum-${documentNumber}-${date.slice(0, 10)}.txt`;
  return { text: lines.filter(l => l !== undefined).join("\n"), filename };
}

export function bonConsumHtml(data: BonConsumData): string {
  const { orgName, orgCui, documentNumber, date, items, notes, predator, primitor } = data;
  const total = items.reduce((sum, item) => sum + item.totalCost, 0);
  const formattedDate = formatRoDate(date);

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>Bon de Consum ${documentNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
    .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: bold; }
    .text-right { text-align: right; }
    .total-row { font-weight: bold; background: #f9f9f9; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature-box { text-align: center; }
    .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 50px; padding-top: 5px; }
    .notes { margin: 20px 0; padding: 10px; background: #f9f9f9; border-radius: 4px; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <h1>${orgName}</h1>
  ${orgCui ? `<div class="subtitle">CUI: ${orgCui}</div>` : ""}

  <h1>BON DE CONSUM (COLECTIV)</h1>
  <div class="subtitle">Formular 14-3-4/aA</div>
  <div class="subtitle">Nr. ${documentNumber}</div>

  <div class="header">
    <div><strong>Data:</strong> ${formattedDate}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">Nr.</th>
        <th>Produs</th>
        <th style="width: 60px;">UM</th>
        <th style="width: 80px;" class="text-right">Cantitate</th>
        <th style="width: 100px;" class="text-right">Preț unitar</th>
        <th style="width: 100px;" class="text-right">Valoare</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.productName}</td>
          <td>${item.unit}</td>
          <td class="text-right">${item.quantity.toFixed(2)}</td>
          <td class="text-right">${item.unitCost.toFixed(2)}</td>
          <td class="text-right">${item.totalCost.toFixed(2)}</td>
        </tr>
      `).join("")}
      <tr class="total-row">
        <td colspan="5" class="text-right">TOTAL:</td>
        <td class="text-right">${total.toFixed(2)} lei</td>
      </tr>
    </tbody>
  </table>

  ${notes ? `<div class="notes"><strong>Observații:</strong> ${notes}</div>` : ""}

  <div class="signatures">
    <div class="signature-box">
      <div class="signature-line">Gestionar predător</div>
      ${predator ? `<div>${predator}</div>` : ""}
    </div>
    <div class="signature-box">
      <div class="signature-line">Gestionar primitor</div>
      ${primitor ? `<div>${primitor}</div>` : ""}
    </div>
  </div>
</body>
</html>
  `;
}
