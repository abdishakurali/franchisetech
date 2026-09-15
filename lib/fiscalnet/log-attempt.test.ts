// Gate B proof: fiscalBrowserReceiptAndLog is the "single joined operation"
// the fiscal logging fix exists to build — the agent call and recording its
// outcome must not be two independently-skippable steps. These tests prove
// recordAttempt is always called with the right status/fields (or correctly
// never called, for a disabled config), and that a broken logging call never
// swallows the agent's own result back to the caller.

import { describe, expect, it, vi, beforeEach } from "vitest";
import type { BrowserFiscalConfig, BrowserFiscalResult } from "./browser";

const fiscalBrowserReceiptMock = vi.fn<
  (...args: unknown[]) => Promise<BrowserFiscalResult>
>();

vi.mock("./browser", () => ({
  fiscalBrowserReceipt: (...args: unknown[]) => fiscalBrowserReceiptMock(...args),
}));

const { fiscalBrowserReceiptAndLog } = await import("./log-attempt");

const baseConfig: BrowserFiscalConfig = {
  enabled: true,
  mockMode: false,
  connectionMode: "api",
  apiHost: "http://localhost:65400",
  vatGroups: [],
  paymentTypeMap: { cash: 1, card: 2 },
};

beforeEach(() => {
  fiscalBrowserReceiptMock.mockReset();
});

describe("fiscalBrowserReceiptAndLog", () => {
  it("logs status success when the agent call succeeds in real (non-mock) mode", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "Bon tipărit.", receiptNumber: "NR-1" });
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true, attemptId: "a1" });

    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", {
      transactionId: "tx-1",
      recordAttempt,
    });

    expect(recordAttempt).toHaveBeenCalledTimes(1);
    expect(recordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: "tx-1",
        attemptNumber: 1,
        status: "success",
        mockMode: false,
        receiptNumber: "NR-1",
        errorCode: null,
        errorInfo: null,
      })
    );
  });

  it("logs status failed, with an error code and the failure message, when the agent call fails", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: false, message: "Timeout — casa fiscală nu răspunde (>15s)." });
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true });

    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", {
      transactionId: "tx-2",
      recordAttempt,
    });

    expect(recordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        errorCode: "CLIENT_ERROR",
        errorInfo: "Timeout — casa fiscală nu răspunde (>15s).",
      })
    );
  });

  it("logs status mock_success in mock mode even though the agent result itself reports ok:true (mock is not the same claim as a real success)", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "Mock — bon simulat.", receiptNumber: "MOCK-1" });
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true });

    await fiscalBrowserReceiptAndLog({ ...baseConfig, mockMode: true }, [], 10, "cash", {
      transactionId: "tx-3",
      recordAttempt,
    });

    expect(recordAttempt).toHaveBeenCalledWith(expect.objectContaining({ status: "mock_success", mockMode: true }));
  });

  it("never calls recordAttempt when FiscalNet is disabled — nothing was actually attempted", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "FiscalNet dezactivat." });
    const recordAttempt = vi.fn();

    const result = await fiscalBrowserReceiptAndLog({ ...baseConfig, enabled: false }, [], 10, "cash", {
      transactionId: "tx-4",
      recordAttempt,
    });

    expect(recordAttempt).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });

  it("still returns the agent's result even if the logging call itself throws", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "Bon tipărit.", receiptNumber: "NR-5" });
    const recordAttempt = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", {
      transactionId: "tx-5",
      recordAttempt,
    });

    expect(result).toEqual(expect.objectContaining({ ok: true, receiptNumber: "NR-5" }));
  });

  it("passes attemptNumber through when given (manual-retry path), defaulting to 1 otherwise", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "ok" });
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true });

    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", {
      transactionId: "tx-6",
      attemptNumber: 3,
      recordAttempt,
    });

    expect(recordAttempt).toHaveBeenCalledWith(expect.objectContaining({ attemptNumber: 3 }));
  });
});
