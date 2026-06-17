/**
 * FiscalNet file-mode transport service (v3)
 *
 * Full lifecycle for a file-mode fiscal command:
 *   1. Generate a unique operation ID → deterministic, collision-resistant filename
 *   2. Write command content atomically:
 *        Write → {bonuri}/{filename}.tmp
 *        Rename → {bonuri}/{filename}.txt
 *      (The driver only picks up .txt files, never .tmp — safe partial-write guard)
 *   3. Poll {raspuns}/{filename} until it appears or timeout expires
 *   4. Read, parse, and delete the response file
 *   5. Return FiscalFileResult + FiscalOperationLog
 *
 * Filename conventions (driver-enforced):
 *   Regular command:    {operationId}.txt
 *   Non-fiscal receipt: nf_{operationId}.txt
 *   Customer display:   display_{operationId}.txt
 *
 * Safety guarantees:
 *   - Never creates two files with the same name (generateOperationId is unique)
 *   - Validates and resolves all paths (rejects path traversal)
 *   - Never blocks indefinitely (deadline-based polling)
 *   - Cleans up response files after reading
 *   - BONOK=-1 (ambiguous/timeout) is surfaced as a distinct state — the caller
 *     MUST NOT cancel the sale; the operator must verify the printer manually
 *
 * @module fiscalnet/file-service
 */

import fs   from "fs/promises";
import path from "path";

import { linesToFileContent, safePath } from "./command-builder";
import { parseResponse }                from "./parser";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Full operation audit record.
 * Logged to console (server) and can be persisted in DB for each test / utility run.
 */
export interface FiscalOperationLog {
  /** Unique ID for this operation — matches the command filename base */
  operationId:     string;
  /** ISO-8601 timestamp when the write started */
  timestamp:       string;
  /** Filename written to Bonuri (includes any nf_/display_ prefix) */
  commandFile:     string;
  /** Resolved absolute path of the Bonuri folder */
  bonuriPath:      string;
  /** Resolved absolute path of the Raspuns folder */
  raspunsPath:     string;
  /** Exact CRLF-encoded content written to the command file */
  commandContent:  string;
  /** Raw text of the response file, or null if timed out */
  responseContent: string | null;
  /** BONOK: 1=success  0=failure  -1=ambiguous/timeout  null=no response */
  bonOk:           1 | 0 | -1 | null;
  receiptNumber:   string | null;
  errorCode:       string | null;
  errorInfo:       string | null;
  success:         boolean;
  /** Wall-clock time from write to response, in ms */
  durationMs:      number;
}

/**
 * Structured result returned by writeCommandAndWait.
 *
 * JSON shape:
 *   { success, bonOk, receiptNumber, errorCode, errorInfo, rawResponse, log }
 */
export interface FiscalFileResult {
  success:       boolean;
  bonOk:         1 | 0 | -1 | null;
  receiptNumber: string | null;
  errorCode:     string | null;
  errorInfo:     string | null;
  rawResponse:   string;
  /** Full operation log for debugging, audit, and replay */
  log:           FiscalOperationLog;
}

/** Filename prefix type — controls the naming convention. */
export type FilenamePrefix = "" | "nf_" | "display_";

export interface WriteCommandOptions {
  /** Path to the Bonuri (commands) folder */
  bonuriPath:       string;
  /** Path to the Raspuns (responses) folder */
  raspunsPath:      string;
  /** Array of FiscalNet command lines (no CRLF) */
  lines:            string[];
  /** Explicit operation ID — auto-generated if omitted */
  operationId?:     string;
  /** Filename prefix: "" | "nf_" | "display_"  (default: "") */
  filenamePrefix?:  FilenamePrefix;
  /** Response timeout in ms (default: 30 000) */
  timeoutMs?:       number;
  /** Polling interval in ms (default: 500) */
  pollIntervalMs?:  number;
}

// ── Operation ID generator ────────────────────────────────────────────────────

let _seq = 0;

/**
 * Generate a unique operation ID that is:
 *   - Safe for use in filenames (alphanumeric + underscore only)
 *   - Unique across simultaneous calls in the same process
 *   - Distinguishable from other machines (different random suffix)
 *
 * Format: FN_{base36-ms}_{seq}_{4hex}
 */
export function generateOpId(prefix = "FN"): string {
  const ts   = Date.now().toString(36).toUpperCase();
  const seq  = (_seq++ % 999).toString().padStart(3, "0");
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16).padStart(4, "0").toUpperCase();
  return `${prefix}_${ts}_${seq}_${rand}`;
}

// ── Core transport ────────────────────────────────────────────────────────────

/**
 * Write a FiscalNet command file atomically and wait for the driver response.
 *
 * On success: returns { success: true, bonOk: 1, receiptNumber, … }
 * On failure: returns { success: false, bonOk: 0, errorCode, errorInfo, … }
 * On timeout: returns { success: false, bonOk: -1, errorCode: "TIMEOUT", … }
 *             ⚠️  Caller MUST NOT cancel sale — operator must verify printer manually.
 */
export async function writeCommandAndWait(opts: WriteCommandOptions): Promise<FiscalFileResult> {
  const {
    bonuriPath,
    raspunsPath,
    lines,
    operationId    = generateOpId(),
    filenamePrefix = "",
    timeoutMs      = 30_000,
    pollIntervalMs = 500,
  } = opts;

  const filename    = `${filenamePrefix}${operationId}.txt`;
  const tmpFilename = `${filenamePrefix}${operationId}.tmp`;
  const content     = linesToFileContent(lines);
  const startMs     = Date.now();
  const timestamp   = new Date().toISOString();

  // ── 1. Validate & resolve paths ────────────────────────────────────────────
  let bonuriDir:  string;
  let raspunsDir: string;

  try {
    bonuriDir  = safePath(bonuriPath);
    raspunsDir = safePath(raspunsPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return _fail({ operationId, timestamp, filename, bonuriPath, raspunsPath, content, startMs,
      errorCode: "UNSAFE_PATH", errorInfo: msg });
  }

  const tmpPath  = path.join(bonuriDir,  tmpFilename);
  const cmdPath  = path.join(bonuriDir,  filename);
  const respPath = path.join(raspunsDir, filename);

  // ── 2. Atomic write  (.tmp → .txt) ────────────────────────────────────────
  try {
    await fs.writeFile(tmpPath, content, { encoding: "utf-8" });
  } catch (e) {
    return _fail({ operationId, timestamp, filename,
      bonuriPath: bonuriDir, raspunsPath: raspunsDir, content, startMs,
      errorCode: "WRITE_ERR",
      errorInfo: `Cannot write to Bonuri (${tmpFilename}): ${e instanceof Error ? e.message : String(e)}` });
  }

  try {
    await fs.rename(tmpPath, cmdPath);
  } catch (e) {
    await fs.unlink(tmpPath).catch(() => null);
    return _fail({ operationId, timestamp, filename,
      bonuriPath: bonuriDir, raspunsPath: raspunsDir, content, startMs,
      errorCode: "RENAME_ERR",
      errorInfo: `Atomic rename failed: ${e instanceof Error ? e.message : String(e)}` });
  }

  // ── 3. Poll Raspuns for response ───────────────────────────────────────────
  const deadline = Date.now() + timeoutMs;
  let responseContent: string | null = null;

  while (Date.now() < deadline) {
    try {
      responseContent = await fs.readFile(respPath, "utf-8");
      await fs.unlink(respPath).catch(() => null);
      break;
    } catch {
      await _delay(pollIntervalMs);
    }
  }

  const durationMs = Date.now() - startMs;

  // ── 4. Timeout ────────────────────────────────────────────────────────────
  if (responseContent === null) {
    const log: FiscalOperationLog = {
      operationId, timestamp, commandFile: filename,
      bonuriPath: bonuriDir, raspunsPath: raspunsDir,
      commandContent: content, responseContent: null,
      bonOk: -1, receiptNumber: null,
      errorCode: "TIMEOUT",
      errorInfo: `No response in Raspuns within ${timeoutMs}ms. Verify receipt was printed manually.`,
      success: false, durationMs,
    };
    _log(log);
    return {
      success: false, bonOk: -1, receiptNumber: null,
      errorCode: "TIMEOUT",
      errorInfo: `No response within ${timeoutMs}ms. Verify printer manually.`,
      rawResponse: "", log,
    };
  }

  // ── 5. Parse response ─────────────────────────────────────────────────────
  const parsed  = parseResponse(responseContent);
  const success = parsed.bonok === 1;

  const log: FiscalOperationLog = {
    operationId, timestamp, commandFile: filename,
    bonuriPath: bonuriDir, raspunsPath: raspunsDir,
    commandContent: content, responseContent,
    bonOk:         parsed.bonok,
    receiptNumber: parsed.receiptNumber ?? null,
    errorCode:     parsed.errorCode     ?? null,
    errorInfo:     parsed.errorInfo     ?? null,
    success, durationMs,
  };

  _log(log);

  return {
    success,
    bonOk:         parsed.bonok,
    receiptNumber: parsed.receiptNumber ?? null,
    errorCode:     parsed.errorCode     ?? null,
    errorInfo:     parsed.errorInfo     ?? null,
    rawResponse:   responseContent,
    log,
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface _FailOpts {
  operationId: string; timestamp: string; filename: string;
  bonuriPath: string; raspunsPath: string; content: string;
  startMs: number; errorCode: string; errorInfo: string;
}

function _fail(o: _FailOpts): FiscalFileResult {
  const log: FiscalOperationLog = {
    operationId: o.operationId, timestamp: o.timestamp, commandFile: o.filename,
    bonuriPath: o.bonuriPath, raspunsPath: o.raspunsPath, commandContent: o.content,
    responseContent: null, bonOk: 0, receiptNumber: null,
    errorCode: o.errorCode, errorInfo: o.errorInfo,
    success: false, durationMs: Date.now() - o.startMs,
  };
  _log(log);
  return {
    success: false, bonOk: 0, receiptNumber: null,
    errorCode: o.errorCode, errorInfo: o.errorInfo,
    rawResponse: "", log,
  };
}

/** Structured console log — one line per operation for easy tailing. */
function _log(l: FiscalOperationLog): void {
  const icon = l.success ? "✅" : l.bonOk === -1 ? "⚠️ " : "❌";
  const nr   = l.receiptNumber ? ` nr=${l.receiptNumber}` : "";
  const err  = l.errorCode     ? ` err=${l.errorCode}` : "";
  // eslint-disable-next-line no-console
  console.log(
    `[FiscalNet] ${icon} op=${l.operationId} file=${l.commandFile}${nr}${err} ${l.durationMs}ms`
  );
  if (!l.success && l.errorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[FiscalNet]    ↳ ${l.errorInfo}`);
  }
}
