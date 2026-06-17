import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const REASONS   = new Set(["cash_sale","cash_in","cash_out","test","connector_check","setup_test","pairing"]);
const MODES     = new Set(["off","manual","local_connector","android_connector"]);
const RESULTS   = new Set([
  // legacy
  "skipped","manual_required","command_sent","failed","not_configured",
  "rate_limited","invalid_token","missing_token","origin_rejected","connector_unavailable",
  "timeout","hardware_verified","paired","pairing_failed","setup_completed",
  // simulation / diagnostic
  "simulation_success","simulation_only",
  "diagnostic_passed","diagnostic_warning","diagnostic_failed","diagnostic_only",
  // connector / auth
  "not_paired","browser_blocked",
  // printer-level
  "printer_not_configured","printer_ip_missing","printer_unreachable",
  "printer_port_blocked","printer_connection_timeout","printer_connection_refused",
  "printer_write_failed","hardware_not_verified",
]);
const PLATFORMS = new Set(["web","windows_connector","android_connector","unknown"]);
const PRINTER_TYPES = new Set(["network_escpos","usb_escpos","bluetooth_escpos","unknown"]);
const CONNECTOR_RUN_MODES = new Set(["simulation","diagnostic","live"]);

function str(v: unknown, max: number): string | null {
  return typeof v === "string" ? v.slice(0, max) : null;
}
function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership?.organisation_id) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => ({}));

  const reason   = REASONS.has(body.reason)         ? body.reason         : "test";
  const mode     = MODES.has(body.mode)             ? body.mode           : "manual";
  const result   = RESULTS.has(body.result)         ? body.result         : "failed";
  const platform = PLATFORMS.has(body.platform)     ? body.platform       : "web";
  const printerType = PRINTER_TYPES.has(body.printerType) ? body.printerType : null;
  const connectorRunMode = CONNECTOR_RUN_MODES.has(body.connectorRunMode)
    ? body.connectorRunMode : null;

  await supabase.from("cash_drawer_events").insert({
    organisation_id:           membership.organisation_id,
    user_id:                   user.id,
    reason,
    mode,
    result,
    platform,
    error_code:                str(body.errorCode,            80),
    error_message:             str(body.errorMessage,        240),
    connector_version:         str(body.connectorVersion,     80),
    connector_url:             str(body.connectorUrl,        120),
    connector_device_name:     str(body.connectorDeviceName, 120),
    connector_id:              str(body.connectorId,          80),
    connector_run_mode:        connectorRunMode,
    printer_type:              printerType,
    printer_ip:                str(body.printerIp,            80),
    printer_port:              num(body.printerPort),
    command_hex:               str(body.commandHex,           40),
    duration_ms:               num(body.durationMs),
    request_id:                str(body.requestId,            80),
    suggestion:                str(body.suggestion,          240),
    related_sale_id:           str(body.relatedSaleId,        36),
    related_cash_movement_id:  str(body.relatedCashMovementId,36),
    location_id:               str(body.locationId,           36),
    terminal_id:               str(body.terminalId,           36),
    device_id:                 str(body.deviceId,             80),
  }).then(() => null, () => null);

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership?.organisation_id) return NextResponse.json({ ok: false }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const limit    = Math.min(Math.max(1, Number(searchParams.get("limit")  ?? 50)),  200);
  const offset   = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const reason   = searchParams.get("reason");
  const result   = searchParams.get("result");
  const mode     = searchParams.get("mode");
  const fromDate = searchParams.get("from");
  const toDate   = searchParams.get("to");

  let query = supabase
    .from("cash_drawer_events")
    .select(`
      id, reason, mode, result, platform,
      error_code, error_message,
      connector_version, connector_device_name, connector_id, connector_run_mode,
      printer_type, printer_ip, printer_port, command_hex,
      duration_ms, request_id, suggestion,
      related_sale_id, related_cash_movement_id,
      location_id, terminal_id, device_id,
      created_at,
      user_id
    `, { count: "exact" })
    .eq("organisation_id", membership.organisation_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (reason   && REASONS.has(reason))   query = query.eq("reason", reason);
  if (result   && RESULTS.has(result))   query = query.eq("result", result);
  if (mode     && MODES.has(mode))       query = query.eq("mode",   mode);
  if (fromDate) query = query.gte("created_at", fromDate);
  if (toDate)   query = query.lte("created_at", toDate);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, events: data ?? [], total: count ?? 0 });
}
