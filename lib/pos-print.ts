/**
 * POS receipt / cash register documents.
 *
 * All documents are downloaded as plain-text (.txt) files — no popup windows.
 * Format follows the Romanian REGISTRU DE CASA (cash book) standard used in
 * the fiscal_cash_register Odoo module.
 *
 * For thermal popup print (legacy, Ireland only), printSlip() is still exported
 * but no longer called for standard flows.
 */

// ─── helpers ─────────────────────────────────────────────────────────────────

const W = 48; // column width for TXT documents

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

export function slipMoney(amount: number, currency: string): string {
  if (currency === "RON" || currency === "lei")
    return `${Math.abs(amount).toFixed(2)} lei`;
  return `€${Math.abs(amount).toFixed(2)}`;
}

export function slipDate(): string {
  return new Intl.DateTimeFormat("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function slipFilename(prefix: string): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${prefix}-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}-${p(now.getHours())}-${p(now.getMinutes())}.txt`;
}

// ─── download helper ──────────────────────────────────────────────────────────

/**
 * Download plain-text content as a .txt file.
 * No popup blocker risk — browser saves directly to Downloads.
 */
export function downloadSlipAsTxt(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── 1. Opening float (SOLD INITIAL) ─────────────────────────────────────────

export function openingBalanceTxt(opts: {
  orgName: string;
  sessionName?: string;
  currency: string;
  amount: number;
  userName: string;
}): { text: string; filename: string } {
  const { orgName, sessionName, currency, amount, userName } = opts;
  const now = slipDate();
  const lines = [
    LINE,
    centre(orgName.toUpperCase()),
    sessionName ? centre(`Casa: ${sessionName}`) : "",
    LINE,
    centre("SOLD INITIAL / OPENING FLOAT"),
    DASH,
    padRow("Data:", now),
    padRow("Casier / Opened by:", userName),
    DASH,
    padRow("SOLD INITIAL:", slipMoney(amount, currency)),
    LINE,
    "",
    "Semnatura casier / Cashier signature:",
    "",
    "_____________________________",
    "",
    `Tiparit / Printed: ${now}`,
  ].filter((l) => l !== undefined);
  return { text: lines.join("\n"), filename: slipFilename("sold-initial") };
}

// ─── 2. Cash In slip (CHI) ────────────────────────────────────────────────────

export function cashInTxt(opts: {
  orgName: string;
  sessionName?: string;
  currency: string;
  amount: number;
  reason: string;
  userName: string;
  docNumber?: string; // e.g. "CHI0001"
}): { text: string; filename: string } {
  const { orgName, sessionName, currency, amount, reason, userName, docNumber } = opts;
  const now = slipDate();
  const ref = docNumber ?? "CHI";
  const lines = [
    LINE,
    centre(orgName.toUpperCase()),
    sessionName ? centre(`Casa: ${sessionName}`) : "",
    LINE,
    centre("CHITANTA INCASARE / CASH IN"),
    centre(ref),
    DASH,
    padRow("Data:", now),
    padRow("Casier / By:", userName),
    DASH,
    padRow("INCASAT:", slipMoney(amount, currency)),
    reason ? padRow("Motiv / Reason:", reason) : "",
    LINE,
    "",
    "Semnatura / Signature: _____________________",
    "",
    `Tiparit / Printed: ${now}`,
  ].filter((l) => l !== undefined);
  return { text: lines.join("\n"), filename: slipFilename(`cash-in-${ref}`) };
}

// ─── 3. Cash Out slip (CHO) ───────────────────────────────────────────────────

export function cashOutTxt(opts: {
  orgName: string;
  sessionName?: string;
  currency: string;
  amount: number;
  reason: string;
  userName: string;
  docNumber?: string; // e.g. "CHO0001"
}): { text: string; filename: string } {
  const { orgName, sessionName, currency, amount, reason, userName, docNumber } = opts;
  const now = slipDate();
  const ref = docNumber ?? "CHO";
  const lines = [
    LINE,
    centre(orgName.toUpperCase()),
    sessionName ? centre(`Casa: ${sessionName}`) : "",
    LINE,
    centre("DISPOZITIE DE PLATA / CASH OUT"),
    centre(ref),
    DASH,
    padRow("Data:", now),
    padRow("Casier / By:", userName),
    DASH,
    padRow("PLATIT:", slipMoney(amount, currency)),
    reason ? padRow("Motiv / Reason:", reason) : "",
    LINE,
    "",
    "Semnatura / Signature: _____________________",
    "",
    `Tiparit / Printed: ${now}`,
  ].filter((l) => l !== undefined);
  return { text: lines.join("\n"), filename: slipFilename(`cash-out-${ref}`) };
}

// ─── 4. REGISTRU DE CASA (full cash book — close till) ───────────────────────

export type CashMovementRow = {
  movement_type: "opening" | "cash_in" | "cash_out";
  amount: number; // positive = in, negative = out
  reason: string | null;
  created_at: string;
};

export function registruDeCasaTxt(opts: {
  orgName: string;
  sessionName: string;
  currency: string;
  openingCash: number;
  movements: CashMovementRow[];
  cashSales: number;
  countedCash: number;
  expectedCash: number;
  notes: string;
  userName: string;
  dateStart?: string;
  dateEnd?: string;
}): { text: string; filename: string } {
  const {
    orgName, sessionName, currency, openingCash, movements,
    cashSales, countedCash, expectedCash, notes, userName,
    dateStart, dateEnd,
  } = opts;

  const now = slipDate();
  const diff = countedCash - expectedCash;
  const diffStr =
    diff === 0
      ? "EXACT"
      : `${diff > 0 ? "+" : ""}${slipMoney(Math.abs(diff), currency)} ${diff > 0 ? "(SURPLUS / PLUS)" : "(LIPSA / SHORT)"}`;

  // Filter to manual cash in/out only (exclude opening and sales)
  const manualMoves = movements.filter(
    (m) => m.movement_type === "cash_in" || m.movement_type === "cash_out"
  );

  let chiCount = 0;
  let choCount = 0;
  let totalCashIn = 0; // manual cash in only
  let totalCashOut = 0; // manual cash out only

  const rows: string[] = [];

  // Nr. crt header
  rows.push(
    `${"Nr".padEnd(4)} ${"Data".padEnd(16)} ${"Nr.Act".padEnd(8)} ${"Explicatie".padEnd(18)} ${"Incasari".padStart(8)} ${"Plati".padStart(8)}`
  );
  rows.push("-".repeat(W + 18));

  // Opening balance row
  const openDateStr = dateStart
    ? new Date(dateStart).toLocaleDateString("ro-RO")
    : now.split(",")[0];
  rows.push(
    `${"".padEnd(4)} ${openDateStr.padEnd(16)} ${"SOLD INI".padEnd(8)} ${"Sold initial / Opening float".padEnd(18)} ${slipMoney(openingCash, currency).padStart(8)} ${"".padStart(8)}`
  );
  // Manual cash movements
  for (const m of manualMoves) {
    const dateStr = new Date(m.created_at).toLocaleDateString("ro-RO");
    const timeStr = new Date(m.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
    const isIn = m.amount > 0;

    if (isIn) {
      chiCount++;
      const ref = `CHI${String(chiCount).padStart(4, "0")}`;
      const desc = (m.reason || "Incasare").substring(0, 18);
      rows.push(
        `${String(chiCount).padEnd(4)} ${(dateStr + " " + timeStr).padEnd(16)} ${ref.padEnd(8)} ${desc.padEnd(18)} ${slipMoney(m.amount, currency).padStart(8)} ${"".padStart(8)}`
      );
      totalCashIn += Math.abs(m.amount);
    } else {
      choCount++;
      const ref = `CHO${String(choCount).padStart(4, "0")}`;
      const desc = (m.reason || "Plata").substring(0, 18);
      rows.push(
        `${String(chiCount + choCount).padEnd(4)} ${(dateStr + " " + timeStr).padEnd(16)} ${ref.padEnd(8)} ${desc.padEnd(18)} ${"".padStart(8)} ${slipMoney(Math.abs(m.amount), currency).padStart(8)}`
      );
      totalCashOut += Math.abs(m.amount);
    }
  }

  // Cash sales row (POS transactions total)
  if (cashSales > 0) {
    const closeDateStr = dateEnd
      ? new Date(dateEnd).toLocaleDateString("ro-RO")
      : now.split(",")[0];
    chiCount++;
    const ref = `CHI${String(chiCount).padStart(4, "0")}`;
    rows.push(
      `${String(chiCount + choCount).padEnd(4)} ${closeDateStr.padEnd(16)} ${ref.padEnd(8)} ${"Vanzari POS/Cash sales".substring(0, 18).padEnd(18)} ${slipMoney(cashSales, currency).padStart(8)} ${"".padStart(8)}`
    );
    totalCashIn += cashSales;
  }

  // Totals (Rulaj zi)
  rows.push("-".repeat(W + 18));
  rows.push(
    `${"".padEnd(4)} ${"".padEnd(16)} ${"".padEnd(8)} ${"RULAJ ZI / DAY TOTAL".padEnd(18)} ${slipMoney(totalCashIn, currency).padStart(8)} ${slipMoney(totalCashOut, currency).padStart(8)}`
  );

  // Final balance
  const finalBalance = openingCash + totalCashIn - totalCashOut;
  const closeDateStr2 = dateEnd
    ? new Date(dateEnd).toLocaleDateString("ro-RO")
    : now.split(",")[0];
  rows.push(
    `${"".padEnd(4)} ${"".padEnd(16)} ${"".padEnd(8)} ${"SOLD FINAL " + closeDateStr2.padEnd(7).padEnd(18)} ${slipMoney(finalBalance, currency).padStart(8)} ${"".padStart(8)}`
  );

  const lines = [
    LINE,
    centre("REGISTRU DE CASA"),
    DASH,
    padRow("Unitatea / Company:", orgName),
    padRow("Contul casa / Register:", sessionName),
    padRow("Data raport / Report date:", now),
    padRow("Casier / Cashier:", userName),
    LINE,
    ...rows,
    LINE,
    padRow("SOLD INITIAL:", slipMoney(openingCash, currency)),
    padRow("Total incasari / Total in:", slipMoney(totalCashIn, currency)),
    padRow("Total plati / Total out:", slipMoney(totalCashOut, currency)),
    padRow("SOLD FINAL / Final balance:", slipMoney(finalBalance, currency)),
    DASH,
    padRow("Numarat / Counted cash:", slipMoney(countedCash, currency)),
    padRow("Diferenta / Difference:", diffStr),
    ...(notes ? [DASH, `Note: ${notes}`] : []),
    LINE,
    "",
    "Casier / Cashier:                    Contabil / Accountant:",
    "",
    "_____________________                _____________________",
    "",
    `Tiparit / Printed: ${now}`,
  ];

  return { text: lines.join("\n"), filename: slipFilename("registru-de-casa") };
}

// ─── 5. Legacy popup print (thermal receipt) — kept for compatibility ────────

export function printSlip(html: string): void {
  const win = window.open("", "_blank", "width=420,height=600,menubar=no,toolbar=no,scrollbars=yes");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    width: 72mm;
    padding: 5mm 4mm;
    background: white;
    color: black;
    line-height: 1.5;
  }
  @media print {
    body { width: 72mm; }
    @page { margin: 0; size: 72mm auto; }
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
  .large { font-size: 15px; font-weight: bold; }
  .divider { border: none; border-top: 1px dashed #333; margin: 3mm 0; }
  .row { display: flex; justify-content: space-between; padding: 0.5mm 0; }
  .total-row { display: flex; justify-content: space-between; padding: 2mm 0; font-weight: bold; font-size: 13px; }
  .diff-pos { color: #166534; }
  .diff-neg { color: #991b1b; }
  .spacer { margin-top: 4mm; }
</style>
</head>
<body>
${html}
<script>
  window.onload = function() {
    window.print();
    setTimeout(function() { window.close(); }, 800);
  };
<\/script>
</body>
</html>`);
  win.document.close();
}

// ─── escaping helper (used by legacy slips) ──────────────────────────────────
function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Legacy HTML slip builders (kept for potential use) ──────────────────────

export function cashInSlip(opts: { orgName: string; currency: string; amount: number; reason: string; userName: string }): string {
  const { orgName, currency, amount, reason, userName } = opts;
  return `<div class="center bold large">${escHtml(orgName)}</div><hr class="divider"/><div class="center bold">CASH IN SLIP</div><hr class="divider"/><div class="row"><span>Date:</span><span>${slipDate()}</span></div><div class="row"><span>By:</span><span>${escHtml(userName)}</span></div><hr class="divider"/><div class="total-row"><span>Amount</span><span>+${slipMoney(amount, currency)}</span></div><div class="row"><span>Reason:</span><span>${escHtml(reason)}</span></div>`;
}

export function cashOutSlip(opts: { orgName: string; currency: string; amount: number; reason: string; userName: string }): string {
  const { orgName, currency, amount, reason, userName } = opts;
  return `<div class="center bold large">${escHtml(orgName)}</div><hr class="divider"/><div class="center bold">CASH OUT SLIP</div><hr class="divider"/><div class="row"><span>Date:</span><span>${slipDate()}</span></div><div class="row"><span>By:</span><span>${escHtml(userName)}</span></div><hr class="divider"/><div class="total-row"><span>Amount</span><span>-${slipMoney(amount, currency)}</span></div><div class="row"><span>Reason:</span><span>${escHtml(reason)}</span></div>`;
}

export function closeTillSlip(opts: { orgName: string; currency: string; openingCash: number; cashSales: number; cardSales: number; expectedCash: number; countedCash: number; notes: string; userName: string }): string {
  const { orgName, currency, openingCash, cashSales, cardSales, expectedCash, countedCash, notes, userName } = opts;
  const diff = countedCash - expectedCash;
  return `<div class="center bold large">${escHtml(orgName)}</div><hr class="divider"/><div class="center bold">CLOSING TILL</div><hr class="divider"/><div class="row"><span>Date:</span><span>${slipDate()}</span></div><div class="row"><span>Closed by:</span><span>${escHtml(userName)}</span></div><hr class="divider"/><div class="row"><span>Opening</span><span>${slipMoney(openingCash, currency)}</span></div><div class="row"><span>Cash sales</span><span>${slipMoney(cashSales, currency)}</span></div><div class="row"><span>Card sales</span><span>${slipMoney(cardSales, currency)}</span></div><div class="total-row"><span>Expected</span><span>${slipMoney(expectedCash, currency)}</span></div><hr class="divider"/><div class="total-row"><span>Counted</span><span>${slipMoney(countedCash, currency)}</span></div><div class="row"><span>Difference</span><span class="${diff >= 0 ? "diff-pos" : "diff-neg"}">${diff === 0 ? "EXACT" : slipMoney(Math.abs(diff), currency)}</span></div>${notes ? `<hr class="divider"/><div class="row"><span>Notes:</span><span>${escHtml(notes)}</span></div>` : ""}`;
}

export function openingBalanceSlip(opts: { orgName: string; currency: string; amount: number; userName: string }): string {
  const { orgName, currency, amount, userName } = opts;
  return `<div class="center bold large">${escHtml(orgName)}</div><hr class="divider"/><div class="center bold">OPENING FLOAT</div><hr class="divider"/><div class="row"><span>Date:</span><span>${slipDate()}</span></div><div class="row"><span>Opened by:</span><span>${escHtml(userName)}</span></div><hr class="divider"/><div class="total-row"><span>Opening float</span><span>${slipMoney(amount, currency)}</span></div>`;
}
