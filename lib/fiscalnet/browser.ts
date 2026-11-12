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
import {
  localNetworkPermission,
  LNA_DENIED_MESSAGE,
  LNA_PROMPT_MESSAGE,
  LNA_PROMPT_TIMEOUT_MS,
} from "./local-network-permission";

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
  /** Item-level percentage discount (0–100). Emits DP^ immediately after S^. */
  discountPercent?: number;
  /** Item-level value discount in RON. Emits DV^ immediately after S^. */
  discountValue?: number;
}

export type BrowserFiscalResult = {
  ok: boolean;
  message: string;
  receiptNumber?: string;
  filename?: string;
  content?: string;
  /** API mode only: the HTTP status and body FiscalNet actually returned,
   *  truncated. Recorded for audit. */
  rawResponse?: string;
  /** API mode only. "confirmed": the device reported the receipt as issued.
   *  "device_error": the device reported a failure. "unconfirmed": the request
   *  went through but the reply said neither — `ok` stays true so the POS
   *  flow is unchanged, but it must never be recorded as a confirmed receipt. */
  confirmation?: "confirmed" | "device_error" | "unconfirmed";
  /** Device error code from the reply, when there is one. */
  errorCode?: string;
};

const RAW_RESPONSE_MAX = 2000;

function rawResponseOf(status: number, body: string): string {
  return `HTTP ${status} ${body}`.slice(0, RAW_RESPONSE_MAX);
}

// FiscalNet's documented HTTP reply: ReceiptStatus (true/false), ReceiptNumber,
// ReceiptInfo, ErrorCode, ErrorInfo (driverfiscal.ro/documentatie-api-fiscalnet).
// Keys are matched case-insensitively because the docs are inconsistent on casing.
type DocumentedReply = { status: boolean; number: string | null; errorCode: string | null; errorInfo: string | null };

function readDocumentedReply(parsed: unknown): DocumentedReply | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const fields = new Map(Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k.toLowerCase(), v]));
  const raw = fields.get("receiptstatus");
  const status =
    raw === true || raw === 1 || (typeof raw === "string" && ["true", "1", "da"].includes(raw.trim().toLowerCase()))
      ? true
      : raw === false || raw === 0 || (typeof raw === "string" && ["false", "0", "nu"].includes(raw.trim().toLowerCase()))
        ? false
        : null;
  if (status === null) return null;
  const text = (key: string) => {
    const v = fields.get(key);
    return v === null || v === undefined || String(v).trim() === "" ? null : String(v).trim();
  };
  return { status, number: text("receiptnumber"), errorCode: text("errorcode"), errorInfo: text("errorinfo") };
}

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

// What a confirmed reply means for each command. A Z report is not a receipt,
// so each command says what the device actually confirmed.
type FiscalCommand = "receipt" | "cash_in" | "cash_out" | "z_report" | "x_report" | "void";

const CONFIRMED_LABEL: Record<FiscalCommand, (n: string | null) => string> = {
  receipt:  (n) => `Bon fiscal emis. Nr: ${n ?? "?"}`,
  cash_in:  () => "Intrare numerar confirmată de casă.",
  cash_out: () => "Ieșire numerar confirmată de casă.",
  z_report: () => "Raport Z confirmat de casă.",
  x_report: () => "Raport X confirmat de casă.",
  void:     () => "Anulare confirmată de casă.",
};

async function callApi(
  apiHost: string,
  lines: string[],
  command: FiscalCommand,
  timeoutMs = 15000
): Promise<BrowserFiscalResult> {
  // Local Network Access: a blocked permission means the request can never
  // leave the browser, so say why instead of blaming the cash register. While
  // the prompt is pending the request is held unsent, so a longer wait cannot
  // print twice; it gives the owner time to click Allow.
  const permission = await localNetworkPermission();
  if (permission === "denied") return { ok: false, message: LNA_DENIED_MESSAGE };
  if (permission === "prompt") timeoutMs = Math.max(timeoutMs, LNA_PROMPT_TIMEOUT_MS);
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
    const rawResponse = rawResponseOf(res.status, text);
    let parsed: Record<string, unknown> | null = null;
    try { parsed = JSON.parse(text); } catch {}
    // The documented ReceiptStatus is the device's own answer, so it wins over
    // the HTTP status (which only reflects transport).
    const documented = readDocumentedReply(parsed);
    if (documented?.status === true) {
      return {
        ok: true,
        message: CONFIRMED_LABEL[command](documented.number),
        receiptNumber: documented.number ?? undefined,
        confirmation: "confirmed",
        rawResponse,
      };
    }
    if (documented?.status === false) {
      const detail = [documented.errorCode, documented.errorInfo].filter(Boolean).join(" — ") || "fără detalii";
      return {
        ok: false,
        message: `Eroare casă: ${detail}`,
        confirmation: "device_error",
        errorCode: documented.errorCode ?? undefined,
        rawResponse,
      };
    }
    if (parsed && parsed.BONOK === "DA") {
      return { ok: true, message: `Bon tipărit. Nr: ${parsed.NRBON ?? "?"}`, receiptNumber: String(parsed.NRBON ?? ""), confirmation: "confirmed", rawResponse };
    }
    if (parsed?.ERRCODE) return { ok: false, message: `Eroare casă: ${parsed.ERRCODE}`, confirmation: "device_error", errorCode: String(parsed.ERRCODE), rawResponse };
    if (!res.ok)         return { ok: false, message: `HTTP ${res.status}: ${text.slice(0, 200)}`, rawResponse };
    // Request accepted, but nothing in the reply confirms a receipt.
    return { ok: true, message: "Comandă trimisă.", confirmation: "unconfirmed", rawResponse };
  } catch (e) {
    clearTimeout(timer);
    const msg = e instanceof Error ? e.message : "Eroare";
    const after = await localNetworkPermission();
    if (after === "denied") return { ok: false, message: LNA_DENIED_MESSAGE };
    if (after === "prompt") return { ok: false, message: LNA_PROMPT_MESSAGE };
    if (msg.includes("abort") || msg.toLowerCase().includes("aborterror"))
      return { ok: false, message: `Timeout — casa fiscală nu răspunde (>${Math.round(timeoutMs / 1000)}s).` };
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError"))
      return { ok: false, message: "Nu se poate contacta casa fiscală. Verifică că FiscalNet rulează." };
    return { ok: false, message: `Eroare: ${msg}` };
  }
}

// ── shared line builders ─────────────────────────────────────────────────────

// FiscalNet plain-text P^ payment codes: 1 numerar … 9 Other2.
function isFiscalPaymentCode(code: number | null | undefined): code is number {
  return typeof code === "number" && Number.isInteger(code) && code >= 1 && code <= 9;
}

export function buildFiscalNetReceiptLines(
  items: BrowserFiscalItem[],
  paymentType: string,
  config: BrowserFiscalConfig,
  total?: number,
  methodPaymentCode?: number | null
): string[] {
  const vatGroups = config.vatGroups?.length ? config.vatGroups : DEFAULT_VAT_GROUPS;
  const ptMap     = Object.keys(config.paymentTypeMap ?? {}).length ? config.paymentTypeMap : DEFAULT_PAYMENT_TYPE_MAP;
  const opCode    = config.operatorCode ?? "1";

  // The payment method's own FiscalNet code wins (e.g. "Tichete masă" = 4,
  // FoodStamp in FiscalNet's documented P^ codes 1–9); the per-type map is the
  // fallback, so a meal ticket stored as type "other" is no longer sent as 8.
  // Payment code must be explicitly configured — do not silently default.
  const payCode = isFiscalPaymentCode(methodPaymentCode) ? methodPaymentCode : ptMap[paymentType];
  if (payCode == null) {
    throw new Error(
      `FiscalNet: metoda de plată "${paymentType}" nu are cod FN configurat. ` +
      `Adaugă codul în Setări → Metode de plată → Cod FiscalNet.`
    );
  }

  const lines: string[] = [];
  for (const item of items) {
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
      discountPercent: item.discountPercent,
      discountValue: item.discountValue,
      paymentType,
      payCode,
    });

    lines.push(`S^${sanitiseName(item.productName)}^${priceBani}^${qtyMillis}^Buc^${vatCode}^${opCode}`);

    // P1.7: FiscalNet requires DP^/DV^ immediately below the S^ line — not only a reduced P^ amount.
    const pct = item.discountPercent ?? 0;
    const val = item.discountValue ?? 0;
    if (pct > 0 && pct <= 100) {
      lines.push(`DP^${Math.round(pct * 100)}`);
    } else if (val > 0) {
      lines.push(`DV^${encodeMoney(val)}`);
    }
  }

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
  paymentType: string,
  methodPaymentCode?: number | null
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };

  const lines = buildFiscalNetReceiptLines(items, paymentType, config, total, methodPaymentCode);

  if (config.connectionMode === "file") {
    return downloadLines(lines, "BON");
  }
  if (config.mockMode) return { ok: true, message: "Mock — bon simulat (nu s-a trimis la casă)." };
  return callApi(config.apiHost, lines, "receipt");
}

export async function fiscalBrowserCashIn(
  config: BrowserFiscalConfig,
  amount: number
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = [`I^${encodeMoney(amount)}`];
  if (config.connectionMode === "file") return downloadLines(lines, "CASHIN");
  if (config.mockMode) return { ok: true, message: "Mock — intrare numerar simulată." };
  return callApi(config.apiHost, lines, "cash_in");
}

export async function fiscalBrowserCashOut(
  config: BrowserFiscalConfig,
  amount: number
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = [`O^${encodeMoney(amount)}`];
  if (config.connectionMode === "file") return downloadLines(lines, "CASHOUT");
  if (config.mockMode) return { ok: true, message: "Mock — ieșire numerar simulată." };
  return callApi(config.apiHost, lines, "cash_out");
}

export async function fiscalBrowserZReport(
  config: BrowserFiscalConfig
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = ["Z^"];
  if (config.connectionMode === "file") return downloadLines(lines, "ZREPORT");
  if (config.mockMode) return { ok: true, message: "Mock — raport Z simulat." };
  return callApi(config.apiHost, lines, "z_report");
}

export async function fiscalBrowserXReport(
  config: BrowserFiscalConfig
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = ["X^"];
  if (config.connectionMode === "file") return downloadLines(lines, "XREPORT");
  if (config.mockMode) return { ok: true, message: "Mock — raport X simulat." };
  return callApi(config.apiHost, lines, "x_report");
}

export async function fiscalBrowserVoidLast(
  config: BrowserFiscalConfig
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };
  const lines = ["VB^"];
  if (config.connectionMode === "file") return downloadLines(lines, "VOID");
  if (config.mockMode) return { ok: true, message: "Mock — anulare bon simulată." };
  return callApi(config.apiHost, lines, "void");
}
