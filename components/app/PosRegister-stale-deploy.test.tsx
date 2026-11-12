// @vitest-environment jsdom
//
// Incident 2026-11-12: a deploy while the till was open made the next sale
// throw "Failed to find Server Action"; the till reloaded and the sale's
// fiscal receipt was never sent. Now the sale is kept in the persisted offline
// queue (same payload, same idempotency key) before the reload, so the queue
// re-sends it after the reload and the receipt goes out once.

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

Element.prototype.scrollTo = function scrollTo() {};
Element.prototype.scrollIntoView = function scrollIntoView() {};

const { PosRegister } = await import("@/components/app/PosRegister");
const { listOfflineQueue } = await import("@/lib/pos-offline-queue");

const summary = {
  openingCash: 0, cashSales: 0, cardSales: 0, expectedCash: 0, txCount: 0,
  topProduct: null, cashInTotal: 0, cashOutTotal: 0, cashOperations: [],
};
const products = [{ id: "p-espresso", name: "Espresso Test", sale_price: 9, vat_rate: 11, available_in_pos: true }];
const paymentMethods = [{ id: "pm-cash", name: "Numerar", type: "cash" }];

function checkout() {
  const utils = render(
    <PosRegister products={products} categories={[]} paymentMethods={paymentMethods} summary={summary} sessionId="session-1" browserOffline={false} />,
  );
  fireEvent.click(screen.getByText("Espresso Test"));
  const payButton = screen.getAllByRole("button").find((b) => /^(plată|pay)$/i.test((b.textContent ?? "").trim()));
  if (!payButton) throw new Error("pay button not rendered");
  fireEvent.click(payButton);
  const cashTile = screen.getAllByRole("button").find((b) => /^(numerar|cash)$/i.test((b.textContent ?? "").trim()));
  if (cashTile) fireEvent.click(cashTile);
  const form = utils.container.querySelector("form");
  if (!form) throw new Error("checkout form not rendered");
  return form;
}

describe("PosRegister after a deploy (stale server action)", () => {
  const reload = vi.fn();
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    completeSaleReturn.mockReset();
    reload.mockReset();
    Object.defineProperty(window, "location", { value: { ...window.location, reload }, writable: true });
  });
  afterEach(() => cleanup());

  it("keeps the sale in the offline queue with its idempotency key before reloading", async () => {
    // First call: the stale bundle error. Later calls (the queue flush) succeed.
    completeSaleReturn
      .mockRejectedValueOnce(new Error("Failed to find Server Action 'abc123'"))
      .mockResolvedValue({ ok: true, transactionId: "tx-1", transactionNumber: "T1", total: 9, items: [], paymentType: "cash", cashSale: true, fiscalApiPending: false, idempotent: true });
    const form = checkout();
    fireEvent.submit(form);

    await waitFor(() => expect(completeSaleReturn).toHaveBeenCalled());
    const firstKey = (completeSaleReturn.mock.calls[0][0] as FormData).get("idempotency_key");
    await waitFor(() => {
      const queued = listOfflineQueue();
      // Either still queued, or already re-sent by the flush with the same key.
      const resentWithSameKey = completeSaleReturn.mock.calls
        .slice(1)
        .some((c) => (c[0] as FormData).get("idempotency_key") === firstKey);
      expect(queued.some((q) => q.payload.idempotency_key === firstKey) || resentWithSameKey).toBe(true);
    });
    expect(firstKey).toBeTruthy();
    expect(screen.getAllByText(/bonul fiscal se trimit automat/i).length).toBeGreaterThan(0);
    await waitFor(() => expect(reload).toHaveBeenCalled(), { timeout: 3000 });
  });
});
