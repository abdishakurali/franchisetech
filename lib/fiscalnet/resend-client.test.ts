import { afterEach, describe, expect, it, vi } from "vitest";
import { resendFiscalReceipt, type ResendDeps } from "@/lib/fiscalnet/resend-client";
import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";

const config: BrowserFiscalConfig = {
  enabled: true, mockMode: false, connectionMode: "api", apiHost: "http://localhost:65400",
  vatGroups: [], paymentTypeMap: { cash: 1, card: 2 },
};
const begunOk = {
  ok: true as const, attemptId: "att-2", attemptNumber: 2, transactionNumber: "KO-1",
  total: 9, paymentType: "cash", paymentCode: 1,
  items: [{ productName: "Espresso", quantity: 1, unitPrice: 9, vatRate: 11, fiscalNetGroup: 2 }],
};

function fields(fd: FormData) {
  return Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
}

afterEach(() => vi.useRealTimers());

describe("resendFiscalReceipt", () => {
  it("sends nothing to the printer when the server refuses to begin", async () => {
    const send = vi.fn();
    const finish = vi.fn();
    const deps: ResendDeps = { begin: vi.fn().mockResolvedValue({ ok: false, message: "în curs" }), finish, send };
    const out = await resendFiscalReceipt(config, "tx-1", deps);
    expect(out).toEqual({ kind: "refused", message: "în curs" });
    expect(send).not.toHaveBeenCalled();
    expect(finish).not.toHaveBeenCalled();
  });

  it("asks the server with the printer-checked confirmation", async () => {
    const begin = vi.fn().mockResolvedValue({ ok: false, message: "x" });
    await resendFiscalReceipt(config, "tx-1", { begin, finish: vi.fn(), send: vi.fn() });
    expect(fields(begin.mock.calls[0][0])).toEqual({ transaction_id: "tx-1", printer_checked: "nu-a-iesit" });
  });

  it("calls the printer exactly once and records a confirmed receipt", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, message: "Bon fiscal emis. Nr: 77", receiptNumber: "77", confirmation: "confirmed", rawResponse: "HTTP 200 {}" });
    const finish = vi.fn().mockResolvedValue({ ok: true });
    const out = await resendFiscalReceipt(config, "tx-1", { begin: vi.fn().mockResolvedValue(begunOk), finish, send });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(config, begunOk.items, 9, "cash", 1);
    expect(fields(finish.mock.calls[0][0])).toEqual({ attempt_id: "att-2", status: "success", response_content: "HTTP 200 {}", receipt_number: "77" });
    expect(out).toMatchObject({ kind: "sent", confirmed: true, logged: true });
  });

  it("records a failure with its reason and does not retry", async () => {
    const send = vi.fn().mockResolvedValue({ ok: false, message: "Nu se poate contacta casa fiscală." });
    const finish = vi.fn().mockResolvedValue({ ok: true });
    const out = await resendFiscalReceipt(config, "tx-1", { begin: vi.fn().mockResolvedValue(begunOk), finish, send });
    expect(send).toHaveBeenCalledTimes(1);
    expect(fields(finish.mock.calls[0][0])).toMatchObject({ status: "failed", error_code: "CLIENT_ERROR", error_info: "Nu se poate contacta casa fiscală." });
    expect(out).toMatchObject({ kind: "sent", confirmed: false });
  });

  it("records an unconfirmed reply as ambiguous, never as success", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, message: "Comandă trimisă.", confirmation: "unconfirmed" });
    const finish = vi.fn().mockResolvedValue({ ok: true });
    const out = await resendFiscalReceipt(config, "tx-1", { begin: vi.fn().mockResolvedValue(begunOk), finish, send });
    expect(fields(finish.mock.calls[0][0]).status).toBe("ambiguous");
    expect(out).toMatchObject({ confirmed: false });
  });

  it("closes the attempt as failed when the lines cannot be built (nothing reached the printer)", async () => {
    const send = vi.fn().mockImplementation(() => { throw new Error("FiscalNet: grupă TVA invalidă"); });
    const finish = vi.fn().mockResolvedValue({ ok: true });
    await resendFiscalReceipt(config, "tx-1", { begin: vi.fn().mockResolvedValue(begunOk), finish, send });
    expect(fields(finish.mock.calls[0][0])).toMatchObject({ status: "failed", error_info: "FiscalNet: grupă TVA invalidă" });
  });

  it("does not hang when recording the answer never returns", async () => {
    vi.useFakeTimers();
    const send = vi.fn().mockResolvedValue({ ok: true, message: "ok", receiptNumber: "5", confirmation: "confirmed" });
    const finish = vi.fn(() => new Promise<{ ok: boolean }>(() => {}));
    const p = resendFiscalReceipt(config, "tx-1", { begin: vi.fn().mockResolvedValue(begunOk), finish, send });
    await vi.advanceTimersByTimeAsync(10_001);
    await expect(p).resolves.toMatchObject({ kind: "sent", confirmed: true, logged: false });
  });
});
