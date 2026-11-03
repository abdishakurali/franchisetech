// @vitest-environment jsdom
//
// After a sale the FiscalNet reply arrives on its own. If the cash register
// did not confirm the receipt, the cashier must see it on screen — before,
// the result only went to console.info and the screen said "complete".

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

const completeSaleReturn = vi.fn();
vi.mock("@/app/actions/kitchenops", () => ({
  addCustomerFromPos: vi.fn(),
  closePosSession: vi.fn(),
  completeSaleReturn: (...args: unknown[]) => completeSaleReturn(...args),
  posCashMovement: vi.fn(),
  voidTransaction: vi.fn(),
}));
vi.mock("@/app/actions/fiscalnet", () => ({ runZReport: vi.fn(), recordFiscalReceiptAttempt: vi.fn() }));
vi.mock("@/app/actions/loyalty", () => ({
  getLoyaltyStampStatus: vi.fn().mockResolvedValue(null),
  recordLoyaltyRedemption: vi.fn(),
}));
vi.mock("@/app/actions/table-service", () => ({
  sendTabOrder: vi.fn(),
  getTabPendingItems: vi.fn().mockResolvedValue([]),
}));
const fiscalBrowserReceiptAndLog = vi.fn();
vi.mock("@/lib/fiscalnet/log-attempt", () => ({
  fiscalBrowserReceiptAndLog: (...args: unknown[]) => fiscalBrowserReceiptAndLog(...args),
}));

Element.prototype.scrollTo = function scrollTo() {};
Element.prototype.scrollIntoView = function scrollIntoView() {};

const { PosRegister } = await import("@/components/app/PosRegister");

const summary = {
  openingCash: 0, cashSales: 0, cardSales: 0, expectedCash: 0, txCount: 0,
  topProduct: null, cashInTotal: 0, cashOutTotal: 0, cashOperations: [],
};
const products = [{ id: "p-espresso", name: "Espresso Test", sale_price: 9, vat_rate: 11, available_in_pos: true }];
const paymentMethods = [
  { id: "pm-cash", name: "Numerar", type: "cash" },
  { id: "pm-card", name: "Card", type: "card" },
];
const fiscalNet = {
  enabled: true, mockMode: false, connectionMode: "api" as const, apiHost: "http://localhost:65400",
  vatGroups: [], paymentTypeMap: { cash: 1 as const, card: 2 as const },
};

async function sell(txId: string) {
  localStorage.setItem("franchisetech:posLocale", "ro");
  completeSaleReturn.mockResolvedValue({
    ok: true, transactionId: txId, transactionNumber: "T1", total: 9, items: [], paymentType: "cash",
    cashSale: true, fiscalApiPending: true,
  });
  const { container } = render(
    <PosRegister
      products={products} categories={[]} paymentMethods={paymentMethods} summary={summary}
      sessionId="session-1" browserOffline={false} isRO appLocale="ro" fiscalNet={fiscalNet} currency="RON"
    />,
  );
  fireEvent.click(screen.getByText("Espresso Test"));
  fireEvent.click(screen.getByRole("button", { name: "Plată" }));
  fireEvent.click(screen.getAllByRole("button").find((b) => /^numerar$/i.test((b.textContent ?? "").trim()))!);
  fireEvent.submit(container.querySelector("form")!);
  await waitFor(() => expect(fiscalBrowserReceiptAndLog).toHaveBeenCalledTimes(1));
}

describe("PosRegister fiscal receipt alert", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    completeSaleReturn.mockReset();
    fiscalBrowserReceiptAndLog.mockReset();
  });
  afterEach(() => cleanup());

  it("warns the cashier when the cash register did not confirm the receipt", async () => {
    fiscalBrowserReceiptAndLog.mockResolvedValue({ ok: false, message: "Eroare casă: -111015 — Hartie", confirmation: "device_error" });
    await sell("tx-failed");
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("NU a fost confirmat de casa de marcat");
    expect(alert.textContent).toContain("9,00");
    expect(alert.textContent).toContain("Hartie");
    // Never invites a blind reprint: the receipt might have printed.
    expect(alert.textContent).toContain("Verificați pe casa de marcat dacă bonul a ieșit");
  });

  it("keeps the warning after the cashier starts the next sale, until dismissed", async () => {
    fiscalBrowserReceiptAndLog.mockResolvedValue({ ok: false, message: "Timeout — casa fiscală nu răspunde (>15s)." });
    await sell("tx-timeout");
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: /Vânzare nouă|Sale nouă|Vânzare/i }));
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Am verificat" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("flags a reply that confirms nothing", async () => {
    fiscalBrowserReceiptAndLog.mockResolvedValue({ ok: true, message: "Comandă trimisă.", confirmation: "unconfirmed" });
    await sell("tx-unconfirmed");
    expect((await screen.findByRole("alert")).textContent).toContain("nu a confirmat că a fost emis");
  });

  it("stays quiet when the cash register confirmed the receipt", async () => {
    fiscalBrowserReceiptAndLog.mockResolvedValue({ ok: true, message: "Bon fiscal emis. Nr: 12", receiptNumber: "12", confirmation: "confirmed" });
    await sell("tx-ok");
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
