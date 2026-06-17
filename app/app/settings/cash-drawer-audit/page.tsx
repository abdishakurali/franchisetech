"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  REASON_LABELS,
  RESULT_LABELS,
  type CashDrawerReason,
  type CashDrawerResultCode,
  type CashDrawerMode,
} from "@/lib/cash-drawer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DrawerEvent {
  id: string;
  reason: CashDrawerReason;
  mode: CashDrawerMode;
  result: CashDrawerResultCode;
  platform?: string;
  error_code?: string | null;
  error_message?: string | null;
  connector_version?: string | null;
  connector_device_name?: string | null;
  connector_id?: string | null;
  printer_type?: string | null;
  printer_ip?: string | null;
  printer_port?: number | null;
  command_hex?: string | null;
  duration_ms?: number | null;
  request_id?: string | null;
  connector_run_mode?: string | null;
  suggestion?: string | null;
  related_sale_id?: string | null;
  related_cash_movement_id?: string | null;
  location_id?: string | null;
  terminal_id?: string | null;
  device_id?: string | null;
  user_id?: string | null;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function resultBadge(result: CashDrawerResultCode) {
  const label = RESULT_LABELS[result] ?? result;
  if (result === "command_sent" || result === "paired" || result === "hardware_verified" || result === "setup_completed"
      || result === "simulation_success" || result === "diagnostic_passed") {
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{label}</Badge>;
  }
  if (result === "manual_required" || result === "skipped") {
    return <Badge className="bg-slate-100 text-slate-600 border-slate-200">{label}</Badge>;
  }
  if (result === "simulation_only" || result === "diagnostic_only") {
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{label}</Badge>;
  }
  if (result === "diagnostic_warning" || result === "hardware_not_verified") {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{label}</Badge>;
  }
  if (result === "timeout" || result === "connector_unavailable" || result === "failed"
      || result === "diagnostic_failed" || result === "printer_unreachable" || result === "printer_connection_timeout"
      || result === "printer_connection_refused" || result === "printer_write_failed" || result === "browser_blocked") {
    return <Badge className="bg-red-100 text-red-800 border-red-200">{label}</Badge>;
  }
  if (result === "rate_limited" || result === "invalid_token" || result === "missing_token" || result === "origin_rejected"
      || result === "not_configured" || result === "not_paired" || result === "printer_not_configured"
      || result === "printer_ip_missing" || result === "printer_port_blocked") {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}

function modeBadge(mode: CashDrawerMode) {
  if (mode === "local_connector") return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Local connector</Badge>;
  if (mode === "android_connector") return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Android connector</Badge>;
  if (mode === "manual") return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Manual</Badge>;
  return <Badge variant="outline">{mode}</Badge>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IE", { dateStyle: "short", timeStyle: "medium" });
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function EventDetail({ event, onClose }: { event: DrawerEvent; onClose: () => void }) {
  const rows: Array<[string, string | number | null | undefined]> = [
    ["Event ID",        event.id],
    ["Request ID",      event.request_id],
    ["Time",            fmtDate(event.created_at)],
    ["Reason",          REASON_LABELS[event.reason] ?? event.reason],
    ["Mode",            event.mode],
    ["Result",          RESULT_LABELS[event.result] ?? event.result],
    ["Platform",        event.platform],
    ["Connector ver.",  event.connector_version],
    ["Connector device",event.connector_device_name],
    ["Connector ID",    event.connector_id],
    ["Printer type",    event.printer_type],
    ["Printer IP",      event.printer_ip],
    ["Printer port",    event.printer_port],
    ["Command hex",     event.command_hex],
    ["Duration",        event.duration_ms != null ? `${event.duration_ms} ms` : null],
    ["Connector mode",  event.connector_run_mode],
    ["Error code",      event.error_code],
    ["Error message",   event.error_message],
    ["Suggestion",      event.suggestion],
    ["Terminal",        event.terminal_id],
    ["Location",        event.location_id],
    ["Device",          event.device_id],
    ["Sale ID",         event.related_sale_id],
    ["Movement ID",     event.related_cash_movement_id],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Event detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <dl className="divide-y divide-slate-100">
          {rows.map(([label, value]) =>
            value == null ? null : (
              <div key={label} className="flex gap-4 py-2 text-sm">
                <dt className="w-36 shrink-0 text-slate-500">{label}</dt>
                <dd className="font-mono break-all text-slate-900">{String(value)}</dd>
              </div>
            ),
          )}
        </dl>
        {/* Safety note: pairing token is never stored in audit events */}
        <p className="mt-4 text-xs text-slate-400">Pairing tokens and payment card data are never stored in audit events.</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CashDrawerAuditPage() {
  const [events, setEvents]   = useState<DrawerEvent[]>([]);
  const [total,  setTotal]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,  setError]    = useState<string | null>(null);
  const [selected, setSelected] = useState<DrawerEvent | null>(null);

  // Filters
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");
  const [reason,  setReason]  = useState("");
  const [result,  setResult]  = useState("");
  const [mode,    setMode]    = useState("");
  const [offset,  setOffset]  = useState(0);
  const LIMIT = 50;

  const load = useCallback(async (off = 0) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(off) });
    if (from)   params.set("from",   from);
    if (to)     params.set("to",     to + "T23:59:59Z");
    if (reason) params.set("reason", reason);
    if (result) params.set("result", result);
    if (mode)   params.set("mode",   mode);
    try {
      const res = await fetch(`/api/cash-drawer/events?${params}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to load events");
      setEvents(data.events);
      setTotal(data.total);
      setOffset(off);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [from, to, reason, result, mode]);

  useEffect(() => { void Promise.resolve().then(() => load(0)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    load(0);
  }

  return (
    <div className="max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cash drawer audit log</h1>
        <p className="mt-1 text-sm text-slate-500">Every drawer action is recorded. Pairing tokens and payment data are never shown.</p>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="text-xs font-medium text-slate-500">From date</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">To date</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Action</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">All actions</option>
              {(Object.entries(REASON_LABELS) as [CashDrawerReason, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Result</label>
            <select value={result} onChange={(e) => setResult(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">All results</option>
              {(Object.entries(RESULT_LABELS) as [CashDrawerResultCode, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">All modes</option>
              <option value="off">Off</option>
              <option value="manual">Manual</option>
              <option value="local_connector">Local connector</option>
              <option value="android_connector">Android connector</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Apply</Button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading && (
          <div className="px-6 py-4 text-sm text-slate-500">Loading…</div>
        )}
        {error && (
          <div className="px-6 py-4 text-sm text-red-700 bg-red-50">{error}</div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-400">No drawer events found for this filter.</div>
        )}
        {events.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Connector</th>
                  <th className="px-4 py-3">Printer</th>
                  <th className="px-4 py-3">Error</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{fmtDate(ev.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{REASON_LABELS[ev.reason] ?? ev.reason}</td>
                    <td className="px-4 py-3">{modeBadge(ev.mode)}</td>
                    <td className="px-4 py-3">{resultBadge(ev.result)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{ev.connector_version ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{ev.printer_ip ? `${ev.printer_ip}:${ev.printer_port ?? 9100}` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-red-700">{ev.error_code ?? ""}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(ev)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => load(Math.max(0, offset - LIMIT))}>← Prev</Button>
              <Button variant="outline" size="sm" disabled={offset + LIMIT >= total} onClick={() => load(offset + LIMIT)}>Next →</Button>
            </div>
          </div>
        )}
      </div>

      {selected && <EventDetail event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
