"use server";

/**
 * FiscalNet server actions (v3)
 *
 * Guards: country_code=RO + fiscalnet_enabled=true required for all ops.
 * Safe for non-Romanian contexts — returns early without error.
 *
 * v3 changes:
 *   - All utility ops log to fiscal_command_log (DB audit)
 *   - runZReport: duplicate prevention per POS session
 *   - Z report updates pos_sessions.fiscal_z_report_done on success
 *   - session_id passed through for cash in/out / Z report
 */

import { revalidatePath } from "next/cache";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { stringValue, numberValue } from "@/lib/kitchenops/data";
import {
  printFiscalReceipt,
  fiscalXReport, fiscalZReport, fiscalStatus,
  fiscalOpenDrawer, fiscalCashIn, fiscalCashOut, fiscalVoidLast,
  DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP,
} from "@/lib/fiscalnet";
import type { FiscalLineItem, VatGroup, FiscalPaymentCode } from "@/lib/fiscalnet";
import { buildFiscalNetConfig } from "@/lib/fiscalnet/config";
import {
  buildCashInLines,
  buildCashOutLines,
  buildCommandFilename,
  buildDrawerLines,
  buildXReportLines,
  buildZReportLines,
  linesToFileContent,
  safePath,
} from "@/lib/fiscalnet";

function canManage(role: string): boolean {
  return ["owner", "manager"].includes(role);
}

type FiscalActionResult = {
  ok: boolean;
  message: string;
  status?: "download_required" | "pending_manual_confirmation" | "browser_api_pending" | "success" | "failed";
  mode?: "api" | "file" | "browser_download";
  filename?: string;
  mimeType?: string;
  content?: string;
  operationId?: string;
};

// ── helpers ───────────────────────────────────────────────────────────────

async function getOrgWithFiscal(supabase: Awaited<ReturnType<typeof getActiveOrg>>["supabase"], orgId: string) {
  const { data } = await supabase
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
  return data as Record<string, unknown> | null;
}

function fiscalDownload(label: string, prefix: string, lines: string[]): FiscalActionResult {
  const filename = buildCommandFilename(prefix);
  const content = linesToFileContent(lines);
  console.info("[FiscalNet] download generated", { label, mode: "file", filename, content });
  return {
    ok: true,
    message: "FiscalNet TXT file generated. Place it in the Bonuri folder if not downloaded there automatically.",
    status: "download_required",
    mode: "browser_download",
    filename,
    mimeType: "text/plain;charset=utf-8",
    content,
    operationId: filename.replace(/\.txt$/i, ""),
  };
}

// ── Save FiscalNet settings ───────────────────────────────────────────────

export async function saveFiscalNetSettings(formData: FormData) {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage(membership.role)) return { error: "Permission denied" };

  const enabled          = formData.get("fiscalnet_enabled") === "true";
  const mockMode         = formData.get("fiscalnet_mock_mode") !== "false";
  const connectionMode   = formData.get("fiscalnet_connection_mode") === "file" ? "file" : "api";
  const apiHost          = stringValue(formData, "fiscalnet_api_host") || "http://localhost:65400";
  const bonuriPath       = stringValue(formData, "fiscalnet_bonuri_path") || null;
  const raspunsPath      = stringValue(formData, "fiscalnet_raspuns_path") || null;
  const autoPrint        = formData.get("fiscalnet_auto_print") !== "false";
  const askBeforePrint   = formData.get("fiscalnet_ask_before_print") === "true";
  const manualOnly       = formData.get("fiscalnet_manual_only") === "true";
  const timeoutMs        = numberValue(formData, "fiscalnet_timeout_ms", 30000);
  const retryCount       = numberValue(formData, "fiscalnet_retry_count", 2);
  const cif              = stringValue(formData, "fiscalnet_cif") || null;
  const operatorCode     = stringValue(formData, "fiscalnet_operator_code") || "1";

  let vatGroups: VatGroup[] = DEFAULT_VAT_GROUPS;
  try {
    const raw = stringValue(formData, "fiscalnet_vat_groups");
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) vatGroups = parsed as VatGroup[];
    }
  } catch { /* keep defaults */ }

  let paymentTypeMap: Record<string, FiscalPaymentCode> = { ...DEFAULT_PAYMENT_TYPE_MAP };
  try {
    const raw = stringValue(formData, "fiscalnet_payment_type_map");
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        paymentTypeMap = parsed as Record<string, FiscalPaymentCode>;
      }
    }
  } catch { /* keep defaults */ }

  if (connectionMode === "file") {
    if (bonuriPath)  { try { safePath(bonuriPath); }  catch { return { error: "Invalid Bonuri path." }; } }
    if (raspunsPath) { try { safePath(raspunsPath); } catch { return { error: "Invalid Raspuns path." }; } }
  }

  const { error } = await supabase
    .from("organisations")
    .update({
      fiscalnet_enabled:          enabled,
      fiscalnet_mock_mode:        mockMode,
      fiscalnet_connection_mode:  connectionMode,
      fiscalnet_api_host:         apiHost.replace(/\/$/, ""),
      fiscalnet_bonuri_path:      bonuriPath,
      fiscalnet_raspuns_path:     raspunsPath,
      fiscalnet_auto_print:       autoPrint,
      fiscalnet_ask_before_print: askBeforePrint,
      fiscalnet_manual_only:      manualOnly,
      fiscalnet_timeout_ms:       Math.min(Math.max(timeoutMs, 5000), 120000),
      fiscalnet_retry_count:      Math.min(Math.max(retryCount, 0), 5),
      fiscalnet_cif:              cif,
      fiscalnet_operator_code:    operatorCode,
      fiscalnet_vat_groups:       vatGroups,
      fiscalnet_payment_type_map: paymentTypeMap,
    })
    .eq("id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/app/settings");
  return { success: true };
}

// ── Test connection ───────────────────────────────────────────────────────

export async function testFiscalNetConnection(): Promise<{ ok: boolean; message: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO") return { ok: false, message: "FiscalNet only for Romanian companies." };
  if (!org.fiscalnet_enabled) return { ok: false, message: "FiscalNet is not enabled." };

  const config = buildFiscalNetConfig(org);

  if (config.mockMode) {
    return { ok: true, message: "Mock mode — test simulated successfully. No hardware called." };
  }

  // API mode: FiscalNet connector runs on the cashier PC at localhost:65400.
  // The cloud server cannot reach it — connection test must be done from the browser.
  if (config.connectionMode === "api") {
    return { ok: true, message: "Modul API: testul conexiunii se efectuează din browser (casa fiscală rulează pe PC-ul casierului, nu pe server). Apasă Test din setările browserului." };
  }

  const result = await fiscalStatus(config);
  return result;
}

// ── Cash in ───────────────────────────────────────────────────────────────

export async function fiscalCashInAction(formData: FormData): Promise<FiscalActionResult> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const amount    = numberValue(formData, "amount", 0);
  if (amount <= 0) return { ok: false, message: "Amount must be greater than 0." };

  const sessionId = stringValue(formData, "session_id") || null;
  const config    = buildFiscalNetConfig(org);
  console.info("[FiscalNet] cash_in requested", { mode: config.connectionMode, bonuriPathNull: !config.bonuriPath, raspunsPathNull: !config.raspunsPath });
  if (config.connectionMode === "file") {
    return fiscalDownload("cash_in", "CASHIN", buildCashInLines(amount));
  }

  return fiscalCashIn(config, amount, {
    supabase, orgId, performedBy: user.id, sessionId, amountRon: amount,
  });
}

// ── Cash out ──────────────────────────────────────────────────────────────

export async function fiscalCashOutAction(formData: FormData): Promise<FiscalActionResult> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const amount    = numberValue(formData, "amount", 0);
  if (amount <= 0) return { ok: false, message: "Amount must be greater than 0." };

  const sessionId = stringValue(formData, "session_id") || null;
  const config    = buildFiscalNetConfig(org);
  console.info("[FiscalNet] cash_out requested", { mode: config.connectionMode, bonuriPathNull: !config.bonuriPath, raspunsPathNull: !config.raspunsPath });
  if (config.connectionMode === "file") {
    return fiscalDownload("cash_out", "CASHOUT", buildCashOutLines(amount));
  }

  return fiscalCashOut(config, amount, {
    supabase, orgId, performedBy: user.id, sessionId, amountRon: amount,
  });
}

// ── Void last receipt ─────────────────────────────────────────────────────

export async function fiscalVoidLastAction(): Promise<{ ok: boolean; message: string }> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const config = buildFiscalNetConfig(org);
  return fiscalVoidLast(config, { supabase, orgId, performedBy: user.id });
}

// ── Open drawer ───────────────────────────────────────────────────────────

export async function fiscalDrawerAction(): Promise<FiscalActionResult> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const config = buildFiscalNetConfig(org);
  console.info("[FiscalNet] drawer requested", { mode: config.connectionMode, bonuriPathNull: !config.bonuriPath, raspunsPathNull: !config.raspunsPath });
  if (config.connectionMode === "file") {
    return fiscalDownload("drawer", "DRAWER", buildDrawerLines());
  }
  return fiscalOpenDrawer(config, { supabase, orgId, performedBy: user.id });
}

// ── X Report ─────────────────────────────────────────────────────────────

export async function runXReport(): Promise<FiscalActionResult> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const config = buildFiscalNetConfig(org);
  console.info("[FiscalNet] x_report requested", { mode: config.connectionMode, bonuriPathNull: !config.bonuriPath, raspunsPathNull: !config.raspunsPath });
  if (config.connectionMode === "file") {
    return fiscalDownload("x_report", "XREPORT", buildXReportLines());
  }
  return fiscalXReport(config, { supabase, orgId, performedBy: user.id });
}

// ── Z Report ─────────────────────────────────────────────────────────────
// Requires admin/manager role, must not run automatically, requires
// explicit confirmation. Per-session duplicate prevention.

export async function runZReport(formData: FormData): Promise<FiscalActionResult> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const sessionId = stringValue(formData, "session_id") || null;

  // Duplicate prevention: one Z report per POS session
  if (sessionId) {
    const { data: session } = await supabase
      .from("pos_sessions")
      .select("fiscal_z_report_done")
      .eq("id", sessionId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (session?.fiscal_z_report_done) {
      return { ok: false, message: "Raport Z deja efectuat pentru această sesiune." };
    }
  }

  const config = buildFiscalNetConfig(org);
  console.info("[FiscalNet] z_report requested", { mode: config.connectionMode, mock: config.mockMode, bonuriPathNull: !config.bonuriPath });

  async function markSessionZDone() {
    if (!sessionId) return;
    await supabase
      .from("pos_sessions")
      .update({ fiscal_z_report_done: true, fiscal_z_report_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("organisation_id", orgId)
      .then(() => null, () => null);
  }

  if (config.connectionMode === "file") {
    const download = fiscalDownload("z_report", "ZREPORT", buildZReportLines());
    await markSessionZDone();
    return { ...download, status: "pending_manual_confirmation" };
  }

  // API mode, non-mock: FiscalNet runs on the cashier PC at localhost:65400.
  // The cloud server cannot call localhost on the client machine.
  // Return browser_api_pending — the client browser calls fiscalBrowserZReport() directly.
  if (!config.mockMode) {
    await markSessionZDone();
    return { ok: true, message: "Trimitere la casa fiscală...", status: "browser_api_pending" };
  }

  // Mock mode: server-side execution is fine (no real HTTP call).
  const result = await fiscalZReport(config, {
    supabase, orgId, performedBy: user.id, sessionId,
  });
  if (result.ok) await markSessionZDone();
  return result;
}

// ── Retry fiscal receipt ──────────────────────────────────────────────────

export async function retryFiscalReceipt(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const transactionId = stringValue(formData, "transaction_id");
  if (!transactionId) return { ok: false, message: "Missing transaction ID." };

  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, message: "Permission denied." };

  const org = await getOrgWithFiscal(supabase, orgId);
  if (!org || org.country_code !== "RO" || !org.fiscalnet_enabled) {
    return { ok: false, message: "FiscalNet not active." };
  }

  const config = buildFiscalNetConfig(org);

  const { data: tx } = await supabase
    .from("pos_transactions")
    .select("id,transaction_number,total,payment_method_id,payment_methods(type),pos_transaction_items(product_name,quantity,unit_price,vat_rate,line_total)")
    .eq("id", transactionId)
    .eq("organisation_id", orgId)
    .single();

  if (!tx) return { ok: false, message: "Transaction not found." };

  const { count: attemptCount } = await supabase
    .from("fiscal_receipt_attempts")
    .select("id", { count: "exact", head: true })
    .eq("transaction_id", transactionId);

  const items: FiscalLineItem[] = ((tx.pos_transaction_items ?? []) as Array<{
    product_name: string; quantity: number; unit_price: number; vat_rate: number;
  }>).map((i) => ({
    productName: i.product_name,
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unit_price),
    vatRate:     Number(i.vat_rate ?? 0),
  }));

  const paymentType = (tx.payment_methods as { type?: string } | null)?.type ?? "other";

  const result = await printFiscalReceipt({
    supabase, orgId,
    transactionId: tx.id as string,
    transactionRef: (tx.transaction_number as string) ?? tx.id as string,
    performedBy: user.id, config, items,
    totalGross: Number(tx.total),
    paymentType,
    attemptNumber: (attemptCount ?? 0) + 1,
  });

  revalidatePath(`/app/transactions/${transactionId}`);

  if (result.success) {
    return { ok: true, message: `Receipt printed. Nr: ${result.receiptNumber ?? "?"}${result.mock ? " (mock)" : ""}` };
  }
  return { ok: false, message: result.errorInfo ?? `Print failed: ${result.status}` };
}
