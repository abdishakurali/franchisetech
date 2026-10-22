// @vitest-environment jsdom
//
// Duplicate-order protection on the client: a double tap on "Încasează" must
// reach the server once, and any resend of the same checkout attempt must
// carry the same idempotency key so post_pos_document returns the existing
// sale instead of recording a second one.

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

// jsdom does not implement scrolling.
Element.prototype.scrollTo = function scrollTo() {};
Element.prototype.scrollIntoView = function scrollIntoView() {};

const { PosRegister } = await import("@/components/app/PosRegister");

const summary = {
  openingCash: 0,
  cashSales: 0,
  cardSales: 0,
  expectedCash: 0,
  txCount: 0,
  topProduct: null,
  cashInTotal: 0,
  cashOutTotal: 0,
  cashOperations: [],
};

const products = [{ id: "p-espresso", name: "Espresso Test", sale_price: 9, vat_rate: 11, available_in_pos: true }];
const paymentMethods = [
  { id: "pm-cash", name: "Numerar", type: "cash" },
  { id: "pm-card", name: "Card", type: "card" },
];

function keyOf(call: unknown[]): string {
  return (call[0] as FormData).get("idempotency_key") as string;
}

function renderRegister() {
  const utils = render(
    <PosRegister
      products={products}
      categories={[]}
      paymentMethods={paymentMethods}
      summary={summary}
      sessionId="session-1"
      browserOffline={false}
    />,
  );
  fireEvent.click(screen.getByText("Espresso Test"));
  const payButton = screen.getAllByRole("button").find((b) => /^(plată|pay)$/i.test((b.textContent ?? "").trim()));
  if (!payButton) throw new Error("pay button not rendered");
  fireEvent.click(payButton);
  const cashTiles = screen.getAllByRole("button").filter((b) => /^(numerar|cash)$/i.test((b.textContent ?? "").trim()));
  fireEvent.click(cashTiles[0]);
  const form = utils.container.querySelector("form");
  if (!form) throw new Error("checkout form not rendered");
  return { ...utils, form };
}

describe("PosRegister duplicate submission", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    completeSaleReturn.mockReset();
  });

  afterEach(() => cleanup());

  it("sends one request when the charge form is submitted twice in the same tick", async () => {
    let resolveSale: (v: unknown) => void = () => {};
    completeSaleReturn.mockImplementation(() => new Promise((r) => { resolveSale = r; }));
    const { form } = renderRegister();

    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(completeSaleReturn).toHaveBeenCalledTimes(1));
    resolveSale({ ok: true, transactionId: "tx-1", transactionNumber: "T1", total: 9, items: [], paymentType: "cash", cashSale: true, fiscalApiPending: false });
    await new Promise((r) => setTimeout(r, 20));
    expect(completeSaleReturn).toHaveBeenCalledTimes(1);
  });

  it("reuses the same idempotency key when the same sale is submitted again after a failure", async () => {
    completeSaleReturn.mockResolvedValueOnce({ ok: false, error: "Eroare de rețea", code: "unknown" });
    const { form } = renderRegister();

    fireEvent.submit(form);
    await waitFor(() => expect(completeSaleReturn).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 20));

    completeSaleReturn.mockResolvedValueOnce({ ok: true, transactionId: "tx-1", transactionNumber: "T1", total: 9, items: [], paymentType: "cash", cashSale: true, fiscalApiPending: false, idempotent: true });
    fireEvent.submit(form);
    await waitFor(() => expect(completeSaleReturn).toHaveBeenCalledTimes(2));

    const [first, second] = completeSaleReturn.mock.calls;
    expect(keyOf(first)).toBeTruthy();
    expect(keyOf(second)).toBe(keyOf(first));
  });
});
