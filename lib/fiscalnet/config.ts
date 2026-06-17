/**
 * FiscalNet config builder
 * Converts an organisations row to a typed FiscalNetConfig.
 */

import type { FiscalNetConfig, VatGroup, FiscalPaymentCode } from "./types";
import { DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP } from "./types";

export function buildFiscalNetConfig(org: Record<string, unknown>): FiscalNetConfig {
  // VAT groups: use stored JSON or fall back to defaults
  let vatGroups: VatGroup[] = DEFAULT_VAT_GROUPS;
  try {
    const raw = org.fiscalnet_vat_groups;
    if (Array.isArray(raw) && raw.length > 0) vatGroups = raw as VatGroup[];
  } catch { /* use defaults */ }

  // Payment type map: use stored JSON or fall back to defaults
  let paymentTypeMap: Record<string, FiscalPaymentCode> = { ...DEFAULT_PAYMENT_TYPE_MAP };
  try {
    const raw = org.fiscalnet_payment_type_map;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      paymentTypeMap = raw as Record<string, FiscalPaymentCode>;
    }
  } catch { /* use defaults */ }

  const mode = (org.fiscalnet_connection_mode as string) === "file" ? "file" : "api";

  return {
    enabled:        Boolean(org.fiscalnet_enabled ?? false),
    connectionMode: mode,
    apiHost:        ((org.fiscalnet_api_host as string) || "http://localhost:65400").replace(/\/$/, ""),
    mockMode:       org.fiscalnet_mock_mode !== false,  // default true = safe
    bonuriPath:     (org.fiscalnet_bonuri_path as string) || null,
    raspunsPath:    (org.fiscalnet_raspuns_path as string) || null,
    autoPrint:      Boolean(org.fiscalnet_auto_print ?? true),
    askBeforePrint: Boolean(org.fiscalnet_ask_before_print ?? false),
    manualOnly:     Boolean(org.fiscalnet_manual_only ?? false),
    timeoutMs:      Number(org.fiscalnet_timeout_ms ?? 30000),
    retryCount:     Number(org.fiscalnet_retry_count ?? 2),
    cif:            (org.fiscalnet_cif as string) || null,
    operatorCode:   (org.fiscalnet_operator_code as string) || "1",
    vatGroups,
    paymentTypeMap,
  };
}
