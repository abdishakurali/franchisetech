/**
 * Balanță Cantitativ-Valorică (Quantitative-Value Balance) generator for Romanian accounting.
 *
 * This document shows opening stock, entries (NIR), exits (sales consumption), and closing stock for a period.
 * Required for Romanian inventory accounting.
 */

const W = 120;

function centre(s: string, w = W): string {
  const pad = Math.max(0, Math.floor((w - s.length) / 2));
  return " ".repeat(pad) + s;
}

const LINE = "=".repeat(W);
const DASH = "-".repeat(W);

export type BalantaIntegrityStatus =
  | "ok"
  | "archived"
  | "missing"
  | "not_tracked"
  | "qty_mismatch";

export type BalantaItem = {
  productId?: string;
  productName: string;
  unit: string;
  openingQty: number;
  openingValue: number;
  entryQty: number;
  entryValue: number;
  exitQty: number;
  exitValue: number;
  closingQty: number;
  closingValue: number;
  integrityStatus?: BalantaIntegrityStatus;
  catalogQty?: number;
  ledgerQty?: number;
};

export type BalantaData = {
  orgName: string;
  orgCui?: string;
  gestiune?: string;
  dateFrom: string;
  dateTo: string;
  currency?: string;
  items: BalantaItem[];
  integrityLabels?: Partial<Record<BalantaIntegrityStatus, string>>;
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatValue(amount: number, currency = "RON"): string {
  if (currency === "RON" || currency === "lei") {
    return `${amount.toFixed(2)} lei`;
  }
  try {
    return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function balantaPdfFilename(dateFrom: string, dateTo: string): string {
  return `balanta-${dateFrom.slice(0, 10)}-${dateTo.slice(0, 10)}`;
}

export function formatRoDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function balantaTxt(data: BalantaData): { text: string; filename: string } {
  const { orgName, orgCui, gestiune, dateFrom, dateTo, items } = data;

  const totals = items.reduce(
    (acc, item) => ({
      openingValue: acc.openingValue + item.openingValue,
      entryValue: acc.entryValue + item.entryValue,
      exitValue: acc.exitValue + item.exitValue,
      closingValue: acc.closingValue + item.closingValue,
    }),
    { openingValue: 0, entryValue: 0, exitValue: 0, closingValue: 0 }
  );

  const lines: string[] = [
    LINE,
    centre(orgName.toUpperCase()),
    orgCui ? centre(`CUI: ${orgCui}`) : "",
    LINE,
    centre("BALANȚĂ CANTITATIV-VALORICĂ"),
    centre(`Perioada: ${formatRoDate(dateFrom)} - ${formatRoDate(dateTo)}`),
    gestiune ? centre(`Gestiune: ${gestiune}`) : "",
    DASH,
    "",
  ];

  // Header row
  const hdr = [
    "Produs".padEnd(25),
    "UM".padEnd(6),
    "Stoc initial".padStart(18),
    "Intrări".padStart(18),
    "Ieșiri".padStart(18),
    "Stoc final".padStart(18),
  ];
  lines.push(hdr.join(" | "));

  const subHdr = [
    "".padEnd(25),
    "".padEnd(6),
    "Cant.".padStart(8) + " Val.".padStart(9),
    "Cant.".padStart(8) + " Val.".padStart(9),
    "Cant.".padStart(8) + " Val.".padStart(9),
    "Cant.".padStart(8) + " Val.".padStart(9),
  ];
  lines.push(subHdr.join(" | "));
  lines.push(DASH);

  for (const item of items) {
    const row = [
      item.productName.substring(0, 25).padEnd(25),
      item.unit.padEnd(6),
      item.openingQty.toFixed(2).padStart(8) + item.openingValue.toFixed(2).padStart(9),
      item.entryQty.toFixed(2).padStart(8) + item.entryValue.toFixed(2).padStart(9),
      item.exitQty.toFixed(2).padStart(8) + item.exitValue.toFixed(2).padStart(9),
      item.closingQty.toFixed(2).padStart(8) + item.closingValue.toFixed(2).padStart(9),
    ];
    lines.push(row.join(" | "));
  }

  lines.push(DASH);

  // Totals row
  const totalRow = [
    "TOTAL".padEnd(25),
    "".padEnd(6),
    "".padStart(8) + totals.openingValue.toFixed(2).padStart(9),
    "".padStart(8) + totals.entryValue.toFixed(2).padStart(9),
    "".padStart(8) + totals.exitValue.toFixed(2).padStart(9),
    "".padStart(8) + totals.closingValue.toFixed(2).padStart(9),
  ];
  lines.push(totalRow.join(" | "));

  lines.push(LINE);
  lines.push("");
  lines.push(`Tipărit la: ${new Date().toLocaleString("ro-RO")}`);

  const filename = `balanta-${dateFrom.slice(0, 10)}-${dateTo.slice(0, 10)}.txt`;
  return { text: lines.filter((l) => l !== undefined).join("\n"), filename };
}

export function balantaHtml(data: BalantaData): string {
  const { orgName, orgCui, gestiune, dateFrom, dateTo, items, currency = "RON" } = data;
  const title = balantaPdfFilename(dateFrom, dateTo);
  const printedAt = new Date().toLocaleString("ro-RO");

  const totals = items.reduce(
    (acc, item) => ({
      openingValue: acc.openingValue + item.openingValue,
      entryValue: acc.entryValue + item.entryValue,
      exitValue: acc.exitValue + item.exitValue,
      closingValue: acc.closingValue + item.closingValue,
    }),
    { openingValue: 0, entryValue: 0, exitValue: 0, closingValue: 0 }
  );

  const rows = items
    .map((item) => {
      const note =
        item.integrityStatus && item.integrityStatus !== "ok"
          ? data.integrityLabels?.[item.integrityStatus] ?? item.integrityStatus
          : "";
      return `
        <tr>
          <td>${escHtml(item.productName)}${note ? `<div class="row-note">${escHtml(note)}</div>` : ""}</td>
          <td>${escHtml(item.unit)}</td>
          <td>${item.openingQty.toFixed(2)}</td>
          <td>${formatValue(item.openingValue, currency)}</td>
          <td>${item.entryQty.toFixed(2)}</td>
          <td>${formatValue(item.entryValue, currency)}</td>
          <td>${item.exitQty.toFixed(2)}</td>
          <td>${formatValue(item.exitValue, currency)}</td>
          <td>${item.closingQty.toFixed(2)}</td>
          <td>${formatValue(item.closingValue, currency)}</td>
        </tr>`;
    })
    .join("");

  const integrityFootnotes = items.filter((i) => i.integrityStatus && i.integrityStatus !== "ok");
  const footnoteHtml =
    integrityFootnotes.length > 0
      ? `<div class="footnotes">
          <strong>Note integritate:</strong>
          ${integrityFootnotes
            .map(
              (i) =>
                `${escHtml(i.productName)} — ${escHtml(data.integrityLabels?.[i.integrityStatus!] ?? i.integrityStatus!)}`,
            )
            .join("; ")}
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      font-size: 10px;
      color: #0f172a;
      padding: 24px 28px;
      max-width: 1100px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 18px;
      border-bottom: 2px solid #0f172a;
      margin-bottom: 20px;
    }
    .brand-block img { height: 34px; width: auto; display: block; }
    .brand-tag {
      margin-top: 6px;
      font-size: 9px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748b;
    }
    .org-block { text-align: right; }
    .org-name { font-size: 17px; font-weight: 600; line-height: 1.3; }
    .org-meta { margin-top: 4px; font-size: 10px; color: #64748b; }
    .doc-title {
      text-align: center;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .doc-period {
      text-align: center;
      font-size: 11px;
      color: #475569;
      margin-bottom: 18px;
    }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: #f8fafc;
      color: #475569;
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 7px 6px;
      border-bottom: 1px solid #cbd5e1;
      text-align: right;
    }
    thead th:first-child,
    thead th:nth-child(2) { text-align: left; }
    thead th.group { text-align: center; border-left: 1px solid #e2e8f0; }
    tbody td {
      padding: 6px;
      border-bottom: 1px solid #f1f5f9;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    tbody td:first-child { text-align: left; font-weight: 500; max-width: 180px; }
    tbody td:nth-child(2) { text-align: left; color: #64748b; }
    .row-note { font-size: 8px; font-weight: 400; color: #b45309; margin-top: 2px; }
    .footnotes {
      margin-top: 14px;
      padding: 10px 12px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      font-size: 9px;
      color: #92400e;
    }
    tbody tr:nth-child(even) td { background: #fafafa; }
    tbody tr.total td {
      font-weight: 700;
      background: #f1f5f9;
      border-top: 2px solid #cbd5e1;
      border-bottom: none;
    }
    .footer {
      margin-top: 22px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="brand-block">
      <img src="/franchise-tech-logo.png" alt="franchisetech" />
      <div class="brand-tag">franchisetech · raport stoc</div>
    </div>
    <div class="org-block">
      <div class="org-name">${escHtml(orgName)}</div>
      ${orgCui ? `<div class="org-meta">CUI ${escHtml(orgCui)}</div>` : ""}
      ${gestiune ? `<div class="org-meta">Gestiune: ${escHtml(gestiune)}</div>` : ""}
    </div>
  </header>

  <h1 class="doc-title">Balanță cantitativ-valorică</h1>
  <p class="doc-period">${formatRoDate(dateFrom)} — ${formatRoDate(dateTo)}</p>

  <table>
    <thead>
      <tr>
        <th rowspan="2">Produs</th>
        <th rowspan="2">UM</th>
        <th colspan="2" class="group">Stoc inițial</th>
        <th colspan="2" class="group">Intrări</th>
        <th colspan="2" class="group">Ieșiri</th>
        <th colspan="2" class="group">Stoc final</th>
      </tr>
      <tr>
        <th class="group">Cant.</th>
        <th>Valoare</th>
        <th class="group">Cant.</th>
        <th>Valoare</th>
        <th class="group">Cant.</th>
        <th>Valoare</th>
        <th class="group">Cant.</th>
        <th>Valoare</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total">
        <td colspan="2">Total</td>
        <td>—</td>
        <td>${formatValue(totals.openingValue, currency)}</td>
        <td>—</td>
        <td>${formatValue(totals.entryValue, currency)}</td>
        <td>—</td>
        <td>${formatValue(totals.exitValue, currency)}</td>
        <td>—</td>
        <td>${formatValue(totals.closingValue, currency)}</td>
      </tr>
    </tbody>
  </table>

  ${footnoteHtml}

  <footer class="footer">
    <span>Generat de franchisetech</span>
    <span>Tipărit: ${printedAt}</span>
  </footer>
</body>
</html>`;
}

export function balantaPdf(data: BalantaData): { html: string; filename: string } {
  return {
    html: balantaHtml(data),
    filename: `${balantaPdfFilename(data.dateFrom, data.dateTo)}.pdf`,
  };
}
