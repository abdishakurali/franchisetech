// @vitest-environment jsdom
//
// Re-issuing a missing fiscal receipt: claim → payload → send-and-log, once.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const calls: string[] = [];
const listSales = vi.fn();
const getPayload = vi.fn();
vi.mock("@/app/actions/fiscal-recovery", () => ({
  listSalesMissingFiscalReceipt: (...a: unknown[]) => listSales(...a),
  getFiscalRetryPayload: (...a: unknown[]) => { calls.push("payload"); return getPayload(...a); },
}));
const sendAndLog = vi.fn();
vi.mock("@/lib/fiscalnet/log-attempt", () => ({
  fiscalBrowserReceiptAndLog: (...a: unknown[]) => { calls.push("send"); return sendAndLog(...a); },
}));
const claim = vi.fn();
const release = vi.fn();
vi.mock("@/lib/fiscalnet/print-guard", () => ({
  claimFiscalPrint: (id: string) => { calls.push("claim"); return claim(id); },
  releaseFiscalPrint: (id: string) => { calls.push("release"); return release(id); },
}));

const { PosMissingReceipts } = await import("./PosMissingReceipts");

const fiscalNet = {
  enabled: true,
  mockMode: false,
  connectionMode: "api" as const,
  apiHost: "http://localhost:65400",
  vatGroups: [],
  paymentTypeMap: {},
  operatorCode: "1",
};
const recordAttempt = vi.fn();
const sale = { id: "tx-1", transaction_number: "KO-MWDJHWRJ", sold_at: "2026-11-12T12:44:13Z", total: 27, status: "api_pending" };
const payload = {
  ok: true,
  transactionId: "tx-1",
  transactionNumber: "KO-MWDJHWRJ",
  items: [{ productName: "Flat white", quantity: 1, unitPrice: 27, vatRate: 0, fiscalNetGroup: 5 }],
  total: 27,
  paymentType: "cash",
  paymentCode: 1,
  attemptNumber: 1,
  mockMode: false,
};

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

beforeEach(() => {
  calls.length = 0;
  listSales.mockReset().mockResolvedValue({ ok: true, sales: [sale] });
  getPayload.mockReset().mockResolvedValue(payload);
  sendAndLog.mockReset();
  claim.mockReset().mockReturnValue(true);
  release.mockReset();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function openBanner() {
  render(<PosMissingReceipts fiscalNet={fiscalNet} recordAttempt={recordAttempt} />);
  fireEvent.click(await screen.findByRole("button", { name: "Vânzări fără bon fiscal (1)" }));
  return screen.getByRole("button", { name: "Emite bonul fiscal" });
}

describe("PosMissingReceipts", () => {
  it("renders nothing when no sale is missing a receipt", async () => {
    listSales.mockResolvedValue({ ok: true, sales: [] });
    const { container } = render(<PosMissingReceipts fiscalNet={fiscalNet} recordAttempt={recordAttempt} />);
    await waitFor(() => expect(listSales).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });

  it("asks for a roll check, then claims, fetches the payload and sends once; a second click while sending is refused", async () => {
    const send = deferred<{ ok: boolean; message: string; receiptNumber?: string; confirmation?: string }>();
    sendAndLog.mockReturnValue(send.promise);
    const button = await openBanner();

    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(sendAndLog).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Se trimite..." }));

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(vi.mocked(window.confirm).mock.calls[0][0]).toContain("NU îl emiteți din nou");
    expect(vi.mocked(window.confirm).mock.calls[0][0]).toContain("KO-MWDJHWRJ (27.00 lei)");
    expect(calls).toEqual(["claim", "payload", "send"]);
    expect(claim).toHaveBeenCalledWith("tx-1");
    expect(getPayload).toHaveBeenCalledWith("tx-1");
    expect(sendAndLog).toHaveBeenCalledWith(fiscalNet, payload.items, 27, "cash", {
      transactionId: "tx-1",
      attemptNumber: 1,
      recordAttempt,
      paymentCode: 1,
    });

    listSales.mockResolvedValue({ ok: true, sales: [] });
    send.resolve({ ok: true, message: "Bon fiscal emis. Nr: 123", receiptNumber: "123", confirmation: "confirmed" });
    expect(await screen.findByText("Bon fiscal emis. Nr: 123")).toBeTruthy();
    expect(release).not.toHaveBeenCalled();
    expect(sendAndLog).toHaveBeenCalledTimes(1);
    expect(listSales).toHaveBeenCalledTimes(2);
  });

  it("does nothing when the owner cancels the roll-check question", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    fireEvent.click(await openBanner());
    expect(calls).toEqual([]);
  });

  it("refuses when this browser already holds the claim", async () => {
    claim.mockReturnValue(false);
    fireEvent.click(await openBanner());
    expect(await screen.findByText("Bonul pentru această vânzare se trimite deja din acest browser.")).toBeTruthy();
    expect(getPayload).not.toHaveBeenCalled();
    expect(sendAndLog).not.toHaveBeenCalled();
  });

  it("releases the claim when the server refuses or the device fails, so it can be retried", async () => {
    getPayload.mockResolvedValueOnce({ ok: false, error: "Există deja un bon fiscal emis pentru această vânzare." });
    fireEvent.click(await openBanner());
    expect(await screen.findByText("Există deja un bon fiscal emis pentru această vânzare.")).toBeTruthy();
    expect(release).toHaveBeenCalledWith("tx-1");
    expect(sendAndLog).not.toHaveBeenCalled();

    release.mockClear();
    sendAndLog.mockResolvedValue({ ok: false, message: "Hârtie lipsă", confirmation: "device_error" });
    fireEvent.click(screen.getByRole("button", { name: "Emite bonul fiscal" }));
    expect(await screen.findByText("Bonul NU a fost emis: Hârtie lipsă")).toBeTruthy();
    expect(release).toHaveBeenCalledWith("tx-1");
  });

  it("keeps the claim when FiscalNet did not confirm (it may have printed)", async () => {
    sendAndLog.mockResolvedValue({ ok: true, message: "?", confirmation: "unconfirmed" });
    fireEvent.click(await openBanner());
    expect(await screen.findByText(/nu a confirmat că a fost emis/)).toBeTruthy();
    expect(release).not.toHaveBeenCalled();
  });

  it("labels a mock-mode result as a simulated test receipt", async () => {
    sendAndLog.mockResolvedValue({ ok: true, message: "Mock — bon simulat (nu s-a trimis la casă)." });
    render(<PosMissingReceipts fiscalNet={{ ...fiscalNet, mockMode: true }} recordAttempt={recordAttempt} />);
    expect(await screen.findByText("Mod test: bonurile sunt simulate")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Vânzări fără bon fiscal (1)" }));
    fireEvent.click(screen.getByRole("button", { name: "Emite bonul fiscal" }));
    expect(await screen.findByText("TEST: bon simulat, nu s-a trimis la casa de marcat.")).toBeTruthy();
  });
});
