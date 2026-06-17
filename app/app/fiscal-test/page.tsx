"use client";
/**
 * FiscalNet Test Console  (/app/fiscal-test)
 *
 * Admin-only page for testing every FiscalNet command.
 * Requires owner or manager role (enforced by server actions).
 *
 * Features:
 *  - Status bar showing mock/live mode, transport, paths
 *  - Grouped test buttons: Receipts / Utility / Reports
 *  - Live operation log (last 30 entries) with timings
 *  - Z report: two-step confirmation with typed phrase
 *  - Preview panel: shows command file content before/after run
 */

import { useState, useTransition, useCallback } from "react";
import {
  runTestReceipt,
  runTestOpenDrawer,
  runTestXReport,
  runTestZReport,
  runTestCancelReceipt,
  runTestCashIn,
  runTestCashOut,
  runTestCustomerDisplay,
  runTestNonFiscal,
  runTestStatus,
  runNamedExample,
  type TestActionResult,
} from "@/app/actions/fiscalnet-test";
import { RECEIPT_EXAMPLES } from "@/lib/fiscalnet/receipt-examples";
import { downloadFiscalNetTxt } from "@/lib/fiscalnet/browser";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LogEntry {
  id:        number;
  ts:        string;
  label:     string;
  ok:        boolean;
  message:   string;
  content?:  string;
  filename?: string;
  duration?: number;
  mock:      boolean;
}

let _id = 0;

// ── Small UI helpers ──────────────────────────────────────────────────────────

function Badge({ children, variant = "neutral" }: {
  children: React.ReactNode;
  variant?: "neutral" | "mock" | "live" | "ok" | "fail" | "warn";
}) {
  const cls: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700",
    mock:    "bg-amber-100 text-amber-800 border border-amber-300",
    live:    "bg-emerald-100 text-emerald-800 border border-emerald-300",
    ok:      "bg-green-100 text-green-800",
    fail:    "bg-red-100 text-red-800",
    warn:    "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls[variant]}`}>
      {children}
    </span>
  );
}

function Btn({
  onClick, disabled, children, variant = "default", danger = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  danger?: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const v = danger
    ? "bg-red-600 hover:bg-red-700 text-white"
    : variant === "outline"
      ? "border border-slate-300 hover:bg-slate-50 text-slate-700"
      : "bg-blue-600 hover:bg-blue-700 text-white";
  return (
    <button className={`${base} ${v}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ── Z Report double-confirmation modal ────────────────────────────────────────

function ZReportModal({ onClose, onConfirm, busy }: {
  onClose:   () => void;
  onConfirm: () => void;
  busy:      boolean;
}) {
  const [phrase, setPhrase] = useState("");
  const CONFIRM_PHRASE = "CLOSE DAY";
  const ready = phrase.trim().toUpperCase() === CONFIRM_PHRASE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-xl">⚠️</div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Confirm Z Report</h2>
            <p className="mt-1 text-sm text-slate-600">
              This will <strong>close today&apos;s fiscal day</strong> on the printer.
              All daily totals will be reset. <strong>This cannot be undone.</strong>
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          <strong>Date:</strong> {new Date().toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1">
          Type <code className="rounded bg-slate-100 px-1">{CONFIRM_PHRASE}</code> to confirm
        </label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          placeholder={CONFIRM_PHRASE}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn danger onClick={onConfirm} disabled={!ready || busy}>
            {busy ? "Running…" : "Confirm Z Report"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ content, label }: { content: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Last Command — {label}
      </h2>
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-green-300 leading-relaxed">
        {content || "(no command sent yet)"}
      </pre>
    </div>
  );
}

// ── Log panel ─────────────────────────────────────────────────────────────────

function LogPanel({ entries }: { entries: LogEntry[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (entries.length === 0)
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Operation Log</h2>
        <p className="text-sm text-slate-400 italic">No operations yet. Use the buttons above to test commands.</p>
      </div>
    );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Operation Log</h2>
        <span className="text-xs text-slate-400">{entries.length} entries</span>
      </div>
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {entries.map((e) => (
          <div key={e.id} className="px-4 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span>{e.ok ? "✅" : e.message.includes("timeout") ? "⚠️" : "❌"}</span>
                <span className="text-sm font-medium text-slate-800 truncate">{e.label}</span>
                {e.mock && <Badge variant="mock">mock</Badge>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {e.duration && (
                  <span className="text-xs text-slate-400">{e.duration}ms</span>
                )}
                <span className="text-xs text-slate-400">{e.ts}</span>
                {e.content && (
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  >
                    {expanded === e.id ? "hide" : "cmd"}
                  </button>
                )}
              </div>
            </div>
            <p className={`mt-0.5 text-xs ${e.ok ? "text-green-700" : "text-red-600"}`}>
              {e.message}
            </p>
            {expanded === e.id && e.content && (
              <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-2 text-xs text-green-300 leading-relaxed">
                {e.content}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FiscalTestPage() {
  const [isPending, startTransition] = useTransition();
  const [log,       setLog]          = useState<LogEntry[]>([]);
  const [lastCmd,   setLastCmd]      = useState<{ content: string; label: string } | null>(null);
  const [showZ,     setShowZ]        = useState(false);
  const [zBusy,     setZBusy]        = useState(false);

  const addLog = useCallback((label: string, r: TestActionResult) => {
    const entry: LogEntry = {
      id:       ++_id,
      ts:       new Date().toLocaleTimeString("ro-RO"),
      label,
      ok:       r.ok,
      message:  r.message,
      content:  r.commandContent,
      filename: r.filename,
      duration: r.durationMs,
      mock:     r.mock,
    };
    if (r.commandContent) setLastCmd({ content: r.commandContent, label });
    setLog((prev) => [entry, ...prev].slice(0, 30));
    if (r.ok && r.filename && r.commandContent) {
      void downloadFiscalNetTxt(r.filename, r.commandContent).catch((e) => {
        console.error("[FiscalNet] test console download failed", e);
      });
    }
  }, []);

  const run = useCallback(
    (label: string, fn: () => Promise<TestActionResult>) => {
      startTransition(async () => {
        const r = await fn();
        addLog(label, r);
      });
    },
    [addLog],
  );

  const handleZConfirm = useCallback(() => {
    setZBusy(true);
    runTestZReport(true).then((r) => {
      addLog("Z Report", r);
      setZBusy(false);
      setShowZ(false);
    });
  }, [addLog]);

  const examples = Object.entries(RECEIPT_EXAMPLES);

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">FiscalNet Test Console</h1>
        <p className="mt-1 text-sm text-slate-500">
          Admin tool — test every fiscal command against your printer configuration.
          All operations are logged. Z report requires double confirmation.
        </p>
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600 font-medium">Status:</span>
        <Badge variant="mock">Mock mode (safe)</Badge>
        <span className="text-slate-300">·</span>
        <span className="text-xs text-slate-500">
          Real transactions will not be sent until Mock Mode is disabled in Settings → FiscalNet.
        </span>
        <span className="ml-auto">
          {isPending && <span className="text-xs text-blue-600 animate-pulse">Running…</span>}
        </span>
      </div>

      {/* Quick tests */}
      <Section title="Receipts">
        <Btn onClick={() => run("Cash Receipt",      () => runTestReceipt("cash"))}>💵 Cash Receipt</Btn>
        <Btn onClick={() => run("Card Receipt",      () => runTestReceipt("card"))}>💳 Card Receipt</Btn>
        <Btn onClick={() => run("With Discount",     () => runNamedExample("withDiscountPercent"))}>🏷️ 10% Discount</Btn>
        <Btn onClick={() => run("Multi-Item",        () => runNamedExample("multiItem"))}>🧾 Multi-Item</Btn>
        <Btn onClick={() => run("With Fiscal Code",  () => runNamedExample("withFiscalCode"))}>🏢 With CIF</Btn>
        <Btn onClick={() => run("Split Payment",     () => runNamedExample("splitPayment"))}>💰 Split Payment</Btn>
        <Btn onClick={() => run("Storno",            () => runNamedExample("storno"))}>↩️ Storno / Return</Btn>
        <Btn onClick={() => run("With Barcode",      () => runNamedExample("withBarcode"))}>📊 EAN13 Barcode</Btn>
        <Btn onClick={() => run("With QR Code",      () => runNamedExample("withQr"))}>📱 QR Code</Btn>
      </Section>

      <Section title="Utility">
        <Btn variant="outline" onClick={() => run("Non-Fiscal",       () => runTestNonFiscal())}>📄 Non-Fiscal</Btn>
        <Btn variant="outline" onClick={() => run("Customer Display", () => runTestCustomerDisplay())}>🖥️ Customer Display</Btn>
        <Btn variant="outline" onClick={() => run("Open Drawer",      () => runTestOpenDrawer())}>🗄️ Open Drawer</Btn>
        <Btn variant="outline" onClick={() => run("Cash In 100 RON",  () => runTestCashIn(100))}>⬆️ Cash In (100)</Btn>
        <Btn variant="outline" onClick={() => run("Cash Out 50 RON",  () => runTestCashOut(50))}>⬇️ Cash Out (50)</Btn>
        <Btn variant="outline" onClick={() => run("Cancel Receipt",   () => runTestCancelReceipt())}>❌ Cancel Receipt</Btn>
        <Btn variant="outline" onClick={() => run("Printer Status",   () => runTestStatus())}>🔍 Status Query</Btn>
        <Btn variant="outline" onClick={() => run("POS Terminal",     () => runNamedExample("posPayment"))}>💳 POS Terminal</Btn>
      </Section>

      <Section title="Reports">
        <Btn variant="outline" onClick={() => run("X Report", () => runTestXReport())}>
          📊 X Report <span className="text-slate-400 text-xs">(non-closing)</span>
        </Btn>
        <Btn danger onClick={() => setShowZ(true)}>
          ⚠️ Z Report <span className="text-xs opacity-80">(close fiscal day)</span>
        </Btn>
      </Section>

      {/* All examples */}
      <Section title="All Examples">
        {examples.map(([key, ex]) => (
          key === "zReport" ? null : (
            <Btn
              key={key}
              variant="ghost"
              onClick={() => run(ex.name, () => runNamedExample(key))}
            >
              {ex.name}
            </Btn>
          )
        ))}
      </Section>

      {/* Last command preview */}
      {lastCmd && (
        <PreviewPanel content={lastCmd.content} label={lastCmd.label} />
      )}

      {/* Operation log */}
      <LogPanel entries={log} />

      {/* Z report modal */}
      {showZ && (
        <ZReportModal
          onClose={() => setShowZ(false)}
          onConfirm={handleZConfirm}
          busy={zBusy}
        />
      )}
    </div>
  );
}
