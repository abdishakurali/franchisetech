// @vitest-environment jsdom
//
// Covers the one link in the offline-sync chain that isn't exercised by the
// pure-function tests in lib/pos-offline-sync.test.ts and
// components/app/PosWithTour-props.test.ts: does PosRegister's own flush
// effect actually re-fire when the browserOffline PROP changes from true to
// false, the way React's dependency-array semantics are assumed to behave.
// That assumption was traced by hand, not tested, when browserOffline was
// wired up — this closes that gap without touching PosRegister.tsx itself.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

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
vi.mock("@/app/actions/fiscalnet", () => ({ runZReport: vi.fn() }));
vi.mock("@/app/actions/loyalty", () => ({
  getLoyaltyStampStatus: vi.fn().mockResolvedValue(null),
  recordLoyaltyRedemption: vi.fn(),
}));
vi.mock("@/app/actions/table-service", () => ({
  sendTabOrder: vi.fn(),
  getTabPendingItems: vi.fn().mockResolvedValue([]),
}));

const { PosRegister } = await import("@/components/app/PosRegister");
const { enqueueOfflineSale } = await import("@/lib/pos-offline-queue");

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

const products: never[] = [];
const categories: never[] = [];
const paymentMethods: never[] = [];

describe("PosRegister offline flush effect", () => {
  beforeEach(() => {
    localStorage.clear();
    completeSaleReturn.mockReset();
    completeSaleReturn.mockResolvedValue({
      ok: true,
      transactionId: "tx-1",
      total: 10,
      items: [],
      paymentType: "cash",
      fiscalApiPending: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("does not flush while browserOffline is true, then flushes on the prop flipping to false", async () => {
    enqueueOfflineSale(
      { idempotency_key: "queued-sale-1", cart_json: "[]" },
      "1 produs · 10 RON",
    );

    const { rerender } = render(
      <PosRegister
        products={products}
        categories={categories}
        paymentMethods={paymentMethods}
        summary={summary}
        browserOffline={true}
      />,
    );

    // Give any mount-time effects a tick, then confirm nothing synced while offline.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(completeSaleReturn).not.toHaveBeenCalled();

    rerender(
      <PosRegister
        products={products}
        categories={categories}
        paymentMethods={paymentMethods}
        summary={summary}
        browserOffline={false}
      />,
    );

    await waitFor(() => expect(completeSaleReturn).toHaveBeenCalledTimes(1));
  });
});
