/**
 * FiscalNet test console — server actions  (v3)
 *
 * Used exclusively by the /app/fiscal-test admin page.
 * Requires owner or manager role for every action.
 * Z report requires an explicit typed confirmation parameter.
 *
 * All actions return TestActionResult so the UI can show structured feedback
 * without any client-side try/catch.
 */
"use server";

import { getActiveOrg }         from "@/lib/kitchenops/data";
import { buildFiscalNetConfig } from "@/lib/fiscalnet/config";
import {
  fiscalXReport, fiscalZReport, fiscalOpenDrawer,
  fiscalCashIn, fiscalCashOut, fiscalVoidLast, fiscalStatus,
} from "@/lib/fiscalnet/service";
import type { FiscalNetConfig } from "@/lib/fiscalnet/types";
import {
  saleItem, textLine, payment, customerDisplay as displayLine,
  buildCashInLines, buildCashOutLines, buildDrawerLines, buildVoidLines,
  buildXReportLines, buildZReportLines,
  buildNonFiscalFilename, buildDisplayFilename,
  linesToFileContent, generateOperationId,
} from "@/lib/fiscalnet/command-builder";
import { RECEIPT_EXAMPLES } from "@/lib/fiscalnet/receipt-examples";

// ── Shared result type ────────────────────────────────────────────────────────

export interface TestActionResult {
  ok:            boolean;
  message:       string;
  operationId?:  string;
  receiptNumber?: string;
  commandContent?: string;
  filename?: string;
  durationMs?:   number;
  mock:          boolean;
}

// ── Guards ────────────────────────────────────────────────────────────────────

function canManage(role: string): boolean {
  return ["owner", "manager"].includes(role);
}

async function getFiscalConfig(): Promise<
  { config: FiscalNetConfig; error?: never } |
  { config?: never; error: string }
> {
  try {
    const { supabase, orgId, membership } = await getActiveOrg();
    if (!canManage(membership.role))
      return { error: "Permission denied — owner or manager required." };

    const { data: orgData } = await supabase
      .from("organisations")
      .select([
        "country_code","fiscalnet_enabled","fiscalnet_mock_mode",
        "fiscalnet_connection_mode","fiscalnet_api_host",
        "fiscalnet_bonuri_path","fiscalnet_raspuns_path",
        "fiscalnet_operator_code","fiscalnet_timeout_ms","fiscalnet_retry_count",
        "fiscalnet_cif","fiscalnet_auto_print","fiscalnet_ask_before_print",
        "fiscalnet_manual_only","fiscalnet_vat_groups","fiscalnet_payment_type_map",
      ].join(","))
      .eq("id", orgId)
      .single();
    const org = orgData as Record<string, unknown> | null;

    if (!org) return { error: "Organisation not found." };
    if (org.country_code !== "RO")
      return { error: "FiscalNet is only available for Romanian organisations (country_code=RO)." };
    if (!org.fiscalnet_enabled)
      return { error: "FiscalNet is not enabled. Enable it in Settings → FiscalNet." };

    return { config: buildFiscalNetConfig(org as Record<string, unknown>) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unexpected error." };
  }
}

// ── Receipt tests ─────────────────────────────────────────────────────────────

/**
 * Print a test cash or card receipt.
 * @param paymentType  "cash" (type 1) or "card" (type 2)
 */
export async function runTestReceipt(
  paymentType: "cash" | "card" = "cash"
): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;

  const opId    = generateOperationId("TEST");
  const ptCode  = paymentType === "card" ? 2 : 1;
  const ptLabel = paymentType === "card" ? "Card" : "Cash";

  const lines = [
    saleItem("FranchiseTech Test", 1.00, 1, "buc", 1, 1),
    textLine(`Platform test — ${ptLabel} — ${new Date().toLocaleTimeString("ro-RO")}`),
    payment(ptCode, 1.00),
  ];
  const content = linesToFileContent(lines);

  const t0     = Date.now();
  const result = await _runLines(config, lines, `Test ${ptLabel} Receipt`);
  const ms     = Date.now() - t0;

  return {
    ok:             result.ok,
    message:        result.message,
    operationId:    opId,
    receiptNumber:  undefined,  // returned by the driver in result.message
    commandContent: content,
    durationMs:     ms,
    mock:           config.mockMode,
  };
}

/**
 * Run any named example from RECEIPT_EXAMPLES.
 * Z report requires zConfirmed=true.
 */
export async function runNamedExample(
  exampleKey: string,
  zConfirmed = false,
): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;

  const example = RECEIPT_EXAMPLES[exampleKey];
  if (!example)
    return { ok: false, message: `Unknown example: ${exampleKey}`, mock: config.mockMode };

  // Z report safety gate
  if (exampleKey === "zReport" && !zConfirmed)
    return {
      ok: false,
      message: "Z report requires explicit confirmation. Pass zConfirmed=true.",
      mock: config.mockMode,
    };

  const t0     = Date.now();
  const result = await _runLines(config, example.lines, example.name, example.filenamePrefix);
  const ms     = Date.now() - t0;

  return {
    ok:             result.ok,
    message:        result.message,
    commandContent: example.content,
    durationMs:     ms,
    mock:           config.mockMode,
  };
}

// ── Utility tests ─────────────────────────────────────────────────────────────

export async function runTestOpenDrawer(): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const lines = buildDrawerLines();
  if (config.connectionMode === "file") {
    return fileDownloadResult(config, "Open drawer TXT generated.", lines, "DRAWER");
  }
  const t0 = Date.now();
  const r  = await fiscalOpenDrawer(config);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

export async function runTestXReport(): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const lines = buildXReportLines();
  if (config.connectionMode === "file") {
    return fileDownloadResult(config, "X report TXT generated.", lines, "XREPORT");
  }
  const t0 = Date.now();
  const r  = await fiscalXReport(config);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

/**
 * Z report — daily close.  IRREVERSIBLE.
 * Caller must pass confirmed=true (enforced by the UI double-confirmation flow).
 */
export async function runTestZReport(confirmed: boolean): Promise<TestActionResult> {
  if (!confirmed)
    return {
      ok: false,
      message: "Z report was not confirmed. This action closes the fiscal day and cannot be undone.",
      mock: false,
    };
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const lines = buildZReportLines();
  if (config.connectionMode === "file") {
    return fileDownloadResult(config, "Z report TXT generated.", lines, "ZREPORT");
  }
  const t0 = Date.now();
  const r  = await fiscalZReport(config);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

export async function runTestCancelReceipt(): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const lines = buildVoidLines();
  if (config.connectionMode === "file") {
    return fileDownloadResult(config, "Cancel receipt TXT generated.", lines, "VOID");
  }
  const t0 = Date.now();
  const r  = await fiscalVoidLast(config);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

export async function runTestCashIn(amountRON = 100): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const lines = buildCashInLines(amountRON);
  if (config.connectionMode === "file") {
    return fileDownloadResult(config, "Cash in TXT generated.", lines, "CASHIN");
  }
  const t0 = Date.now();
  const r  = await fiscalCashIn(config, amountRON);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

export async function runTestCashOut(amountRON = 50): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const lines = buildCashOutLines(amountRON);
  if (config.connectionMode === "file") {
    return fileDownloadResult(config, "Cash out TXT generated.", lines, "CASHOUT");
  }
  const t0 = Date.now();
  const r  = await fiscalCashOut(config, amountRON);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

export async function runTestCustomerDisplay(
  line1 = "FranchiseTech",
  line2 = "Test Display",
): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;

  const lines   = [displayLine(line1, line2)];
  const content = linesToFileContent(lines);
  const t0      = Date.now();
  const r       = await _runLines(config, lines, "Customer Display", "display_");
  return {
    ok: r.ok, message: r.message,
    commandContent: content,
    durationMs: Date.now() - t0,
    mock: config.mockMode,
  };
}

export async function runTestNonFiscal(): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;

  const lines   = RECEIPT_EXAMPLES.nonFiscal.lines;
  const content = RECEIPT_EXAMPLES.nonFiscal.content;
  const t0      = Date.now();
  const r       = await _runLines(config, lines, "Non-Fiscal Receipt", "nf_");
  return {
    ok: r.ok, message: r.message,
    commandContent: content,
    durationMs: Date.now() - t0,
    mock: config.mockMode,
  };
}

export async function runTestStatus(): Promise<TestActionResult> {
  const res = await getFiscalConfig();
  if (res.error) return { ok: false, message: res.error, mock: false };
  const config = res.config!;
  const t0 = Date.now();
  const r  = await fiscalStatus(config);
  return { ok: r.ok, message: r.message, durationMs: Date.now() - t0, mock: config.mockMode };
}

// ── Internal runner ───────────────────────────────────────────────────────────

function fileDownloadResult(config: FiscalNetConfig, message: string, lines: string[], prefix: string): TestActionResult {
  const filename = `${prefix}${Date.now()}.txt`;
  const content = linesToFileContent(lines);
  console.info("[FiscalNet] test console download generated", {
    mode: "browser_download",
    filename,
    contentPreview: content.slice(0, 120),
  });
  return {
    ok: true,
    message,
    filename,
    commandContent: content,
    durationMs: 0,
    mock: config.mockMode,
  };
}

async function _runLines(
  config: FiscalNetConfig,
  lines:  string[],
  label:  string,
  prefix: string = "",
): Promise<{ ok: boolean; message: string }> {
  // Re-use the existing runCommand logic from service.ts by calling the
  // appropriate transport directly — avoids duplicating transport logic.

  if (config.mockMode)
    return { ok: true, message: `${label} simulated (mock mode — no hardware called).` };

  // Dynamic import to avoid circular dependency at module load time
  const { writeCommandAndWait } = await import("@/lib/fiscalnet/file-service");
  if (config.connectionMode === "api") {
    // Call the HTTP API — reuse internal transport helper
    const { safePath } = await import("@/lib/fiscalnet/command-builder");
    try { safePath(config.apiHost); } catch { /* ok — apiHost is a URL, not a path */ }

    const __ctrl = new AbortController();
    const __tid = setTimeout(() => __ctrl.abort(), config.timeoutMs);
    const res = await fetch(`${config.apiHost.replace(/\/$/, "")}/api/Receipt`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(lines),
      signal:  __ctrl.signal,
    }).then((r) => { clearTimeout(__tid); return r; }, (e) => { clearTimeout(__tid); throw e; }).then(async (r) => {
      if (!r.ok) return { ok: false, message: `HTTP ${r.status}` };
      const text = await r.text();
      try {
        const j = JSON.parse(text) as Record<string, unknown>;
        if (j.BONOK === "DA" || j.BONOK === 1 || j.bonok === 1)
          return { ok: true, message: `${label} — receipt nr: ${j.NRBON ?? j.nrbon ?? "?"}` };
        if (j.ERRCODE || j.errcode)
          return { ok: false, message: `${label} failed: ${j.ERRCODE ?? j.errcode}` };
      } catch { /* text response */ }
      return { ok: true, message: `${label} sent. Response: ${text.slice(0, 80)}` };
    }).catch((e: unknown) => ({
      ok: false,
      message: `${label} error: ${e instanceof Error ? e.message : String(e)}`,
    }));
    return res;
  }

  // File mode
  if (!config.bonuriPath || !config.raspunsPath)
    return { ok: false, message: "Bonuri / Raspuns paths not configured. Check Settings → FiscalNet." };

  const opId = generateOperationId("TEST");
  const result = await writeCommandAndWait({
    bonuriPath:    config.bonuriPath,
    raspunsPath:   config.raspunsPath,
    lines,
    operationId:   opId,
    filenamePrefix: prefix as "" | "nf_" | "display_",
    timeoutMs:     config.timeoutMs,
  });

  if (result.success)
    return {
      ok: true,
      message: `${label} OK${result.receiptNumber ? ` · nr: ${result.receiptNumber}` : ""} · ${result.log.durationMs}ms`,
    };
  if (result.bonOk === -1)
    return { ok: false, message: `${label} timeout — verify printer manually.` };
  return {
    ok: false,
    message: `${label} failed: ${result.errorInfo ?? result.errorCode ?? "unknown error"}`,
  };
}
