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

  it("passes the payment method's FiscalNet code through to the receipt", async () => {
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "Bon tipărit." });
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true, attemptId: "a1" });
    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "other", { transactionId: "tx-meal", recordAttempt, paymentCode: 4 });
    expect(fiscalBrowserReceiptMock).toHaveBeenCalledWith(baseConfig, [], 10, "other", 4);
  });

  it("logs ambiguous (never success) when FiscalNet accepted the request but confirmed nothing", async () => {
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true, attemptId: "a1" });
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "Comandă trimisă.", confirmation: "unconfirmed", rawResponse: "HTTP 200 OK" });

    const result = await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", { transactionId: "tx-amb", recordAttempt });

    expect(result.ok).toBe(true);
    expect(recordAttempt).toHaveBeenCalledWith(expect.objectContaining({ status: "ambiguous", errorCode: null, receiptNumber: null }));
  });

  it("logs the device's own error code on a documented device error", async () => {
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true, attemptId: "a1" });
    fiscalBrowserReceiptMock.mockResolvedValue({ ok: false, message: "Eroare casă: -111015", confirmation: "device_error", errorCode: "-111015" });

    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", { transactionId: "tx-dev", recordAttempt });

    expect(recordAttempt).toHaveBeenCalledWith(expect.objectContaining({ status: "failed", errorCode: "-111015", errorInfo: "Eroare casă: -111015" }));
  });

  it("stores FiscalNet's raw reply as responseContent when there is one, and our message otherwise", async () => {
    const recordAttempt = vi.fn().mockResolvedValue({ ok: true, attemptId: "a1" });

    fiscalBrowserReceiptMock.mockResolvedValue({
      ok: true,
      message: "Comandă trimisă.",
      rawResponse: 'HTTP 200 {"ReceiptStatus":true,"ReceiptNumber":"77"}',
    });
    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", { transactionId: "tx-raw", recordAttempt });
    expect(recordAttempt).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "success", responseContent: 'HTTP 200 {"ReceiptStatus":true,"ReceiptNumber":"77"}' })
    );

    fiscalBrowserReceiptMock.mockResolvedValue({ ok: false, message: "Nu se poate contacta casa fiscală." });
    await fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", { transactionId: "tx-down", recordAttempt });
    expect(recordAttempt).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "failed", responseContent: "Nu se poate contacta casa fiscală." })
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

  it("does not hang forever if the logging call itself never resolves — bounded so the offline-sync loop, which awaits this whole function per entry, can't stall indefinitely on the logging step alone", async () => {
    vi.useFakeTimers();
    try {
      fiscalBrowserReceiptMock.mockResolvedValue({ ok: true, message: "Bon tipărit.", receiptNumber: "NR-7" });
      const recordAttempt = vi.fn(() => new Promise<{ ok: boolean }>(() => {})); // never resolves

      const pending = fiscalBrowserReceiptAndLog(baseConfig, [], 10, "cash", {
        transactionId: "tx-7",
        recordAttempt,
      });

      await vi.advanceTimersByTimeAsync(10_000);
      const result = await pending;

      // The agent's own result still comes back, unaffected by the stuck logging call.
      expect(result).toEqual(expect.objectContaining({ ok: true, receiptNumber: "NR-7" }));
    } finally {
      vi.useRealTimers();
    }
  });
});
