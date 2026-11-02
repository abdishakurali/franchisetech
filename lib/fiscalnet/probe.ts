// Browser-side reachability check for the FiscalNet connector.
//
// FiscalNet runs on the cashier's PC or Android device, so only the browser on
// that device can reach it — a server action cannot (it would test the
// server's own localhost). This probe only proves that *something* answers at
// the address; it cannot prove the cash register itself is connected, and the
// messages say exactly that. The first real receipt is the real proof.

export type FiscalNetProbeResult =
  | { reachable: true; message: string }
  | { reachable: false; message: string };

const DEFAULT_TIMEOUT_MS = 4000;

export async function probeFiscalNet(
  apiHost: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch }: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<FiscalNetProbeResult> {
  const host = apiHost.trim().replace(/\/$/, "");
  if (!/^https?:\/\/[^\s/]+/i.test(host)) {
    return { reachable: false, message: "Adresa nu este validă. Exemplu: http://localhost:65400" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // GET /api/health is FiscalNet's documented liveness route. no-cors: we only
    // care whether the service answers, not what it says (CORS may not be set up).
    await fetchImpl(`${host}/api/health`, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal });
    return {
      reachable: true,
      message: "FiscalNet răspunde pe acest calculator. Bonul real se confirmă la prima vânzare în mod Live.",
    };
  } catch (e) {
    const aborted = e instanceof Error && (e.name === "AbortError" || e.message.toLowerCase().includes("abort"));
    return {
      reachable: false,
      message: aborted
        ? "FiscalNet nu a răspuns la timp. Verificați că programul FiscalNet este pornit pe acest calculator."
        : "FiscalNet nu răspunde pe acest calculator. Verificați că este instalat și pornit, sau cereți-ne ajutorul mai jos.",
    };
  } finally {
    clearTimeout(timer);
  }
}
