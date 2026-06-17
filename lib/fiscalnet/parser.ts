/**
 * FiscalNet response parser
 *
 * The FiscalNet service writes a response `.txt` file to the Raspuns folder
 * after processing a command. This module parses those response files.
 *
 * Response format:
 *   BONOK=1            → success (1), failure (0), ambiguous (-1)
 *   NRBON=00012345     → fiscal receipt number (on success)
 *   ERRCODE=XXX        → error code (on failure)
 *   ERRINFO=text       → human-readable error info (on failure)
 *
 * BONOK=-1 ("ambiguous") means the POS terminal is uncertain whether
 * the receipt was printed. The sale MUST NOT be cancelled; the operator
 * should verify the printer manually.
 */

import type { FiscalNetResponse } from "./types";

// ── Parser ────────────────────────────────────────────────────────────────

/**
 * Parse a FiscalNet response file content string.
 * Returns structured FiscalNetResponse with all parsed fields.
 */
export function parseResponse(raw: string): FiscalNetResponse {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const getValue = (key: string): string | undefined => {
    const prefix = `${key}=`;
    const line = lines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : undefined;
  };

  const bonokRaw = getValue("BONOK");
  let bonok: 1 | 0 | -1 | null = null;

  if (bonokRaw === "1")       bonok = 1;
  else if (bonokRaw === "0")  bonok = 0;
  else if (bonokRaw === "-1") bonok = -1;

  return {
    bonok,
    receiptNumber: getValue("NRBON"),
    errorCode:     getValue("ERRCODE"),
    errorInfo:     getValue("ERRINFO"),
    raw,
  };
}

/**
 * Derive a human-readable status message from a parsed response.
 */
export function describeResponse(r: FiscalNetResponse): string {
  if (r.bonok === 1) {
    return r.receiptNumber
      ? `Receipt issued successfully. Receipt number: ${r.receiptNumber}`
      : "Receipt issued successfully.";
  }
  if (r.bonok === -1) {
    return "Printer status is ambiguous — verify receipt was printed manually. Sale has been saved.";
  }
  if (r.bonok === 0) {
    const detail = r.errorInfo ? ` ${r.errorInfo}` : "";
    const code   = r.errorCode ? ` [${r.errorCode}]` : "";
    return `Fiscal receipt failed.${code}${detail}`;
  }
  return "No valid BONOK field in response.";
}

/**
 * Given a command filename written to the Bonuri folder,
 * return the expected response filename in the Raspuns folder.
 *
 * FiscalNet convention: same base name, in Raspuns folder.
 */
export function responseFilename(commandFilename: string): string {
  // Strip any directory prefix — we only care about the base name
  const base = commandFilename.split(/[\\/]/).pop() ?? commandFilename;
  return base;
}
