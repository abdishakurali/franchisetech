"use client";

/**
 * RomaniaReceiptSettingsCard
 * Clean: Enable/Mock/Platform/API host only.
 * VAT rates and payment methods come from existing product/payment settings.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFiscalNetSettings } from "@/app/actions/fiscalnet";
import { writeFiscalNetEnabledPreference } from "@/lib/fiscalnet/client-preference";
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
  const router = useRouter();
  const [enabled,   setEnabled]   = useState(props.enabled);
  const [mockMode,  setMockMode]  = useState(props.mockMode);
  const [platform,  setPlatform]  = useState<"api" | "file">(props.connectionMode === "file" ? "file" : "api");
  const [apiHost,   setApiHost]   = useState(props.apiHost || "http://localhost:65400");
  const [opCode,    setOpCode]    = useState(props.operatorCode || "1");

  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [testing, startTest] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleSave() {
    setStatus(null);
    startSave(async () => {
      const fd = new FormData();
      fd.set("fiscalnet_enabled",         String(enabled));
      fd.set("fiscalnet_mock_mode",       String(mockMode));
      fd.set("fiscalnet_connection_mode", platform);
      fd.set("fiscalnet_api_host",        apiHost);
      fd.set("fiscalnet_operator_code",   opCode);
      const res = await saveFiscalNetSettings(fd);
      // saveFiscalNetSettings forwards the bare EntitlementDeniedError code,
      // not a message — showing it verbatim left the owner staring at
      // "entitlement_denied" with no idea their plan was the cause.
      if (res?.error) setStatus({ ok: false, msg: res.error === "entitlement_denied" ? "This action isn't available on your current plan. Upgrade to continue." : res.error });
      else {
        writeFiscalNetEnabledPreference(enabled);
        setStatus({ ok: true,  msg: "Receipt settings saved." });
        router.refresh();
      }
    });
  }

  function handleTestConnection() {
    setTestResult(null);
    startTest(async () => {
      const { testFiscalNetConnection } = await import("@/app/actions/fiscalnet");
      const result = await testFiscalNetConnection();
      setTestResult({ ok: result.ok, msg: result.message });
    });
  }

  return (
    <div className="space-y-4">

      {/* ── Enable ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Romania receipts</h2>

        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label={enabled ? "Activat" : "Dezactivat"}
          color="blue"
        />

        {!enabled && (
          <p className="text-xs text-muted-foreground">
            Sales are still recorded in franchisetech. Fiscal receipts will not be sent to your till device.
          </p>
        )}

        {enabled && (
          <div className="border-t border-border pt-4">
            <Toggle
              checked={!mockMode}
              onChange={(v) => setMockMode(!v)}
              label={mockMode ? "Mod test (nu se trimit bonuri reale)" : "Mod live (bonuri fiscale reale)"}
              color={mockMode ? "amber" : "blue"}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {mockMode
                ? "Poți exersa vânzări fără să conectezi o casă fiscală reală."
                : "Bonurile fiscale se trimit către casa configurată mai jos."}
            </p>
          </div>
        )}
      </div>

      {enabled && (
        <>
          {/* ── Platform ───────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">How receipts are sent</h3>
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
                <Label className="text-xs text-mid">Device address</Label>
                <Input
                  type="text"
                  value={apiHost}
                  onChange={e => setApiHost(e.target.value)}
                  placeholder="http://localhost:65400"
                  className=""
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={handleTestConnection} disabled={testing}>
                    {testing ? "Se testează…" : "Testează conexiunea"}
                  </Button>
                  {testResult && (
                    <span className={`text-xs font-medium ${testResult.ok ? "text-reconciled" : "text-attention"}`}>
                      {testResult.ok ? "✅" : "❌"} {testResult.msg}
                    </span>
                  )}
                </div>
              </div>
            )}

            {platform === "file" && (
              <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                For each sale, cash movement, or day close, franchisetech downloads a TXT receipt file. Save it to the Bonuri folder used by your fiscal receipt software.
              </p>
            )}
          </div>

          {/* ── Operator code ──────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Cashier code</h3>
            <Input
              type="text"
              value={opCode}
              onChange={e => setOpCode(e.target.value)}
              placeholder="1"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">The cashier/operator code used for receipts. Default is 1.</p>
          </div>
        </>
      )}

      {/* ── Save (always visible so disabling can be persisted) ── */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saving ? "Se salvează…" : enabled ? "Save receipt settings" : "Save — receipts disabled"}
      </Button>
      {status && (
        <div className={`rounded-lg px-3 py-2 text-sm font-medium border ${status.ok ? "bg-reconciled/10 text-reconciled border-reconciled/25" : "bg-attention/10 text-attention border-attention/25"}`}>
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
  const bg = checked ? (color === "amber" ? "bg-amber-400" : "bg-brass") : "bg-secondary";
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors ${bg}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
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
        active ? "border-brass bg-accent" : "border-border bg-card hover:border-border"
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <p className={`text-sm font-semibold ${active ? "text-brass" : "text-foreground"}`}>{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </button>
  );
}
