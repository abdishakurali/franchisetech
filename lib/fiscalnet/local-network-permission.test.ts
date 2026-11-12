import { afterEach, describe, expect, it, vi } from "vitest";
import { localNetworkPermission, LNA_DENIED_MESSAGE, LNA_PROMPT_MESSAGE } from "./local-network-permission";
import { probeFiscalNet } from "./probe";
import { fiscalBrowserXReport, type BrowserFiscalConfig } from "./browser";

const permissionsWith = (states: Record<string, PermissionState | Error>) => ({
  query: vi.fn(async ({ name }: { name: string }) => {
    const s = states[name];
    if (s === undefined || s instanceof Error) throw s ?? new TypeError(`unknown permission ${name}`);
    return { state: s } as PermissionStatus;
  }),
});

describe("localNetworkPermission", () => {
  it("reads loopback-network first", async () => {
    expect(await localNetworkPermission(permissionsWith({ "loopback-network": "granted" }))).toBe("granted");
  });
  it("falls back to the older local-network-access name", async () => {
    expect(await localNetworkPermission(permissionsWith({ "local-network-access": "denied" }))).toBe("denied");
  });
  it("is unsupported when the browser knows neither name or has no Permissions API", async () => {
    expect(await localNetworkPermission(permissionsWith({}))).toBe("unsupported");
    expect(await localNetworkPermission(undefined)).toBe("unsupported");
  });
});

describe("probeFiscalNet with Local Network Access", () => {
  it("does not call the connector and explains how to re-allow when blocked", async () => {
    const fetchImpl = vi.fn();
    const result = await probeFiscalNet("http://localhost:65400", { fetchImpl, permission: async () => "denied" });
    expect(result).toEqual({ reachable: false, message: LNA_DENIED_MESSAGE });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("waits for the prompt and asks the owner to click Allow instead of blaming FiscalNet", async () => {
    let seenSignal: AbortSignal | undefined;
    const fetchImpl = vi.fn((_u: string, init?: RequestInit) => {
      seenSignal = init?.signal ?? undefined;
      return Promise.reject(new DOMException("aborted", "AbortError"));
    }) as unknown as typeof fetch;
    const result = await probeFiscalNet("http://localhost:65400", { fetchImpl, timeoutMs: 10, permission: async () => "prompt" });
    expect(result).toEqual({ reachable: false, message: LNA_PROMPT_MESSAGE });
    expect(seenSignal).toBeDefined();
  });

  it("keeps the old messages when the permission is granted", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await probeFiscalNet("http://localhost:65400", { fetchImpl, permission: async () => "granted" });
    expect(result.message).toContain("nu răspunde");
  });
});

describe("fiscal commands with Local Network Access", () => {
  const config: BrowserFiscalConfig = {
    enabled: true, mockMode: false, connectionMode: "api", apiHost: "http://localhost:65400",
    vatGroups: [], paymentTypeMap: {},
  };
  afterEach(() => vi.unstubAllGlobals());

  it("never sends when the browser blocked local network access", async () => {
    vi.stubGlobal("navigator", { permissions: permissionsWith({ "loopback-network": "denied" }) });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const result = await fiscalBrowserXReport(config);
    expect(result).toEqual({ ok: false, message: LNA_DENIED_MESSAGE });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("says to click Allow when the request fails while the prompt is still open", async () => {
    vi.stubGlobal("navigator", { permissions: permissionsWith({ "loopback-network": "prompt" }) });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")));
    const result = await fiscalBrowserXReport(config);
    expect(result).toEqual({ ok: false, message: LNA_PROMPT_MESSAGE });
  });
});
