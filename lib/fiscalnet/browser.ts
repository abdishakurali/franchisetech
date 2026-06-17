/**
 * lib/fiscalnet/browser.ts  (v2)
 *
 * Client-side FiscalNet — safe in "use client" components, no Node.js imports.
 *
 * Two transports:
 *   "api"  — POST JSON array to http://localhost:65400/api/Receipt  (Android / Windows API)
 *   "file" — build TXT content and trigger browser download          (Windows file mode)
 */

import type { VatGroup, FiscalPaymentCode } from "./types";
import { DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP, resolveVatGroup } from "./types";

// ── encoding helpers ─────────────────────────────────────────────────────────

function encodeMoney(amount: number): number { return Math.round(amount * 100); }
function encodeQty(qty: number): number       { return Math.round(qty * 1000); }
function sanitiseName(s: string): string {
  return s.replace(/\^/g, "-").replace(/[\r\n]/g, " ").substring(0, 40).trim() || "Produs";
}

// ── config ───────────────────────────────────────────────────────────────────

export interface BrowserFiscalConfig {
  enabled:        boolean;
  mockMode:       boolean;
  connectionMode: "api" | "file";
  apiHost:        string;
  vatGroups:      VatGroup[];
  paymentTypeMap: Record<string, FiscalPaymentCode>;
  operatorCode?:  string;
}

export interface BrowserFiscalItem {
  productName:    string;
  quantity:       number;
  unitPrice:      number;
  vatRate:        number;
  /** FiscalNet VAT group code 1–5, read directly from vat_rates.fiscalnet_vat_group.
   *  When set, this takes precedence over vatRate-based lookup. */
  fiscalNetGroup?: number | null;
}

export type BrowserFiscalResult = {
  ok: boolean;
  message: string;
  receiptNumber?: string;
  filename?: string;
  content?: string;
};

// ── Windows file download ────────────────────────────────────────────────────

export function downloadFiscalNetTxt(filename: string, content: string): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("downloadFiscalNetTxt must run in the browser");
  }

  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
      a.style.display = "none";
      console.info("[FiscalNet] client download starting", { filename: a.download, contentLength: content.length });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        resolve();
      }, 0);
    } catch (e) {
      reject(e);
    }
  });
}

export function triggerFiscalNetDownload(content: string, filename: string): Promise<void> {
  return downloadFiscalNetTxt(filename, content);
}

function makeFilename(prefix: string): string {
  return `${prefix}${Date.now()}.txt`;
}

async function downloadLines(lines: string[], prefix = "BON"): Promise<BrowserFiscalResult> {
  const content  = lines.join("\r\n") + "\r\n";
  const filename = makeFilename(prefix);
  try {
    await downloadFiscalNetTxt(filename, content);
    return { ok: true, message: `Fișier descărcat: ${filename}`, filename, content };
  } catch (e) {
    return { ok: false, message: `Eroare: ${e instanceof Error ? e.message : "Necunoscuta"}`, filename, content };
  }
}

// ── Android / HTTP API ───────────────────────────────────────────────────────

async function callApi(
  apiHost: string,
  lines: string[],
  timeoutMs = 15000
): Promise<BrowserFiscalResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res  = await fetch(`${apiHost.replace(/\/$/, "")}/api/Receipt`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(lines),
      signal:  controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    let parsed: Record<string, unknown> | null = null;
    try { parsed = JSON.parse(text); } catch {}
    if (parsed && parsed.BONOK === "DA") {
      return { ok: true, message: `Bon tipărit. Nr: ${parsed.NRBON ?? "?"}`, receiptNumber: String(parsed.NRBON ?? "") };
    }
    if (parsed?.ERRCODE) return { ok: false, message: `Eroare casă: ${parsed.ERRCODE}` };
    if (!res.ok)         return { ok: false, message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    return { ok: true, message: "Comandă trimisă." };
  } catch (e) {
    clearTimeout(timer);
    const msg = e instanceof Error ? e.message : "Eroare";
    if (msg.includes("abort") || msg.toLowerCase().includes("aborterror"))
      return { ok: false, message: "Timeout — casa fiscală nu răspunde (>15s)." };
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError"))
      return { ok: false, message: "Nu se poate contacta casa fiscală. Verifică că FiscalNet rulează." };
    return { ok: false, message: `Eroare: ${msg}` };
  }
}

// ── shared line builders ─────────────────────────────────────────────────────

export function buildFiscalNetReceiptLines(
  items: BrowserFiscalItem[],
  paymentType: string,
  config: BrowserFiscalConfig,
  total?: number
): string[] {
  const vatGroups = config.vatGroups?.length ? config.vatGroups : DEFAULT_VAT_GROUPS;
  const ptMap     = Object.keys(config.paymentTypeMap ?? {}).length ? config.paymentTypeMap : DEFAULT_PAYMENT_TYPE_MAP;
  const opCode    = config.operatorCode ?? "1";

  // Payment code must be explicitly configured — do not silently default.
  const payCode = ptMap[paymentType];
  if (payCode == null) {
    throw new Error(
      `FiscalNet: metoda de plată "${paymentType}" nu are cod FN configurat. ` +
      `Adaugă codul în Setări → Metode de plată → Cod FiscalNet.`
    );
  }

  const lines = items.map((item) => {
    // VAT group: read directly from vat_rates.fiscalnet_vat_group (via fiscalNetGroup).
    // Fall back to rate-based lookup only when fiscalNetGroup was not supplied.
    let vatCode: number;
    if (item.fiscalNetGroup != null) {
      vatCode = item.fiscalNetGroup;
    } else {
      vatCode = resolveVatGroup(item.vatRate, vatGroups);
    }

    if (vatCode < 1 || vatCode > 5 || !Number.isInteger(vatCode)) {
      throw new Error(
        `FiscalNet: produsul "${item.productName}" — grupă TVA ${vatCode} invalidă (trebuie 1–5). ` +
        `Configurează grupa FiscalNet în Setări → Cote TVA.`
      );
    }

    const priceBani = encodeMoney(item.unitPrice);
    const qtyMillis = encodeQty(item.quantity);

    console.info("[FiscalNet] S^ line debug", {
      productName:    item.productName,
      vatRate:        item.vatRate,
      fiscalNetGroup: item.fiscalNetGroup,
      resolvedVatCode: vatCode,
      priceBani,
      qtyMillis,
      paymentType,
      payCode,
    });

    return `S^${sanitiseName(item.productName)}^${priceBani}^${qtyMillis}^Buc^${vatCode}^${opCode}`;
  });

  const subtotalBani = total !== undefined
    ? encodeMoney(total)
    : items.reduce((s, i) => s + encodeMoney(i.unitPrice * i.quantity), 0);

  // ST^0 = subtotal line, no subtotal-level discount (FiscalNet requires ST^ before P^)
  lines.push("ST^0");
  lines.push(`P^${payCode}^${Math.round(subtotalBani)}`);

  console.info("[FiscalNet] receipt lines generated", {
    paymentType,
    payCode,
    subtotalBani,
    itemCount: items.length,
    lines,
  });

  return lines;
}

// ── public API ───────────────────────────────────────────────────────────────

export async function fiscalBrowserReceipt(
  config: BrowserFiscalConfig,
  items: BrowserFiscalItem[],
  total: number,
  paymentType: string
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };

  const lines = buildFiscalNetReceiptLines(items, paymentType, config, total);

  if (config.connectionMode === "file") {
    return downloadLines(lines, "BON");
  }
  if (config.mockMode) return { ok: true, message: "Mock — bon simulat (nu s-a trimis la casă)." };
  return callApi(config.apiHost, lines);
}

export async function fiscalBrowserCashIn(
  config: BrowserFiscalConfig,
  amount: number
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = [`I^${encodeMoney(amount)}`];
  if (config.connectionMode === "file") return downloadLines(lines, "CASHIN");
  if (config.mockMode) return { ok: true, message: "Mock — intrare numerar simulată." };
  return callApi(config.apiHost, lines);
}

export async function fiscalBrowserCashOut(
  config: BrowserFiscalConfig,
  amount: number
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = [`O^${encodeMoney(amount)}`];
  if (config.connectionMode === "file") return downloadLines(lines, "CASHOUT");
  if (config.mockMode) return { ok: true, message: "Mock — ieșire numerar simulată." };
  return callApi(config.apiHost, lines);
}

export async function fiscalBrowserZReport(
  config: BrowserFiscalConfig
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = ["Z^"];
  if (config.connectionMode === "file") return downloadLines(lines, "ZREPORT");
  if (config.mockMode) return { ok: true, message: "Mock — raport Z simulat." };
  return callApi(config.apiHost, lines);
}

export async function fiscalBrowserXReport(
  config: BrowserFiscalConfig
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = ["X^"];
  if (config.connectionMode === "file") return downloadLines(lines, "XREPORT");
  if (config.mockMode) return { ok: true, message: "Mock — raport X simulat." };
  return callApi(config.apiHost, lines);
}
