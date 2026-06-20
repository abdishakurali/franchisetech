"use client";

/**
 * RomaniaReceiptSettingsCard
 * Clean: Enable/Mock/Platform/API host only.
 * VAT rates and payment methods come from existing product/payment settings.
 */

import { useState, useTransition } from "react";
import { saveFiscalNetSettings } from "@/app/actions/fiscalnet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  orgId: string;
  enabled: boolean;
  mockMode: boolean;
  connectionMode: "api" | "file";
  apiHost: string;
  bonuriPath: string | null;
  raspunsPath: string | null;
  autoPrint: boolean;
  askBeforePrint: boolean;
  manualOnly: boolean;
  timeoutMs: number;
  retryCount: number;
  cif: string | null;
  operatorCode: string;
  vatGroups: unknown;
  paymentTypeMap: unknown;
}

export function FiscalNetSettingsCard(props: Props) {
  const [enabled,   setEnabled]   = useState(props.enabled);
  const [platform,  setPlatform]  = useState<"api" | "file">(props.connectionMode === "file" ? "file" : "api");
  const [apiHost,   setApiHost]   = useState(props.apiHost || "http://localhost:65400");
  const [opCode,    setOpCode]    = useState(props.operatorCode || "1");

  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, startSave] = useTransition();

  function handleSave() {
    setStatus(null);
    startSave(async () => {
      const fd = new FormData();
      fd.set("fiscalnet_enabled",         String(enabled));
      fd.set("fiscalnet_mock_mode",       "false"); // simulation toggle removed — always real mode
      fd.set("fiscalnet_connection_mode", platform);
      fd.set("fiscalnet_api_host",        apiHost);
      fd.set("fiscalnet_operator_code",   opCode);
      const res = await saveFiscalNetSettings(fd);
      if (res?.error) setStatus({ ok: false, msg: res.error });
      else            setStatus({ ok: true,  msg: "Receipt settings saved." });
    });
  }

  return (
    <div className="space-y-4">

      {/* ── Enable ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-800">Romania receipts</h2>

        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label={enabled ? "Activat" : "Dezactivat"}
          color="blue"
        />

        {!enabled && (
          <p className="text-xs text-slate-500">
            Sales are still recorded in franchisetech. Fiscal receipts will not be sent to your till device.
          </p>
        )}
      </div>

      {enabled && (
        <>
          {/* ── Platform ───────────────────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">How receipts are sent</h3>
            <div className="grid gap-2">
              <PlatformCard
                active={platform === "api"}
                onClick={() => setPlatform("api")}
                icon="📱"
                title="Android"
                desc="Send to the Android till app on this device"
              />
            </div>

            {platform === "api" && (
              <div className="mt-1 space-y-2">
                <Label className="text-xs text-slate-600">Device address</Label>
                <Input
                  type="text"
                  value={apiHost}
                  onChange={e => setApiHost(e.target.value)}
                  placeholder="http://localhost:65400"
                  className=""
                />
              </div>
            )}

            {platform === "file" && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                For each sale, cash movement, or day close, franchisetech downloads a TXT receipt file. Save it to the Bonuri folder used by your fiscal receipt software.
              </p>
            )}
          </div>

          {/* ── Operator code ──────────────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Cashier code</h3>
            <Input
              type="text"
              value={opCode}
              onChange={e => setOpCode(e.target.value)}
              placeholder="1"
              className="w-32"
            />
            <p className="text-xs text-slate-500">The cashier/operator code used for receipts. Default is 1.</p>
          </div>
        </>
      )}

      {/* ── Save (always visible so disabling can be persisted) ── */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        {saving ? "Se salvează…" : enabled ? "Save receipt settings" : "Save — receipts disabled"}
      </Button>
      {status && (
        <div className={`rounded-lg px-3 py-2 text-sm font-medium border ${status.ok ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
          {status.ok ? "✅" : "❌"} {status.msg}
        </div>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, color }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; color: "blue" | "amber";
}) {
  const bg = checked ? (color === "amber" ? "bg-amber-400" : "bg-blue-600") : "bg-slate-300";
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors ${bg}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

function PlatformCard({ active, onClick, icon, title, desc }: {
  active: boolean; onClick: () => void; icon: string; title: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-left transition-colors ${
        active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <p className={`text-sm font-semibold ${active ? "text-blue-700" : "text-slate-800"}`}>{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </button>
  );
}
