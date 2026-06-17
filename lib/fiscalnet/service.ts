/**
 * FiscalNet service (v3)
 *
 * Two transport modes:
 *   "api"  — HTTP POST to {apiHost}/api/Receipt  (Windows & Android)
 *   "file" — Write .tmp → rename .txt to Bonuri folder, poll Raspuns (Windows only)
 *
 * SAFETY: Sale is always saved BEFORE this runs. Fiscal failure must
 * never lose a sale. Every function is non-fatal and returns a result.
 *
 * MOCK: When mockMode=true (default), no HTTP calls or file writes are
 * made. A fake BONOK=1 response is returned immediately.
 *
 * ATOMIC WRITES: File-mode commands use .tmp → rename to prevent FiscalNet
 * driver from reading partially-written files.
 *
 * DB LOGGING: All utility operations (cash in/out, X/Z report, drawer, etc.)
 * are logged to fiscal_command_log when UtilLogOpts are provided.
 */

import fs from "fs/promises";
import path from "path";
import { SupabaseClient } from "@supabase/supabase-js";

import type {
  FiscalNetConfig,
  FiscalSaleCommand,
  FiscalLineItem,
  FiscalPrintResult,
  FiscalNetResponse,
} from "./types";
import {
  buildSaleLines,
  buildXReportLines,
  buildZReportLines,
  buildStatusLines,
  buildDrawerLines,
  buildCashInLines,
  buildCashOutLines,
  buildVoidLines,
  buildCommandFilename,
  linesToFileContent,
  safePath,
} from "./command-builder";
import { parseResponse, responseFilename } from "./parser";

// ── Logging opts for utility operations ──────────────────────────────────

export interface UtilLogOpts {
  supabase:     SupabaseClient;
  orgId:        string;
  performedBy?: string | null;
  sessionId?:   string | null;
  amountRon?:   number;
}

// ── HTTP API transport ────────────────────────────────────────────────────

async function callFiscalNetApi(
  apiHost: string,
  lines: string[],
  timeoutMs: number
): Promise<FiscalNetResponse> {
  const url = `${apiHost.replace(/\/$/, "")}/api/Receipt`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, 60000));

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body:    JSON.stringify(lines),
      signal:  controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        bonok: 0,
        errorCode: `HTTP_${res.status}`,
        errorInfo: `FiscalNet returned HTTP ${res.status}`,
        raw: `HTTP ${res.status}`,
      };
    }

    let raw = "";
    try {
      const json = await res.json();
      if (typeof json === "object" && json !== null) {
        raw = JSON.stringify(json);
        const bonok = Number(json.BONOK ?? json.bonok ?? json.Bonok ?? -99);
        if (bonok === -99) return parseResponse(raw);
        return {
          bonok: bonok === 1 ? 1 : bonok === 0 ? 0 : -1,
          receiptNumber: String(json.NRBON ?? json.nrbon ?? json.NrBon ?? "").trim() || undefined,
          errorCode:     String(json.ERRCODE ?? json.errcode ?? json.ErrCode ?? "").trim() || undefined,
          errorInfo:     String(json.ERRMSG ?? json.errmsg ?? json.ErrMsg ?? json.ERRINFO ?? "").trim() || undefined,
          raw,
        };
      }
      raw = String(json);
    } catch {
      raw = await res.text().catch(() => "");
    }

    return parseResponse(raw);
  } catch (err: unknown) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      bonok: 0,
      errorCode: isAbort ? "TIMEOUT" : "CONN_ERR",
      errorInfo: isAbort
        ? `No response from FiscalNet within ${timeoutMs}ms`
        : `Cannot reach FiscalNet at ${apiHost}: ${err instanceof Error ? err.message : String(err)}`,
      raw: "",
    };
  }
}

// ── File transport (atomic write) ─────────────────────────────────────────

const POLL_INTERVAL_MS = 500;

async function writeAndPoll(
  bonuriPath: string,
  raspunsPath: string,
  lines: string[],
  commandFilename: string,
  timeoutMs: number
): Promise<FiscalNetResponse> {
  const content = linesToFileContent(lines);
  const cmdPath  = path.join(bonuriPath, commandFilename);
  const tmpPath  = cmdPath + ".tmp";

  // Atomic write: write to .tmp, then rename to .txt
  // FiscalNet driver only picks up .txt files, so it never sees a partial write.
  try {
    await fs.writeFile(tmpPath, content, "utf-8");
    await fs.rename(tmpPath, cmdPath);
  } catch (e: unknown) {
    // Clean up orphaned .tmp on error
    await fs.unlink(tmpPath).catch(() => null);
    return {
      bonok: 0,
      errorCode: "WRITE_ERR",
      errorInfo: `Cannot write to Bonuri: ${e instanceof Error ? e.message : String(e)}`,
      raw: "",
    };
  }

  const respPath = path.join(raspunsPath, responseFilename(commandFilename));
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const raw = await fs.readFile(respPath, "utf-8");
      await fs.unlink(respPath).catch(() => null);
      return parseResponse(raw);
    } catch {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  return {
    bonok: -1,
    errorCode: "TIMEOUT",
    errorInfo: `No response within ${timeoutMs}ms. Verify receipt was printed.`,
    raw: "",
  };
}

// ── Mock ──────────────────────────────────────────────────────────────────

function mockOk(label = ""): FiscalNetResponse {
  const n = `MOCK-${label ? label + "-" : ""}${Date.now().toString().slice(-6)}`;
  return { bonok: 1, receiptNumber: n, raw: `BONOK=1\r\nNRBON=${n}\r\n` };
}

// ── DB helpers — sale attempts ────────────────────────────────────────────

async function insertAttempt(
  sb: SupabaseClient, orgId: string, txId: string,
  attempt: number, mock: boolean, file: string | null, content: string, by: string | null
): Promise<string | null> {
  const { data } = await sb.from("fiscal_receipt_attempts").insert({
    organisation_id: orgId, transaction_id: txId, attempt_number: attempt,
    status: "pending", mock_mode: mock, command_file: file,
    command_content: content, performed_by: by,
  }).select("id").single();
  return data?.id ?? null;
}

async function resolveAttempt(
  sb: SupabaseClient, id: string, status: string, resp: FiscalNetResponse | null
): Promise<void> {
  await sb.from("fiscal_receipt_attempts").update({
    status,
    response_content: resp?.raw ?? null,
    receipt_number:   resp?.receiptNumber ?? null,
    error_code:       resp?.errorCode ?? null,
    error_info:       resp?.errorInfo ?? null,
    resolved_at:      new Date().toISOString(),
  }).eq("id", id).then(() => null, () => null);
}

async function setTxFiscalStatus(
  sb: SupabaseClient, orgId: string, txId: string,
  status: string, receiptNumber: string | null, attemptId: string | null
): Promise<void> {
  await sb.from("pos_transactions").update({
    fiscal_receipt_status:      status,
    fiscal_receipt_number:      receiptNumber ?? null,
    fiscal_receipt_attempt_id:  attemptId ?? null,
  }).eq("id", txId).eq("organisation_id", orgId).then(() => null, () => null);
}

// ── DB helpers — utility command log ─────────────────────────────────────

async function insertUtilLog(
  sb: SupabaseClient,
  orgId: string,
  commandType: string,
  commandContent: string,
  mock: boolean,
  log: UtilLogOpts
): Promise<string | null> {
  const { data } = await sb.from("fiscal_command_log").insert({
    organisation_id: orgId,
    session_id:      log.sessionId ?? null,
    command_type:    commandType,
    status:          mock ? "mock_success" : "pending",
    mock_mode:       mock,
    amount_ron:      log.amountRon ?? null,
    command_content: commandContent,
    performed_by:    log.performedBy ?? null,
  }).select("id").single();
  return data?.id ?? null;
}

async function resolveUtilLog(
  sb: SupabaseClient,
  id: string,
  status: string,
  resp: FiscalNetResponse | null
): Promise<void> {
  await sb.from("fiscal_command_log").update({
    status,
    response_content: resp?.raw ?? null,
    error_code:       resp?.errorCode ?? null,
    error_info:       resp?.errorInfo ?? null,
    resolved_at:      new Date().toISOString(),
  }).eq("id", id).then(() => null, () => null);
}

// ── Generic command runner (for non-sale ops) ─────────────────────────────

async function runCommand(
  config: FiscalNetConfig,
  lines: string[],
  label: string,
  commandType?: string,
  log?: UtilLogOpts
): Promise<{ ok: boolean; message: string }> {
  const content = linesToFileContent(lines);

  if (config.mockMode) {
    if (log && commandType) {
      const logId = await insertUtilLog(log.supabase, log.orgId, commandType, content, true, log)
        .catch(() => null);
      if (logId) {
        await resolveUtilLog(log.supabase, logId, "mock_success", null).catch(() => null);
      }
    }
    return { ok: true, message: `${label} simulated (mock mode).` };
  }

  let logId: string | null = null;
  if (log && commandType) {
    logId = await insertUtilLog(log.supabase, log.orgId, commandType, content, false, log)
      .catch(() => null);
  }

  let resp: FiscalNetResponse;

  if (config.connectionMode === "api") {
    resp = await callFiscalNetApi(config.apiHost, lines, config.timeoutMs);
  } else {
    if (!config.bonuriPath || !config.raspunsPath) {
      const msg = "Bonuri/Raspuns paths not configured.";
      if (logId && log) {
        await resolveUtilLog(log.supabase, logId, "failed",
          { bonok: 0, errorCode: "NO_PATH", errorInfo: msg, raw: "" }).catch(() => null);
      }
      return { ok: false, message: msg };
    }
    let bonuriDir: string; let raspunsDir: string;
    try {
      bonuriDir  = safePath(config.bonuriPath);
      raspunsDir = safePath(config.raspunsPath);
    } catch (e: unknown) {
      const msg = `Path error: ${e instanceof Error ? e.message : String(e)}`;
      if (logId && log) {
        await resolveUtilLog(log.supabase, logId, "failed",
          { bonok: 0, errorCode: "UNSAFE_PATH", errorInfo: msg, raw: "" }).catch(() => null);
      }
      return { ok: false, message: msg };
    }
    resp = await writeAndPoll(bonuriDir, raspunsDir, lines, buildCommandFilename(label), config.timeoutMs);
  }

  if (logId && log) {
    const status = resp.bonok === 1 ? "success" : resp.bonok === -1 ? "ambiguous" : "failed";
    await resolveUtilLog(log.supabase, logId, status, resp).catch(() => null);
  }

  if (resp.bonok === 1)  return { ok: true,  message: `${label} completed.` };
  if (resp.bonok === -1) return { ok: false,  message: `${label} timed out. Verify on device.` };
  return { ok: false, message: resp.errorInfo ?? resp.errorCode ?? `${label} failed.` };
}

// ── Public: print fiscal receipt ──────────────────────────────────────────

export interface PrintFiscalReceiptOptions {
  supabase:       SupabaseClient;
  orgId:          string;
  transactionId:  string;
  transactionRef: string;
  performedBy:    string | null;
  config:         FiscalNetConfig;
  items:          FiscalLineItem[];
  totalGross:     number;
  paymentType:    string;
  attemptNumber?: number;
}

export async function printFiscalReceipt(
  opts: PrintFiscalReceiptOptions
): Promise<FiscalPrintResult> {
  const {
    supabase, orgId, transactionId, transactionRef, performedBy,
    config, items, totalGross, paymentType, attemptNumber = 1,
  } = opts;

  const isMock      = config.mockMode;
  const paymentCode = (config.paymentTypeMap[paymentType] ?? config.paymentTypeMap.other ?? 8) as import("./types").FiscalPaymentCode;

  const saleCmd: FiscalSaleCommand = {
    type:             "sale",
    operatorCode:     config.operatorCode ?? "1",
    cif:              config.cif ?? undefined,
    items,
    paymentCode,
    paymentAmount:    totalGross,
    receiptReference: transactionRef,
    vatGroups:        config.vatGroups,
  };

  const lines   = buildSaleLines(saleCmd);
  const content = linesToFileContent(lines);
  const fname   = buildCommandFilename(transactionRef);

  await setTxFiscalStatus(supabase, orgId, transactionId, "printing", null, null);

  const attemptId = await insertAttempt(
    supabase, orgId, transactionId, attemptNumber, isMock,
    isMock ? null : fname, content, performedBy
  );

  // MOCK
  if (isMock) {
    const r = mockOk(transactionRef);
    if (attemptId) await resolveAttempt(supabase, attemptId, "mock_success", r);
    await setTxFiscalStatus(supabase, orgId, transactionId, "success", r.receiptNumber ?? null, attemptId);
    return { success: true, receiptNumber: r.receiptNumber, status: "success", attemptId: attemptId ?? undefined, mock: true };
  }

  // REAL
  let resp: FiscalNetResponse;

  if (config.connectionMode === "api") {
    resp = await callFiscalNetApi(config.apiHost, lines, config.timeoutMs);
  } else {
    if (!config.bonuriPath || !config.raspunsPath) {
      const err = "FiscalNet file paths not configured.";
      if (attemptId) await resolveAttempt(supabase, attemptId, "failed", { bonok: 0, errorCode: "NO_PATH", errorInfo: err, raw: "" });
      await setTxFiscalStatus(supabase, orgId, transactionId, "failed", null, attemptId);
      return { success: false, errorCode: "NO_PATH", errorInfo: err, status: "failed", attemptId: attemptId ?? undefined, mock: false };
    }

    let bonuriDir: string; let raspunsDir: string;
    try {
      bonuriDir  = safePath(config.bonuriPath);
      raspunsDir = safePath(config.raspunsPath);
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      if (attemptId) await resolveAttempt(supabase, attemptId, "failed", { bonok: 0, errorCode: "UNSAFE_PATH", errorInfo: err, raw: "" });
      await setTxFiscalStatus(supabase, orgId, transactionId, "failed", null, attemptId);
      return { success: false, errorCode: "UNSAFE_PATH", errorInfo: err, status: "failed", attemptId: attemptId ?? undefined, mock: false };
    }
    resp = await writeAndPoll(bonuriDir, raspunsDir, lines, fname, config.timeoutMs);
  }

  if (resp.bonok === 1) {
    if (attemptId) await resolveAttempt(supabase, attemptId, "success", resp);
    await setTxFiscalStatus(supabase, orgId, transactionId, "success", resp.receiptNumber ?? null, attemptId);
    return { success: true, receiptNumber: resp.receiptNumber, status: "success", attemptId: attemptId ?? undefined, mock: false };
  }
  if (resp.bonok === -1) {
    if (attemptId) await resolveAttempt(supabase, attemptId, "ambiguous", resp);
    await setTxFiscalStatus(supabase, orgId, transactionId, "ambiguous", null, attemptId);
    return { success: false, errorCode: resp.errorCode, errorInfo: "Printer status ambiguous — verify receipt was printed.", status: "ambiguous", attemptId: attemptId ?? undefined, mock: false };
  }
  if (attemptId) await resolveAttempt(supabase, attemptId, "failed", resp);
  await setTxFiscalStatus(supabase, orgId, transactionId, "failed", null, attemptId);
  return { success: false, errorCode: resp.errorCode, errorInfo: resp.errorInfo, status: "failed", attemptId: attemptId ?? undefined, mock: false };
}

// ── Public: utility operations ────────────────────────────────────────────

export async function fiscalXReport(config: FiscalNetConfig, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  return runCommand(config, buildXReportLines(), "X Report", "x_report", log);
}
export async function fiscalZReport(config: FiscalNetConfig, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  return runCommand(config, buildZReportLines(), "Z Report", "z_report", log);
}
export async function fiscalStatus(config: FiscalNetConfig, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  return runCommand(config, buildStatusLines(), "Status", "status", log);
}
export async function fiscalOpenDrawer(config: FiscalNetConfig, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  return runCommand(config, buildDrawerLines(), "Open drawer", "drawer", log);
}
export async function fiscalCashIn(config: FiscalNetConfig, amountRON: number, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  const opts = log ? { ...log, amountRon: amountRON } : undefined;
  return runCommand(config, buildCashInLines(amountRON), `Cash in ${amountRON.toFixed(2)} RON`, "cash_in", opts);
}
export async function fiscalCashOut(config: FiscalNetConfig, amountRON: number, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  const opts = log ? { ...log, amountRon: amountRON } : undefined;
  return runCommand(config, buildCashOutLines(amountRON), `Cash out ${amountRON.toFixed(2)} RON`, "cash_out", opts);
}
export async function fiscalVoidLast(config: FiscalNetConfig, log?: UtilLogOpts): Promise<{ ok: boolean; message: string }> {
  return runCommand(config, buildVoidLines(), "Void last receipt", "void", log);
}

// ── Public: shouldPrint guard ─────────────────────────────────────────────

export function shouldPrintFiscalReceipt(
  countryCode: string | null | undefined,
  config: Partial<FiscalNetConfig> | null | undefined
): boolean {
  if (countryCode !== "RO") return false;
  if (!config?.enabled)     return false;
  if (config?.manualOnly)   return false;
  return true;
}
