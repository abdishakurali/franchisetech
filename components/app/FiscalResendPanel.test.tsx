// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/app/actions/fiscal-resend", () => ({ beginFiscalReceiptResend: vi.fn(), finishFiscalReceiptResend: vi.fn() }));

const { FiscalResendPanel } = await import("@/components/app/FiscalResendPanel");

const fiscalNet = {
  enabled: true, mockMode: false, connectionMode: "api" as const, apiHost: "http://localhost:65400",
  vatGroups: [], paymentTypeMap: { cash: 1 as const },
};
const receipts = [{ id: "tx-1", transactionNumber: "KO-1", total: 9, soldAt: "2026-11-21T10:00:00Z", status: "failed" }];
const money = (v: number) => `${v.toFixed(2)} lei`;
const begunOk = {
  ok: true as const, attemptId: "att-2", attemptNumber: 2, transactionNumber: "KO-1", total: 9, paymentType: "cash", paymentCode: 1,
  items: [{ productName: "Espresso", quantity: 1, unitPrice: 9, vatRate: 11, fiscalNetGroup: 2 }],
};

afterEach(cleanup);

describe("FiscalResendPanel", () => {
  it("lists unconfirmed sales and cannot send until the printer check is ticked", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, message: "ok", receiptNumber: "77", confirmation: "confirmed" });
    const deps = { begin: vi.fn().mockResolvedValue(begunOk), finish: vi.fn().mockResolvedValue({ ok: true }), send };
    render(<FiscalResendPanel receipts={receipts} fiscalNet={fiscalNet} money={money} deps={deps} />);

    expect(screen.getByText("1 vânzare fără bon fiscal confirmat")).toBeTruthy();
    fireEvent.click(screen.getByTestId("fiscal-resend-tx-1"));
    const confirm = await screen.findByTestId("fiscal-resend-confirm");
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(confirm);
    expect(deps.begin).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("fiscal-resend-checked"));
    expect((confirm as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(confirm);

    await waitFor(() => expect(screen.getByTestId("fiscal-resend-message").textContent).toContain("Nr: 77"));
    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("fiscal-resend-tx-1")).toBeNull();
  });

  it("keeps the result visible when the page refresh drops the sale from the list", async () => {
    let release!: (v: unknown) => void;
    const send = vi.fn(() => new Promise((r) => { release = r; }));
    const deps = { begin: vi.fn().mockResolvedValue(begunOk), finish: vi.fn().mockResolvedValue({ ok: true }), send: send as never };
    const { rerender } = render(<FiscalResendPanel receipts={receipts} fiscalNet={fiscalNet} money={money} deps={deps} />);
    fireEvent.click(screen.getByTestId("fiscal-resend-tx-1"));
    fireEvent.click(await screen.findByTestId("fiscal-resend-checked"));
    fireEvent.click(screen.getByTestId("fiscal-resend-confirm"));
    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    rerender(<FiscalResendPanel receipts={[]} fiscalNet={fiscalNet} money={money} deps={deps} />);
    release({ ok: true, message: "ok", receiptNumber: "9", confirmation: "confirmed" });
    await waitFor(() => expect(screen.getByTestId("fiscal-resend-message").textContent).toContain("Nr: 9"));
  });

  it("a double click sends once", async () => {
    let release!: (v: unknown) => void;
    const send = vi.fn(() => new Promise((r) => { release = r; }));
    const deps = { begin: vi.fn().mockResolvedValue(begunOk), finish: vi.fn().mockResolvedValue({ ok: true }), send: send as never };
    const trackPrint = vi.fn((p) => p);
    render(<FiscalResendPanel receipts={receipts} fiscalNet={fiscalNet} money={money} deps={deps} trackPrint={trackPrint} />);
    fireEvent.click(screen.getByTestId("fiscal-resend-tx-1"));
    fireEvent.click(await screen.findByTestId("fiscal-resend-checked"));
    const confirm = screen.getByTestId("fiscal-resend-confirm");
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    release({ ok: true, message: "ok", receiptNumber: "8", confirmation: "confirmed" });
    await waitFor(() => expect(screen.getByTestId("fiscal-resend-message").textContent).toContain("Nr: 8"));
    expect(deps.begin).toHaveBeenCalledTimes(1);
    expect(trackPrint).toHaveBeenCalledTimes(1);
  });

  it("shows the server's refusal and keeps the sale listed", async () => {
    const deps = { begin: vi.fn().mockResolvedValue({ ok: false, message: "Bonul pentru această vânzare se trimite deja." }), finish: vi.fn(), send: vi.fn() };
    render(<FiscalResendPanel receipts={receipts} fiscalNet={fiscalNet} money={money} deps={deps} />);
    fireEvent.click(screen.getByTestId("fiscal-resend-tx-1"));
    fireEvent.click(await screen.findByTestId("fiscal-resend-checked"));
    fireEvent.click(screen.getByTestId("fiscal-resend-confirm"));
    await waitFor(() => expect(screen.getByTestId("fiscal-resend-message").textContent).toContain("se trimite deja"));
    expect(deps.send).not.toHaveBeenCalled();
    expect(screen.getByTestId("fiscal-resend-tx-1")).toBeTruthy();
  });
});
