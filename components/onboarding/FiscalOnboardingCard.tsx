"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Headset, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { saveFiscalNetSettings } from "@/app/actions/fiscalnet";
import { requestFiscalSetupHelp } from "@/app/actions/fiscal-setup-help";
import { advanceFromFiscal } from "@/app/actions/onboarding-steps";
import { FISCALNET_SUPPORTED_DEVICES } from "@/lib/fiscalnet/supported-devices";
import { probeFiscalNet } from "@/lib/fiscalnet/probe";
import { captureClientEvent } from "@/lib/analytics/client-events";

// "reachable" only means FiscalNet answered on this computer — never that the
// register printed. The first Live sale is the real confirmation.
type ConnectionStatus = "idle" | "testing" | "reachable" | "unreachable";

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
  const [helpPhone, setHelpPhone] = useState("");
  const [helpSent, setHelpSent] = useState(false);
  const [requestingHelp, startHelp] = useTransition();

  function handleTest() {
    setStatus("testing");
    startTest(async () => {
      const result = await probeFiscalNet(apiHost);
      setStatus(result.reachable ? "reachable" : "unreachable");
      setStatusMsg(result.message);
      captureClientEvent("fiscal_connection_probed", { reachable: result.reachable, device_brand: deviceBrand || null });
    });
  }

  function handleHelpRequest() {
    startHelp(async () => {
      const result = await requestFiscalSetupHelp({
        phone: helpPhone,
        deviceBrand: deviceBrand || null,
        lastProbeMessage: status === "unreachable" ? statusMsg : null,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setHelpSent(true);
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
    status === "reachable"
      ? "● FiscalNet răspunde"
      : status === "testing"
        ? "● Se verifică…"
        : status === "unreachable"
          ? "● FiscalNet nu răspunde"
          : "● Neverificat";
  const statusColor =
    status === "reachable" ? "text-reconciled" : status === "testing" ? "text-brass" : "text-mid";

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Conectează casa fiscală</p>
          <p className="text-xs text-mid">
            FiscalNet conectează franchisetech la casa de marcat. Este un program separat, de la un furnizor terț, cu licență proprie.
          </p>
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
                    {testing ? "Se verifică…" : "Verifică FiscalNet"}
                  </Button>
                  <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                </div>
                {statusMsg && <p className="text-xs text-mid">{statusMsg}</p>}
              </>
            )}
          </div>
        </>
      )}

      <div
        className={`rounded-md border p-4 space-y-3 ${status === "unreachable" ? "border-brass bg-accent" : "border-border bg-card"}`}
      >
        <div className="flex items-start gap-3">
          <Headset className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
          <div>
            <p className="text-sm font-medium text-foreground">Vă conectăm noi casa de marcat</p>
            <p className="text-xs text-mid">
              Lăsați un număr de telefon și vă sunăm să configurăm împreună FiscalNet, de la distanță. Vă spunem la telefon ce
              trebuie pentru modelul dumneavoastră. Între timp puteți continua în mod test.
            </p>
          </div>
        </div>
        {helpSent ? (
          <p className="text-sm font-medium text-reconciled">
            Am primit cererea. Vă sunăm la numărul indicat. Puteți continua în mod test până atunci.
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={helpPhone}
              onChange={(e) => setHelpPhone(e.target.value)}
              placeholder="ex: 0722 123 456"
              aria-label="Număr de telefon"
            />
            <Button type="button" variant="outline" onClick={handleHelpRequest} disabled={requestingHelp || !helpPhone.trim()}>
              {requestingHelp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sunați-mă"}
            </Button>
          </div>
        )}
      </div>

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
