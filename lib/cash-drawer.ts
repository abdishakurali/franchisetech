// lib/cash-drawer.ts
// Cash drawer orchestration: simulation, diagnostics, live ESC/POS via connector.

export type CashDrawerMode =
  | "off"
  | "manual"
  | "local_connector"
  | "android_connector";

export type CashDrawerReason =
  | "cash_in"
  | "cash_out"
  | "cash_sale"
  | "test"
  | "connector_check"
  | "setup_test"
  | "pairing";

export type ConnectorRunMode = "simulation" | "diagnostic" | "live";

export type CashDrawerResultCode =
  // Legacy / general
  | "skipped"
  | "manual_required"
  | "command_sent"
  | "failed"
  | "not_configured"
  | "rate_limited"
  | "invalid_token"
  | "missing_token"
  | "origin_rejected"
  | "connector_unavailable"
  | "timeout"
  | "hardware_verified"
  | "paired"
  | "pairing_failed"
  | "setup_completed"
  // Simulation / Diagnostic mode
  | "simulation_success"
  | "simulation_only"
  | "diagnostic_passed"
  | "diagnostic_warning"
  | "diagnostic_failed"
  | "diagnostic_only"
  // Connector / auth errors
  | "connector_unavailable"
  | "browser_blocked"
  | "not_paired"
  // Printer-level errors
  | "printer_not_configured"
  | "printer_ip_missing"
  | "printer_unreachable"
  | "printer_port_blocked"
  | "printer_connection_timeout"
  | "printer_connection_refused"
  | "printer_write_failed"
  // Live gating
  | "hardware_not_verified";

export type CashDrawerPlatform =
  | "web"
  | "windows_connector"
  | "android_connector"
  | "unknown";

export type PrinterType =
  | "network_escpos"
  | "usb_escpos"
  | "bluetooth_escpos"
  | "unknown";

export interface CashDrawerSettings {
  mode?: CashDrawerMode | null;
  port?: number | string | null;
  token?: string | null;
  triggerOnCashSale?: boolean | null;
  triggerOnCashIn?: boolean | null;
  triggerOnCashOut?: boolean | null;
}

export interface CashDrawerResult {
  ok: boolean;
  result: CashDrawerResultCode;
  cashierMessage: string;
  errorCode?: string;
  technicalMessage?: string;
  connectorVersion?: string;
  connectorMode?: ConnectorRunMode;
  suggestion?: string;
  requestId?: string;
  durationMs?: number;
}

// ── Display strings ──────────────────────────────────────────────────────────

export const REASON_LABELS: Record<CashDrawerReason, string> = {
  cash_sale:       "Cash sale",
  cash_in:         "Cash in",
  cash_out:        "Cash out",
  test:            "Test command",
  connector_check: "Connector check",
  setup_test:      "Setup test",
  pairing:         "Pairing",
};

export const RESULT_LABELS: Partial<Record<CashDrawerResultCode, string>> = {
  skipped:                    "Skipped",
  manual_required:            "Manual opening required",
  command_sent:               "Open command sent",
  failed:                     "Failed",
  not_configured:             "Printer not configured",
  rate_limited:               "Too many attempts",
  invalid_token:              "Invalid pairing token",
  missing_token:              "Pairing token missing",
  origin_rejected:            "Connection blocked",
  connector_unavailable:      "Connector not running",
  timeout:                    "Connector timeout",
  hardware_verified:          "Hardware verified",
  paired:                     "Paired",
  pairing_failed:             "Pairing failed",
  setup_completed:            "Setup completed",
  simulation_success:         "Simulation passed",
  simulation_only:            "Simulation mode — open manually",
  diagnostic_passed:          "Diagnostics passed",
  diagnostic_warning:         "Diagnostics passed with warnings",
  diagnostic_failed:          "Diagnostics failed",
  diagnostic_only:            "Diagnostic mode — open manually",
  not_paired:                 "Not paired",
  printer_not_configured:     "Printer not configured",
  printer_ip_missing:         "Printer IP not set",
  printer_unreachable:        "Printer unreachable",
  printer_port_blocked:       "Port 9100 blocked",
  printer_connection_timeout: "Printer connection timeout",
  printer_connection_refused: "Printer connection refused",
  printer_write_failed:       "Printer write failed",
  hardware_not_verified:      "Hardware not verified",
  browser_blocked:            "Browser blocked request",
};

// ── Cashier messages ─────────────────────────────────────────────────────────

function manualMessage(reason: CashDrawerReason): string {
  if (reason === "test" || reason === "setup_test") return "Manual mode is enabled. Open the drawer manually.";
  if (reason === "cash_sale") return "Cash recorded. Open drawer manually.";
  return "Cash movement saved. Open drawer manually.";
}

function sentMessage(reason: CashDrawerReason): string {
  if (reason === "test" || reason === "setup_test") return "Test command sent to the connector.";
  if (reason === "cash_sale") return "Cash recorded. Open-drawer command sent.";
  return "Cash movement saved. Open-drawer command sent.";
}

function failedMessage(reason: CashDrawerReason): string {
  if (reason === "test" || reason === "setup_test") return "Could not send the drawer command. Check the connector and printer.";
  if (reason === "cash_sale") return "Cash recorded. Could not send the drawer command. Open drawer manually.";
  return "Cash movement saved. Could not send the drawer command. Open drawer manually.";
}

function simulationOnlyMessage(): string {
  return "Simulation mode is enabled. Open drawer manually.";
}

function diagnosticOnlyMessage(): string {
  return "Diagnostic mode active. No command sent. Open drawer manually.";
}

function connectorErrorMessage(
  reason: CashDrawerReason,
  errorCode?: string,
  status?: number,
): string {
  if (errorCode === "SIMULATION_ONLY")            return simulationOnlyMessage();
  if (errorCode === "DIAGNOSTIC_ONLY")            return diagnosticOnlyMessage();
  if (errorCode === "PRINTER_NOT_CONFIGURED")     return "Printer is not configured.";
  if (errorCode === "PRINTER_IP_MISSING")         return "Printer IP is not set in the connector.";
  if (errorCode === "HARDWARE_NOT_VERIFIED")      return "Hardware not verified. Open drawer manually.";
  if (errorCode === "RATE_LIMITED")               return "Drawer command was sent too recently.";
  if (errorCode === "NOT_PAIRED")                 return "Connector is not paired with this terminal.";
  if (
    errorCode === "ORIGIN_REJECTED" ||
    errorCode === "ORIGIN_NOT_ALLOWED" ||
    errorCode === "ORIGIN_REQUIRED"
  ) {
    return "Connection blocked — origin not allowed in connector settings.";
  }
  if (
    status === 401 ||
    status === 403 ||
    errorCode === "BAD_TOKEN" ||
    errorCode === "INVALID_PAIRING_TOKEN" ||
    errorCode === "INVALID_TOKEN" ||
    errorCode === "MISSING_TOKEN"
  ) {
    return "Invalid pairing token or origin not allowed.";
  }
  return failedMessage(reason);
}

// ── Result code mapping ──────────────────────────────────────────────────────

function mapErrorToResult(errorCode?: string, status?: number): CashDrawerResultCode {
  if (errorCode === "SIMULATION_ONLY")            return "simulation_only";
  if (errorCode === "DIAGNOSTIC_ONLY")            return "diagnostic_only";
  if (errorCode === "RATE_LIMITED")               return "rate_limited";
  if (errorCode === "PRINTER_NOT_CONFIGURED")     return "printer_not_configured";
  if (errorCode === "PRINTER_IP_MISSING")         return "printer_ip_missing";
  if (errorCode === "HARDWARE_NOT_VERIFIED")      return "hardware_not_verified";
  if (errorCode === "NOT_PAIRED")                 return "not_paired";
  if (errorCode === "PRINTER_CONNECTION_TIMEOUT") return "printer_connection_timeout";
  if (errorCode === "PRINTER_CONNECTION_REFUSED") return "printer_connection_refused";
  if (errorCode === "PRINTER_WRITE_FAILED")       return "printer_write_failed";
  if (errorCode === "PRINTER_UNREACHABLE")        return "printer_unreachable";
  if (errorCode === "PRINTER_PORT_BLOCKED")       return "printer_port_blocked";
  if (
    errorCode === "ORIGIN_REJECTED" ||
    errorCode === "ORIGIN_NOT_ALLOWED" ||
    errorCode === "ORIGIN_REQUIRED"
  )                                               return "origin_rejected";
  if (
    status === 401 ||
    status === 403 ||
    errorCode === "BAD_TOKEN" ||
    errorCode === "INVALID_PAIRING_TOKEN" ||
    errorCode === "INVALID_TOKEN"
  )                                               return "invalid_token";
  if (errorCode === "MISSING_TOKEN")              return "missing_token";
  return "failed";
}

// ── Audit event recording ────────────────────────────────────────────────────

export interface DrawerAuditPayload {
  reason: CashDrawerReason;
  mode: CashDrawerMode;
  result: CashDrawerResultCode;
  platform?: CashDrawerPlatform;
  errorCode?: string;
  errorMessage?: string;
  connectorVersion?: string;
  connectorUrl?: string;
  connectorDeviceName?: string;
  connectorId?: string;
  connectorRunMode?: ConnectorRunMode;
  printerType?: PrinterType;
  printerIp?: string;
  printerPort?: number;
  commandHex?: string;
  durationMs?: number;
  requestId?: string;
  suggestion?: string;
  relatedSaleId?: string;
  relatedCashMovementId?: string;
}

export function recordDrawerEvent(payload: DrawerAuditPayload): void {
  fetch("/api/cash-drawer/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);
}

function buildAuditPayload(
  reason: CashDrawerReason,
  settings: CashDrawerSettings,
  result: CashDrawerResult,
  extra?: Partial<DrawerAuditPayload>,
): DrawerAuditPayload {
  const mode = (settings.mode ?? "manual") as CashDrawerMode;
  const port = Number(settings.port ?? 17878);
  return {
    reason,
    mode,
    result: result.result,
    platform: "web",
    errorCode: result.errorCode,
    errorMessage: result.technicalMessage,
    connectorVersion: result.connectorVersion,
    connectorRunMode: result.connectorMode,
    connectorUrl:
      mode === "local_connector" || mode === "android_connector"
        ? `http://127.0.0.1:${Number.isFinite(port) ? port : 17878}/${reason === "test" || reason === "setup_test" ? "test-drawer" : "open-drawer"}`
        : undefined,
    commandHex: mode !== "off" && mode !== "manual" ? "1B700019FA" : undefined,
    durationMs: result.durationMs,
    requestId: result.requestId,
    suggestion: result.suggestion,
    ...extra,
  };
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function openCashDrawer(
  reason: CashDrawerReason,
  settings: CashDrawerSettings = {},
  extra?: Partial<DrawerAuditPayload>,
): Promise<CashDrawerResult> {
  if (typeof window === "undefined") {
    return { ok: false, result: "manual_required", cashierMessage: manualMessage(reason) };
  }

  const mode = (settings.mode ?? "manual") as CashDrawerMode;

  // ── Off ──────────────────────────────────────────────────────────────────
  if (mode === "off") {
    const r: CashDrawerResult = { ok: true, result: "skipped", cashierMessage: "" };
    recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode }, r, extra));
    return r;
  }

  // ── Manual ───────────────────────────────────────────────────────────────
  if (mode === "manual") {
    const r: CashDrawerResult = {
      ok: false,
      result: "manual_required",
      cashierMessage: manualMessage(reason),
    };
    recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode }, r, extra));
    return r;
  }

  // ── Should this mode/reason trigger? ─────────────────────────────────────
  const shouldTrigger =
    (reason === "cash_sale" && settings.triggerOnCashSale !== false) ||
    (reason === "cash_in"   && settings.triggerOnCashIn  !== false) ||
    (reason === "cash_out"  && settings.triggerOnCashOut !== false) ||
    reason === "test" ||
    reason === "setup_test" ||
    reason === "connector_check";

  if (!shouldTrigger) {
    const r: CashDrawerResult = { ok: true, result: "skipped", cashierMessage: "" };
    recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode }, r, extra));
    return r;
  }

  // ── Local / Android connector ─────────────────────────────────────────────
  const port = Number(settings.port ?? 17878);
  const safePart  = Number.isFinite(port) ? port : 17878;
  const endpoint  = reason === "test" || reason === "setup_test" ? "test-drawer" : "open-drawer";
  const connectorUrl = `http://127.0.0.1:${safePart}/${endpoint}`;

  const controller = new AbortController();
  const t0 = Date.now();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(connectorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use x-connector-token for connector auth
        ...(settings.token ? { "x-connector-token": settings.token } : {}),
      },
      body: JSON.stringify({
        reason,
        source: "franchisetech-web",
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);
    const durationMs = Date.now() - t0;

    const body = await res.json().catch(() => ({}));
    const errorCode: string | undefined =
      typeof body.errorCode === "string" ? body.errorCode : undefined;
    const bodyResult: string | undefined =
      typeof body.result === "string" ? body.result : undefined;
    const connectorVersion = typeof body.connectorVersion === "string" ? body.connectorVersion : undefined;
    const connectorMode = typeof body.connectorMode === "string" ? (body.connectorMode as ConnectorRunMode) : undefined;
    const suggestion = typeof body.suggestion === "string" ? body.suggestion : undefined;
    const requestId = typeof body.requestId === "string" ? body.requestId : undefined;

    if (res.ok) {
      // Check for simulation_only / diagnostic_only even on HTTP 200
      if (bodyResult === "simulation_only") {
        const r: CashDrawerResult = {
          ok: false,
          result: "simulation_only",
          cashierMessage: simulationOnlyMessage(),
          connectorVersion,
          connectorMode,
          suggestion,
          requestId,
          durationMs,
        };
        recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode, port }, r, extra));
        return r;
      }
      if (bodyResult === "diagnostic_only") {
        const r: CashDrawerResult = {
          ok: false,
          result: "diagnostic_only",
          cashierMessage: diagnosticOnlyMessage(),
          connectorVersion,
          connectorMode,
          suggestion,
          requestId,
          durationMs,
        };
        recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode, port }, r, extra));
        return r;
      }

      const r: CashDrawerResult = {
        ok: true,
        result: "command_sent",
        cashierMessage: sentMessage(reason),
        connectorVersion,
        connectorMode,
        requestId,
        durationMs,
      };
      recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode, port }, r, extra));
      return r;
    }

    // HTTP error response from connector
    const resultCode = mapErrorToResult(errorCode, res.status);
    const r: CashDrawerResult = {
      ok: false,
      result: resultCode,
      cashierMessage: connectorErrorMessage(reason, errorCode, res.status),
      errorCode,
      technicalMessage:
        typeof body.message === "string" ? body.message : `HTTP ${res.status}`,
      connectorVersion,
      connectorMode,
      suggestion,
      requestId,
      durationMs,
    };
    recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode, port }, r, extra));
    return r;
  } catch (error) {
    window.clearTimeout(timeoutId);
    const durationMs = Date.now() - t0;
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    const r: CashDrawerResult = {
      ok: false,
      result: isTimeout ? "timeout" : "connector_unavailable",
      cashierMessage: failedMessage(reason),
      errorCode: isTimeout ? "CONNECTOR_TIMEOUT" : "CONNECTOR_UNAVAILABLE",
      technicalMessage: isTimeout
        ? "Connector did not respond in time."
        : error instanceof Error ? error.message : "Connector failed",
      durationMs,
    };
    recordDrawerEvent(buildAuditPayload(reason, { ...settings, mode, port: safePart }, r, extra));
    return r;
  }
}
