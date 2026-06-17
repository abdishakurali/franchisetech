"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCashDrawerSettings } from "@/app/actions/kitchenops";
import { openCashDrawer, type CashDrawerMode, type CashDrawerSettings } from "@/lib/cash-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// ── fetchWithTimeout — AbortSignal.timeout() polyfill for old Android WebView ─
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).then(
    (res) => { clearTimeout(id); return res; },
    (err) => { clearTimeout(id); throw err; }
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type SetupStep = "install" | "pair" | "simulate" | "diagnose" | "live_test" | "confirm" | "done";
type StepState = "idle" | "running" | "passed" | "warning" | "failed";
interface DiagCheck { name: string; result: string; message: string; suggestion?: string; }

// ── Component ─────────────────────────────────────────────────────────────────

// ── Sub-components (must be outside main component) ────────────────────────
// ── Status pill helper ────────────────────────────────────────────────────
function Pill({ label, value, ok }: { label: string; value: string; ok?: boolean | null }) {
  const color = ok === true ? "#dcfce7" : ok === false ? "#fee2e2" : "#f1f5f9";
  const textColor = ok === true ? "#166534" : ok === false ? "#991b1b" : "#475569";
  return (
    <div style={{ background: color, borderRadius: 8, padding: "8px 12px", minWidth: 80, flex: 1 }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: textColor, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

// ── Collapsible section ────────────────────────────────────────────────────
function Section({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginTop: 4 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1d4ed8", padding: 0 }}
      >
        <span style={{ fontSize: 11, display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>▶</span>
        {title}
      </button>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}

export function CashDrawerSettingsCard({
  settings,
}: {
  settings: CashDrawerSettings & { lastStatus?: string | null };
}) {
  const router = useRouter();

  // ── Core state ────────────────────────────────────────────────────────────
  const [mode, setMode]   = useState<CashDrawerMode>((settings.mode as CashDrawerMode) ?? "manual");
  const [port, setPort]   = useState(String(settings.port ?? 17878));
  const [token, setToken] = useState(settings.token ?? "");
  const [triggerCashSale, setTriggerCashSale] = useState(settings.triggerOnCashSale !== false);
  const [triggerCashIn,   setTriggerCashIn]   = useState(settings.triggerOnCashIn   !== false);
  const [triggerCashOut,  setTriggerCashOut]  = useState(settings.triggerOnCashOut  !== false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, setPending]     = useState(false);
  const [msgText, setMsgText]     = useState<string | null>(null);
  const [msgType, setMsgType]     = useState<"info" | "error" | "success">("info");
  const [testSent, setTestSent]   = useState(false);

  // ── Connector status ──────────────────────────────────────────────────────
  const [connectorStatus,  setConnectorStatus]  = useState("Not checked");
  const [connectorVersion, setConnectorVersion] = useState("-");
  const [connectorIsLegacy, setConnectorIsLegacy] = useState(false);
  const [hardwareStatus,   setHardwareStatus]   = useState("Not verified");
  const [lastCommand,      setLastCommand]       = useState("-");
  const [hwConfirmed,      setHwConfirmed]       = useState<boolean | null>(null);

  // ── Sunmi test results ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sunmiTestResult, setSunmiTestResult] = useState<Record<string, any> | null>(null);
  const [sunmiTestMode,   setSunmiTestMode]   = useState<string | null>(null);
  const [sunmiTesting,    setSunmiTesting]    = useState(false);

  // ── Setup wizard (advanced) ───────────────────────────────────────────────
  const [step,      setStep]      = useState<SetupStep>("install");
  const [stepState, setStepState] = useState<StepState>("idle");
  const [diagChecks, setDiagChecks] = useState<DiagCheck[]>([]);
  const [diagOverall, setDiagOverall] = useState<string>("idle");

  // ── Collapsibles ──────────────────────────────────────────────────────────
  const [showTrouble,      setShowTrouble]      = useState(false);
  const [showAdvanced,     setShowAdvanced]      = useState(false);
  const [showDiagnostics,  setShowDiagnostics]   = useState(false);
  const [showChecklist,    setShowChecklist]      = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const portNum   = Number(port) || 17878;
  const baseUrl   = `http://127.0.0.1:${portNum}`;
  const healthUrl = `${baseUrl}/health`;
  const activeToken = token || settings.token || "";
  const currentSettings: CashDrawerSettings = { ...settings, mode, port, token: activeToken };
  const isConnectorMode = mode === "android_connector" || mode === "local_connector";

  // ── Helpers ───────────────────────────────────────────────────────────────
  function showMsg(text: string, type: "info" | "error" | "success" = "info") {
    setMsgText(text); setMsgType(type);
  }

  // ── Save settings ─────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true); setSaveMsg(null);
    const form = new FormData();
    form.set("cash_drawer_mode", mode);
    form.set("cash_drawer_connector_port", String(portNum));
    form.set("cash_drawer_connector_token", token);
    form.set("existing_token", settings.token ?? "");
    if (triggerCashSale) form.set("cash_drawer_trigger_on_cash_sale", "on");
    if (triggerCashIn)   form.set("cash_drawer_trigger_on_cash_in",   "on");
    if (triggerCashOut)  form.set("cash_drawer_trigger_on_cash_out",  "on");
    try {
      await updateCashDrawerSettings(form);
      setSaveMsg({ text: "Saved", ok: true });
      router.refresh();
    } catch {
      setSaveMsg({ text: "Save failed — check console", ok: false });
    }
    setSaving(false);
  }

  async function saveToken(nextToken: string) {
    const form = new FormData();
    form.set("cash_drawer_mode", mode);
    form.set("cash_drawer_connector_port", String(portNum));
    form.set("cash_drawer_connector_token", nextToken);
    form.set("existing_token", settings.token ?? "");
    if (triggerCashSale) form.set("cash_drawer_trigger_on_cash_sale", "on");
    if (triggerCashIn)   form.set("cash_drawer_trigger_on_cash_in",   "on");
    if (triggerCashOut)  form.set("cash_drawer_trigger_on_cash_out",  "on");
    await updateCashDrawerSettings(form);
  }

  // ── Quick check ───────────────────────────────────────────────────────────
  async function quickCheck() {
    setPending(true);
    setConnectorStatus("Checking…");
    showMsg("Checking connector…");
    try {
      const res = await fetchWithTimeout(healthUrl, {}, 3000);
      const body = await res.json().catch(() => ({}));
      const v = body.version ?? body.connectorVersion ?? "-";
      setConnectorVersion(v);
      const legacy = v !== "-" && (
        v.startsWith("0.1") || v.startsWith("0.2") || v.startsWith("0.3") || v.startsWith("0.4") ||
        v === "0.5.0" || v === "0.5.1" || v === "0.5.2" || v === "0.5.3" || v === "0.5.4" || v === "0.5.5" || v === "0.5.6" || v === "0.5.7"
      );
      setConnectorIsLegacy(legacy);
      setConnectorStatus("Connected");
      if (legacy) {
        showMsg(`Old connector v${v} detected. Install v0.5.8 to test SUNMI print + drawer.`, "error");
      } else {
        showMsg(`Connector v${v} running. Latest detected.`, "success");
      }
    } catch (e) {
      setConnectorStatus("Not running");
      const isTimeout = e instanceof DOMException && e.name === "AbortError";
      showMsg(
        isTimeout
          ? "Connector did not respond. Open the franchisetech Connector app on this device."
          : "Connector not running. Open the franchisetech Connector app on this device.",
        "error"
      );
    }
    setPending(false);
  }

  // ── Quick test ────────────────────────────────────────────────────────────
  async function quickTest() {
    setPending(true); setTestSent(false); setHwConfirmed(null);
    showMsg("Sending test command…");
    try {
      const res = await fetchWithTimeout(`${baseUrl}/test-drawer`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "origin": window.location.origin,
          ...(activeToken ? { "x-connector-token": activeToken } : {}),
        },
        body: "{}",
      }, 4000);
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setTestSent(true);
        setLastCommand(new Date().toLocaleTimeString());
        showMsg("Command sent. Did the drawer open?", "info");
      } else {
        showMsg("Command failed: " + (typeof body.message === "string" ? body.message : `HTTP ${res.status}`), "error");
      }
    } catch {
      showMsg("Connector not responding. Check the connector app is open on this device.", "error");
    }
    setPending(false);
  }

  // ── Hardware confirm (quick) ──────────────────────────────────────────────
  async function confirmOpened(opened: boolean) {
    setHwConfirmed(opened);
    if (opened) {
      try {
        await fetch("/api/cash-drawer/hardware-verifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verification_source: "settings_quick_confirm", connector_version: connectorVersion }),
        });
      } catch { /* non-fatal */ }
      setHardwareStatus("Verified");
      showMsg("Drawer confirmed open. Hardware verified.", "success");
    } else {
      setHardwareStatus("Not verified");
      showMsg("Drawer did not open. Check cable, printer power, and RJ12 port.", "error");
    }
  }

  // ── SUNMI diagnostic test ─────────────────────────────────────────────────
  async function runSunmiTest(test: string) {
    if (!baseUrl) return;
    setSunmiTesting(true);
    setSunmiTestMode(test);
    setSunmiTestResult(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["x-connector-token"] = token;
      const res = await fetchWithTimeout(`${baseUrl}/sunmi-test`, {
        method: "POST",
        headers,
        body: JSON.stringify({ test }),
      }, 15000);
      const data = await res.json().catch(() => ({}));
      setSunmiTestResult(data);
    } catch (e) {
      setSunmiTestResult({ ok: false, message: (e as Error)?.message ?? "Request failed" });
    } finally {
      setSunmiTesting(false);
    }
  }

  // ── Advanced wizard steps ─────────────────────────────────────────────────
  async function checkInstall() {
    setPending(true); setStepState("running");
    showMsg(`Checking connector at ${healthUrl}…`);
    try {
      const res = await fetchWithTimeout(healthUrl, {}, 2000);
      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        setConnectorVersion(body.connectorVersion ?? body.version ?? "-");
        const v = body.version ?? body.connectorVersion ?? "";
        const legacy = body.name !== "franchisetech-connector" ||
          !v || v.startsWith("0.1") || v.startsWith("0.2") || v.startsWith("0.3") || v.startsWith("0.4") ||
          v === "0.5.0" || v === "0.5.1" || v === "0.5.2" || v === "0.5.3" || v === "0.5.4" || v === "0.5.5" || v === "0.5.6" || v === "0.5.7";
        setConnectorIsLegacy(legacy);
        setConnectorStatus("Connected");
        if (legacy) {
          setStepState("warning");
          showMsg(`Old connector v${v} — download v0.5.8 first.`, "error");
        } else {
          setStepState("passed");
          showMsg(`Connector v${v} running. Proceed to pair.`, "success");
          setStep("pair");
        }
      } else {
        setStepState("failed");
        showMsg(`Connector returned ${res.status}. Check the app is running.`, "error");
      }
    } catch {
      setStepState("failed");
      setConnectorStatus("Not running");
      showMsg("Connector not running. Open the franchisetech Connector app on this device.", "error");
    }
    setPending(false);
  }

  async function connectDevice() {
    setPending(true); setStepState("running");
    showMsg("Sending pair request…");
    try {
      const started = await fetchWithTimeout(`${baseUrl}/pair/start`, {
        method: "POST",
        headers: { "content-type": "application/json", "origin": window.location.origin },
        body: JSON.stringify({ source: "franchisetech-web", origin: window.location.origin }),
      }, 2500);
      if (!started.ok) { throw new Error(`HTTP ${started.status}`); }
      const startBody = await started.json();
      const pairingToken: string = startBody.token ?? "";
      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const res = await fetchWithTimeout(`${baseUrl}/pair/status`, {
          headers: { "origin": window.location.origin },
        }, 2500);
        if (res.ok) {
          const paired = await res.json();
          if (paired.status === "approved") {
            setToken(pairingToken);
            await saveToken(pairingToken);
            setConnectorStatus("Paired");
            setStepState("passed");
            showMsg("Paired. Proceed to simulate.", "success");
            setStep("simulate");
            setPending(false);
            return;
          }
        }
      }
      setStepState("failed");
      showMsg("Pairing timed out. Try again.", "error");
    } catch (e) {
      setStepState("failed");
      showMsg("Pairing failed: " + ((e as Error)?.message ?? "Unknown"), "error");
    }
    setPending(false);
  }

  async function runSimulation() {
    setPending(true); setStepState("running");
    showMsg("Running simulation…");
    try {
      const res = await fetchWithTimeout(`${baseUrl}/simulate`, {
        method: "POST",
        headers: { "content-type": "application/json", "origin": window.location.origin,
          ...(activeToken ? { "x-connector-token": activeToken } : {}) },
        body: "{}",
      }, 3000);
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.result === "simulation_success") {
        setStepState("passed");
        showMsg(`Simulation passed in ${body.durationMs ?? "?"}ms.`, "success");
        setStep("diagnose");
      } else {
        setStepState("failed");
        showMsg(typeof body.message === "string" ? body.message : "Simulation failed.", "error");
      }
    } catch {
      setStepState("failed");
      showMsg("Simulation failed — connector did not respond.", "error");
    }
    setPending(false);
  }

  async function runDiagnostics() {
    setPending(true); setStepState("running"); setDiagChecks([]);
    showMsg("Running diagnostics…");
    try {
      const res = await fetchWithTimeout(`${baseUrl}/diagnostics/run`, {
        method: "POST",
        headers: { "content-type": "application/json", "origin": window.location.origin,
          ...(activeToken ? { "x-connector-token": activeToken } : {}) },
        body: "{}",
      }, 10000);
      const body = await res.json().catch(() => ({}));
      const checks: DiagCheck[] = Array.isArray(body.checks) ? body.checks : [];
      setDiagChecks(checks);
      setDiagOverall(body.overall ?? "failed");
      if (body.overall === "passed") {
        setStepState("passed");
        showMsg("All diagnostics passed.", "success");
        setStep("live_test");
      } else {
        setStepState("warning");
        showMsg("Diagnostics completed with warnings. Review below.", "error");
      }
    } catch {
      setStepState("failed");
      showMsg("Diagnostics failed — connector did not respond.", "error");
    }
    setPending(false);
  }

  async function runLiveTest() {
    setPending(true); setStepState("running");
    showMsg("Sending live open-drawer command…");
    const result = await openCashDrawer("test", currentSettings);
    setLastCommand(result.ok ? "Command sent" : "Failed");
    if (result.connectorVersion) setConnectorVersion(result.connectorVersion);
    if (result.ok) {
      setStepState("passed");
      showMsg("Command sent — not yet confirmed. Did the cash drawer open?", "info");
      setStep("confirm");
    } else {
      setStepState("failed");
      showMsg(result.cashierMessage, "error");
    }
    setPending(false);
  }

  async function confirmHardware(opened: boolean) {
    setHwConfirmed(opened); setPending(true);
    if (opened) {
      try {
        await fetch("/api/cash-drawer/hardware-verifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verification_source: "web_setup_wizard", connector_version: connectorVersion }),
        });
      } catch { /* non-fatal */ }
      setHardwareStatus("Verified");
      setStepState("passed");
      setStep("done");
      showMsg("Hardware verified. Drawer will open after cash actions.", "success");
    } else {
      setStepState("warning");
      showMsg("Drawer did not open. Check cable, printer power, and RJ12 port.", "error");
    }
    setPending(false);
  }



  // ── Advanced diagnostics step chip ────────────────────────────────────────
  const STEPS: SetupStep[] = ["install", "pair", "simulate", "diagnose", "live_test", "confirm"];
  const STEP_LABELS: Record<SetupStep, string> = {
    install: "1. Install", pair: "2. Pair", simulate: "3. Simulate",
    diagnose: "4. Diagnose", live_test: "5. Live test", confirm: "6. Confirm", done: "Done",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash drawer</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Mode + Save row ─────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Label>Mode</Label>
              <select
                value={mode}
                onChange={(e) => { setMode(e.target.value as CashDrawerMode); setSaveMsg(null); }}
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="off">Off</option>
                <option value="manual">Manual (staff opens drawer)</option>
                <option value="android_connector">Android connector</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 0 }}>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{ height: 40, paddingLeft: 20, paddingRight: 20 }}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              {saveMsg && (
                <span style={{ fontSize: 13, color: saveMsg.ok ? "#166534" : "#991b1b", fontWeight: 500 }}>
                  {saveMsg.text}
                </span>
              )}
            </div>
          </div>

          {/* ── Mode description ─────────────────────────────────────────── */}
          {mode === "off" && (
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              franchisetech will not prompt or send drawer commands.
            </p>
          )}
          {mode === "manual" && (
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Staff are reminded to open the drawer manually after cash actions.
            </p>
          )}
          {isConnectorMode && (
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              franchisetech sends an open command to the Android Connector app. If unavailable, staff are told to open manually.
            </p>
          )}

          {/* ── Status pills ─────────────────────────────────────────────── */}
          {isConnectorMode && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill label="Connector" value={connectorStatus}
                ok={connectorStatus === "Connected" || connectorStatus === "Paired" ? true : connectorStatus === "Not running" ? false : null} />
              <Pill label="Version"
                value={connectorVersion === "-" ? "-" : connectorIsLegacy ? `${connectorVersion} (old)` : connectorVersion}
                ok={connectorVersion === "-" ? null : connectorIsLegacy ? false : true} />
              <Pill label="Hardware" value={hardwareStatus}
                ok={hardwareStatus === "Verified" ? true : hardwareStatus === "Not verified" ? false : null} />
              <Pill label="Last command" value={lastCommand} ok={null} />
            </div>
          )}

          {/* ── Version warning ──────────────────────────────────────────── */}
          {isConnectorMode && connectorIsLegacy && connectorVersion !== "-" && (
            <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#92400e" }}>
              Old connector v{connectorVersion} detected. Install v0.5.8 to test SUNMI print + drawer.
            </div>
          )}
          {isConnectorMode && !connectorIsLegacy && connectorVersion !== "-" && (
            <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534" }}>
              Latest connector detected (v{connectorVersion}).
            </div>
          )}

          {/* ── Message banner ────────────────────────────────────────────── */}
          {msgText && (
            <div style={{
              background: msgType === "success" ? "#f0fdf4" : msgType === "error" ? "#fef2f2" : "#f8fafc",
              border: `1px solid ${msgType === "success" ? "#86efac" : msgType === "error" ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 8, padding: "10px 14px", fontSize: 13,
              color: msgType === "success" ? "#166534" : msgType === "error" ? "#991b1b" : "#475569",
            }}>
              {msgText}
            </div>
          )}

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          {isConnectorMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Download */}
              <a
                href="/downloads/franchisetech-connector-android-0.5.8.apk"
                download
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: 44, paddingLeft: 20, paddingRight: 20, borderRadius: 8,
                  background: "#1d4ed8", color: "#fff", fontSize: 14, fontWeight: 600,
                  textDecoration: "none", textAlign: "center",
                }}
              >
                Download Android Connector v0.5.8
              </a>

              {/* Check + Test buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button type="button" variant="outline" disabled={pending}
                  onClick={quickCheck}
                  style={{ height: 44, paddingLeft: 16, paddingRight: 16 }}>
                  {pending && connectorStatus === "Checking…" ? "Checking…" : "Check connector"}
                </Button>
                <Button type="button" variant="outline" disabled={pending}
                  onClick={quickTest}
                  style={{ height: 44, paddingLeft: 16, paddingRight: 16 }}>
                  Send test command
                </Button>
                {mode === "android_connector" && (
                  <>
                    {connectorIsLegacy ? (
                      <div style={{ fontSize: 12, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "6px 10px", alignSelf: "center" }}>
                        Install Android Connector v0.5.8 to test SUNMI print + drawer.
                      </div>
                    ) : (
                      <>
                        <Button type="button" variant="outline" disabled={pending || sunmiTesting}
                          onClick={() => runSunmiTest("print")}
                          style={{ height: 44, paddingLeft: 16, paddingRight: 16 }}>
                          {sunmiTesting && sunmiTestMode === "print" ? "Testing…" : "Test print"}
                        </Button>
                        <Button type="button" variant="outline" disabled={pending || sunmiTesting}
                          onClick={() => runSunmiTest("drawer")}
                          style={{ height: 44, paddingLeft: 16, paddingRight: 16 }}>
                          {sunmiTesting && sunmiTestMode === "drawer" ? "Testing…" : "Test drawer"}
                        </Button>
                        <Button type="button" variant="outline" disabled={pending || sunmiTesting}
                          onClick={() => runSunmiTest("full")}
                          style={{ height: 44, paddingLeft: 16, paddingRight: 16 }}>
                          {sunmiTesting && sunmiTestMode === "full" ? "Testing…" : "Full diagnostic"}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* SUNMI test result summary */}
              {sunmiTestResult && !sunmiTesting && (
                <div style={{ background: sunmiTestResult.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${sunmiTestResult.ok ? "#86efac" : "#fca5a5"}`, borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: sunmiTestResult.ok ? "#166534" : "#991b1b", margin: "0 0 6px 0" }}>
                    {sunmiTestResult.ok ? "Test completed" : "Test failed"} — {sunmiTestResult.message ?? ""}
                  </p>
                  {Array.isArray(sunmiTestResult.attempts) && sunmiTestResult.attempts.length > 0 && (() => {
                    const attempts = sunmiTestResult.attempts as Array<{ [k: string]: string | number | boolean | null | undefined }>;
                    const printed = attempts.some((a) => a.printed === true);
                    const drawerOpened = attempts.some((a) =>
                      typeof a.openDrawerTimesAfter === "number" &&
                      typeof a.openDrawerTimesBefore === "number" &&
                      a.openDrawerTimesAfter > a.openDrawerTimesBefore
                    );
                    return (
                      <div style={{ fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div>{printed ? "✓ Print worked" : "✗ Did not print"}</div>
                        <div>{drawerOpened ? "✓ Drawer opened" : "✗ Drawer did not open — command sent, but drawer was not confirmed open."}</div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Confirm after test */}
              {testSent && hwConfirmed === null && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", margin: "0 0 10px 0" }}>
                    Did the drawer open?
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="button" disabled={pending}
                      onClick={() => confirmOpened(true)}
                      style={{ height: 40, paddingLeft: 20, paddingRight: 20, background: "#16a34a", color: "#fff" }}>
                      Yes, drawer opened
                    </Button>
                    <Button type="button" variant="outline" disabled={pending}
                      onClick={() => confirmOpened(false)}
                      style={{ height: 40, paddingLeft: 16, paddingRight: 16 }}>
                      No, did not open
                    </Button>
                  </div>
                </div>
              )}
              {hwConfirmed === true && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534" }}>
                  ✓ Drawer confirmed open. Hardware verified.
                </div>
              )}
              {hwConfirmed === false && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>
                  Drawer did not open. Check cable, printer power, and RJ12 port (see Hardware checklist below).
                </div>
              )}
            </div>
          )}

          {/* ── Short setup guide ─────────────────────────────────────────── */}
          {isConnectorMode && (
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", margin: "0 0 8px 0", letterSpacing: 1 }}>
                Quick setup
              </p>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                <li>Install the connector APK on the Android till.</li>
                <li>Open the franchisetech Connector app.</li>
                <li>Open these settings <em>from the same Android till browser</em>.</li>
                <li>Tap <strong>Check connector</strong>.</li>
                <li>Tap <strong>Send test command</strong> and confirm the drawer opened.</li>
              </ol>
              {mode === "android_connector" && (
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
                  SUNMI tills: the drawer opens through the built-in printer service and RJ12 drawer port.
                </p>
              )}
            </div>
          )}

          {/* ── Install troubleshooting (collapsible) ─────────────────────── */}
          {isConnectorMode && (
            <Section title="Install troubleshooting" open={showTrouble} onToggle={() => setShowTrouble((v) => !v)}>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                <p style={{ fontWeight: 600, marginTop: 0 }}>If &quot;App not installed&quot; appears:</p>
                <ol style={{ paddingLeft: 20, margin: "4px 0 12px" }}>
                  <li>Delete any existing APK file from Downloads.</li>
                  <li>Uninstall any old version of the connector from Settings → Apps.</li>
                  <li>Re-download v0.5.8 using the button above.</li>
                  <li>Open the Downloads folder, tap the APK, and tap Install.</li>
                  <li>If blocked: Settings → Security → allow installs from this source.</li>
                </ol>
                <p style={{ fontWeight: 600 }}>If connector shows &quot;Not running&quot;:</p>
                <ul style={{ paddingLeft: 20, margin: "4px 0" }}>
                  <li>Open the franchisetech Connector app on the same device.</li>
                  <li>These settings must be opened from the same Android till browser.</li>
                  <li>Connector bridge is at http://127.0.0.1:{portNum}/ — not reachable from a PC.</li>
                </ul>
              </div>
            </Section>
          )}

          {/* ── SUNMI diagnostic table (collapsible, only when result exists) ─ */}
          {isConnectorMode && sunmiTestResult && Array.isArray(sunmiTestResult.attempts) && sunmiTestResult.attempts.length > 0 && (
            <Section title="Diagnostic details" open={showAdvanced} onToggle={() => setShowAdvanced((v) => !v)}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", color: "#374151" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      {["Method", "Callback", "Printed", "Drawer before", "Drawer after", "Times Δ", "Outcome"].map((h) => (
                        <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sunmiTestResult.attempts as Array<{ [k: string]: string | number | boolean | null | undefined }>).map((a, i) => {
                      const delta = typeof a.openDrawerTimesAfter === "number" && typeof a.openDrawerTimesBefore === "number"
                        ? a.openDrawerTimesAfter - a.openDrawerTimesBefore : null;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "5px 8px", fontFamily: "monospace", whiteSpace: "nowrap" }}>{a.method ?? "-"}</td>
                          <td style={{ padding: "5px 8px" }}>{a.callbackReceived ? (a.callbackSuccess ? "✓ ok" : "✗ err") : "—"}</td>
                          <td style={{ padding: "5px 8px" }}>{a.printed == null ? "—" : a.printed ? "✓" : "✗"}</td>
                          <td style={{ padding: "5px 8px" }}>{a.drawerStatusBefore ?? "—"}</td>
                          <td style={{ padding: "5px 8px" }}>{a.drawerStatusAfter ?? "—"}</td>
                          <td style={{ padding: "5px 8px", fontWeight: delta != null && delta > 0 ? 700 : undefined, color: delta != null && delta > 0 ? "#16a34a" : undefined }}>
                            {delta != null ? (delta > 0 ? `+${delta}` : String(delta)) : "—"}
                          </td>
                          <td style={{ padding: "5px 8px", color: a.outcome === "opened" ? "#16a34a" : a.outcome === "failed" ? "#dc2626" : "#64748b" }}>
                            {a.outcome ?? "—"}{a.exceptionMsg ? ` (${a.exceptionMsg})` : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Advanced settings (collapsible) ───────────────────────────── */}
          {isConnectorMode && (
            <Section title="Advanced settings" open={showAdvanced} onToggle={() => setShowAdvanced((v) => !v)}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <Label>Port</Label>
                  <Input
                    type="number" min={1} max={65535} value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="mt-1 h-10 max-w-[160px]"
                  />
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Default: 17878</p>
                </div>
                <div>
                  <Label>Pairing token</Label>
                  <Input
                    type="text" value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Auto-set during pairing"
                    className="mt-1 h-10"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label>Open drawer after:</Label>
                  {[
                    { label: "Cash sale", val: triggerCashSale, set: setTriggerCashSale },
                    { label: "Cash in", val: triggerCashIn, set: setTriggerCashIn },
                    { label: "Cash out", val: triggerCashOut, set: setTriggerCashOut },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Connector URL: <code style={{ fontSize: 11 }}>http://127.0.0.1:{portNum}/health</code>
                  </p>
                </div>
                <Button type="button" onClick={handleSave} disabled={saving}
                  style={{ alignSelf: "flex-start", height: 40, paddingLeft: 20, paddingRight: 20 }}>
                  {saving ? "Saving…" : "Save settings"}
                </Button>
              </div>
            </Section>
          )}

          {/* ── Advanced diagnostics (collapsible) ────────────────────────── */}
          {isConnectorMode && (
            <Section title="Advanced diagnostics" open={showDiagnostics} onToggle={() => setShowDiagnostics((v) => !v)}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Step progress */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {STEPS.map((s) => {
                    const isCurrent = s === step || (step === "done" && s === "confirm");
                    const idx = STEPS.indexOf(s);
                    const curIdx = STEPS.indexOf(step === "done" ? "confirm" : step);
                    const past = idx < curIdx;
                    return (
                      <span key={s} style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12,
                        background: isCurrent ? "#1d4ed8" : past ? "#dcfce7" : "#f1f5f9",
                        color: isCurrent ? "#fff" : past ? "#166534" : "#64748b",
                      }}>
                        {STEP_LABELS[s]}
                      </span>
                    );
                  })}
                </div>

                {/* Step actions */}
                {step === "install" && (
                  <Button type="button" disabled={pending} onClick={checkInstall}
                    style={{ alignSelf: "flex-start", height: 40, paddingLeft: 16, paddingRight: 16 }}>
                    Check connector
                  </Button>
                )}
                {step === "pair" && (
                  <Button type="button" disabled={pending} onClick={connectDevice}
                    style={{ alignSelf: "flex-start", height: 40, paddingLeft: 16, paddingRight: 16 }}>
                    {pending ? "Pairing…" : "Pair device"}
                  </Button>
                )}
                {step === "simulate" && (
                  <Button type="button" disabled={pending} onClick={runSimulation}
                    style={{ alignSelf: "flex-start", height: 40, paddingLeft: 16, paddingRight: 16 }}>
                    Run simulation
                  </Button>
                )}
                {step === "diagnose" && (
                  <Button type="button" disabled={pending} onClick={runDiagnostics}
                    style={{ alignSelf: "flex-start", height: 40, paddingLeft: 16, paddingRight: 16 }}>
                    Run diagnostics
                  </Button>
                )}
                {step === "live_test" && (
                  <Button type="button" disabled={pending} onClick={runLiveTest}
                    style={{ alignSelf: "flex-start", height: 40, paddingLeft: 16, paddingRight: 16 }}>
                    Send live command
                  </Button>
                )}
                {step === "confirm" && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, marginTop: 0, marginBottom: 10, color: "#1e40af" }}>
                      Did the cash drawer physically open?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button type="button" disabled={pending} onClick={() => confirmHardware(true)}
                        style={{ height: 40, paddingLeft: 20, paddingRight: 20, background: "#16a34a", color: "#fff" }}>
                        Yes, drawer opened
                      </Button>
                      <Button type="button" variant="outline" disabled={pending} onClick={() => confirmHardware(false)}
                        style={{ height: 40, paddingLeft: 16, paddingRight: 16 }}>
                        No, did not open
                      </Button>
                    </div>
                  </div>
                )}
                {step === "done" && (
                  <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534" }}>
                    ✓ Setup complete. Hardware verified.
                  </div>
                )}

                {/* Diag checks */}
                {diagChecks.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {diagChecks.map((c, i) => (
                      <div key={i} style={{
                        fontSize: 12, padding: "6px 10px", borderRadius: 6,
                        background: c.result === "passed" ? "#f0fdf4" : c.result === "failed" ? "#fef2f2" : "#fefce8",
                        color: c.result === "passed" ? "#166534" : c.result === "failed" ? "#991b1b" : "#713f12",
                        borderLeft: `3px solid ${c.result === "passed" ? "#86efac" : c.result === "failed" ? "#fca5a5" : "#fde047"}`,
                      }}>
                        <strong>{c.name}</strong>: {c.message}
                        {c.suggestion && <div style={{ marginTop: 2, fontStyle: "italic" }}>{c.suggestion}</div>}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setStep("install"); setStepState("idle"); setDiagChecks([]); showMsg("Reset. Restart from step 1.", "info"); }}>
                    Reset wizard
                  </Button>
                </div>
              </div>
            </Section>
          )}

          {/* ── Hardware checklist (collapsible) ──────────────────────────── */}
          {isConnectorMode && (
            <Section title="Hardware wiring checklist" open={showChecklist} onToggle={() => setShowChecklist((v) => !v)}>
              <ul style={{ fontSize: 13, color: "#475569", paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                <li>SUNMI till: RJ12 cash drawer cable connects from the APG drawer to the SUNMI RJ12 cash drawer port (not the printer paper port).</li>
                <li>Printer power is on and the printer is connected to the till.</li>
                <li>Printer serial cable (RJ11/RJ12) is fully seated — not RJ45/ethernet.</li>
                <li>Drawer opens manually with its key (confirms it is not jammed).</li>
                <li>SUNMI printer service is running (visible in Settings → Apps).</li>
                <li>Android Connector v0.5.8 is installed and open on this device.</li>
              </ul>
            </Section>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
