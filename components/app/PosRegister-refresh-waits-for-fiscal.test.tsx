// @vitest-environment jsdom
//
// The till refreshes itself ~1.5s after a sale. router.refresh() becomes a full
// page reload when the server answers with a new build, a redirect or an error,
// and a reload cancels the FiscalNet request still waiting for the cash
// register. In production (2026-10-27..2026-11-12) every Dolce Nera sale left
// without a confirmed receipt (8 of 8) had a page leave ~1s after the sale.
// The refresh must therefore wait until the receipt has its answer.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const routerRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: routerRefresh, replace: vi.fn() }),
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

describe("PosRegister till refresh vs. fiscal receipt in flight", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    completeSaleReturn.mockReset();
    fiscalBrowserReceiptAndLog.mockReset();
    routerRefresh.mockReset();
  });
  afterEach(() => cleanup());

  it("does not refresh (and so cannot reload) the page until the cash register answers", async () => {
    let answer!: (v: unknown) => void;
    fiscalBrowserReceiptAndLog.mockReturnValue(new Promise((r) => { answer = r; }));
    await sell("tx-slow-printer");
    // Past the 1.5s refresh delay, with the receipt still in flight.
    await new Promise((r) => setTimeout(r, 1800));
    expect(routerRefresh).not.toHaveBeenCalled();
    answer({ ok: true, message: "Bon fiscal emis. Nr: 7", receiptNumber: "7", confirmation: "confirmed" });
    await waitFor(() => expect(routerRefresh).toHaveBeenCalledTimes(1), { timeout: 2500 });
  }, 10_000);

  it("refreshes after a failed receipt too, once its answer is in", async () => {
    let answer!: (v: unknown) => void;
    fiscalBrowserReceiptAndLog.mockReturnValue(new Promise((r) => { answer = r; }));
    await sell("tx-failed-printer");
    await new Promise((r) => setTimeout(r, 1700));
    expect(routerRefresh).not.toHaveBeenCalled();
    answer({ ok: false, message: "Nu se poate contacta casa fiscală." });
    await waitFor(() => expect(routerRefresh).toHaveBeenCalledTimes(1), { timeout: 2500 });
    expect(screen.getByRole("alert").textContent).toContain("NU a fost confirmat");
  }, 10_000);

  it("refreshes on the normal 1.5s schedule when the receipt answers quickly", async () => {
    fiscalBrowserReceiptAndLog.mockResolvedValue({ ok: true, message: "Bon fiscal emis. Nr: 8", receiptNumber: "8", confirmation: "confirmed" });
    await sell("tx-fast-printer");
    await waitFor(() => expect(routerRefresh).toHaveBeenCalledTimes(1), { timeout: 2500 });
  }, 10_000);
});
