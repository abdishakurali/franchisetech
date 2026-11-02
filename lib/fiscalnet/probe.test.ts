import { describe, expect, it, vi } from "vitest";
import { probeFiscalNet } from "./probe";

describe("probeFiscalNet", () => {
  it("reports reachable when the connector answers, without claiming the register is connected", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const result = await probeFiscalNet("http://localhost:65400/", { fetchImpl });
    expect(result.reachable).toBe(true);
    expect(result.message).toContain("prima vânzare");
    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:65400/api/health", expect.objectContaining({ mode: "no-cors" }));
  });

  it("reports unreachable on a network error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await probeFiscalNet("http://localhost:65400", { fetchImpl });
    expect(result).toEqual({ reachable: false, message: expect.stringContaining("nu răspunde") });
  });

  it("reports a timeout distinctly", async () => {
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
    ) as unknown as typeof fetch;
    const result = await probeFiscalNet("http://localhost:65400", { fetchImpl, timeoutMs: 10 });
    expect(result).toEqual({ reachable: false, message: expect.stringContaining("la timp") });
  });

  it("rejects an invalid address without calling fetch", async () => {
    const fetchImpl = vi.fn();
    const result = await probeFiscalNet("localhost", { fetchImpl });
    expect(result.reachable).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
