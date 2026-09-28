"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { saveFiscalNetSettings, testFiscalNetConnection } from "@/app/actions/fiscalnet";
import { advanceFromFiscal } from "@/app/actions/onboarding-steps";
import { FISCALNET_SUPPORTED_DEVICES } from "@/lib/fiscalnet/supported-devices";

type ConnectionStatus = "idle" | "testing" | "connected" | "failed";

export function FiscalOnboardingCard({
  initial,
}: {
  initial: { enabled: boolean; mockMode: boolean; apiHost: string; operatorCode: string };
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [mockMode, setMockMode] = useState(initial.mockMode);
  const [apiHost, setApiHost] = useState(initial.apiHost || "http://localhost:65400");
  const [operatorCode] = useState(initial.operatorCode || "1");
  const [deviceBrand, setDeviceBrand] = useState<string>("");
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [testing, startTest] = useTransition();
  const [continuing, startContinuing] = useTransition();

  function handleTest() {
    setStatus("testing");
    startTest(async () => {
      const result = await testFiscalNetConnection();
      setStatus(result.ok ? "connected" : "failed");
      setStatusMsg(result.message);
    });
  }

  function handleContinue() {
    startContinuing(async () => {
      const fd = new FormData();
      fd.set("fiscalnet_enabled", String(enabled));
      fd.set("fiscalnet_mock_mode", String(mockMode));
      fd.set("fiscalnet_connection_mode", "api");
      fd.set("fiscalnet_api_host", apiHost);
      fd.set("fiscalnet_operator_code", operatorCode);
      const saveResult = await saveFiscalNetSettings(fd);
      if (saveResult?.error) {
        // saveFiscalNetSettings forwards the bare EntitlementDeniedError
        // code, not a message, if this ever fires mid-onboarding.
        toast.error(saveResult.error === "entitlement_denied" ? "Acțiune indisponibilă pentru planul curent." : saveResult.error);
        return;
      }
      const result = await advanceFromFiscal();
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleSkip() {
    startContinuing(async () => {
      const result = await advanceFromFiscal();
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      }
    });
  }

  const statusLabel =
    status === "connected" ? "● Conectat" : status === "testing" ? "● Se conectează…" : status === "failed" ? "● Neconectat" : "● Neconectat";
  const statusColor =
    status === "connected" ? "text-reconciled" : status === "testing" ? "text-brass" : "text-mid";

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Conectează casa fiscală</p>
          <p className="text-xs text-mid">FiscalNet conectează franchisetech la casa de marcat.</p>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-9 shrink-0 appearance-none rounded-full bg-secondary transition-colors checked:bg-brass relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-card before:transition-transform checked:before:translate-x-4"
        />
      </label>

      {enabled && (
        <>
          <div className="rounded-md border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Mod</Label>
              <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
                <button
                  type="button"
                  onClick={() => setMockMode(true)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${mockMode ? "bg-card text-foreground shadow-sm" : "text-mid"}`}
                >
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => setMockMode(false)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${!mockMode ? "bg-card text-foreground shadow-sm" : "text-mid"}`}
                >
                  Live
                </button>
              </div>
            </div>
            <p className="text-xs text-mid">
              {mockMode
                ? "Poți exersa o vânzare fără casă fiscală conectată — nu se trimit bonuri reale."
                : "Bonurile fiscale se trimit la casa conectată mai jos."}
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4 space-y-3">
            <Label className="text-sm font-medium text-foreground">Model casă fiscală</Label>
            <select
              value={deviceBrand}
              onChange={(e) => setDeviceBrand(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Selectează producătorul…</option>
              {FISCALNET_SUPPORTED_DEVICES.map((d) => (
                <option key={d.brand} value={d.brand}>
                  {d.brand} — {d.models}
                </option>
              ))}
            </select>
            {!mockMode && (
              <>
                <Label className="text-sm font-medium text-foreground">Adresă dispozitiv</Label>
                <Input value={apiHost} onChange={(e) => setApiHost(e.target.value)} placeholder="http://localhost:65400" />
                <div className="flex items-center gap-3 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={handleTest} disabled={testing}>
                    {testing ? "Se testează…" : "Testează conexiunea"}
                  </Button>
                  <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                </div>
                {statusMsg && <p className="text-xs text-mid">{statusMsg}</p>}
              </>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row-reverse">
        <Button
          className="h-11 flex-1 bg-primary text-base text-primary-foreground hover:bg-primary/90"
          disabled={continuing}
          onClick={handleContinue}
        >
          {continuing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continuă {mockMode || !enabled ? "în mod test" : ""} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        {!enabled && (
          <Button type="button" variant="ghost" className="h-11" disabled={continuing} onClick={handleSkip}>
            Configurez mai târziu
          </Button>
        )}
      </div>
    </div>
  );
}
