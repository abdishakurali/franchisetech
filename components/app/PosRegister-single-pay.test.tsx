// @vitest-environment jsdom
//
// The order step shows ONE "Plată" button instead of separate Numerar/Card
// tiles. Tapping it opens the payment step, where the cashier picks the
// method. The sale payload must be exactly what the old cash tile produced.

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

function renderRegister() {
  localStorage.setItem("franchisetech:posLocale", "ro");
  const utils = render(
    <PosRegister
      products={products}
      categories={[]}
      paymentMethods={paymentMethods}
      summary={summary}
      sessionId="session-1"
      browserOffline={false}
      isRO
      appLocale="ro"
    />,
  );
  fireEvent.click(screen.getByText("Espresso Test"));
  return utils;
}

function methodButtons() {
  return screen.getAllByRole("button").filter((b) => /^(numerar|card)$/i.test((b.textContent ?? "").trim()));
}

describe("PosRegister single Plată button", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    completeSaleReturn.mockReset();
  });

  afterEach(() => cleanup());

  it("shows one Plată button and no Numerar/Card tiles on the order step", () => {
    renderRegister();
    const pay = screen.getAllByRole("button", { name: "Plată" });
    expect(pay).toHaveLength(1);
    expect(pay[0].getAttribute("data-tour")).toBe("pos-charge");
    expect(pay[0].hasAttribute("disabled")).toBe(false);
    expect(methodButtons()).toHaveLength(0);
  });

  it("is disabled while the cart is empty", () => {
    localStorage.setItem("franchisetech:posLocale", "ro");
    render(
      <PosRegister
        products={products}
        categories={[]}
        paymentMethods={paymentMethods}
        summary={summary}
        sessionId="session-1"
        browserOffline={false}
        isRO
        appLocale="ro"
      />,
    );
    expect(screen.getByRole("button", { name: "Plată" }).hasAttribute("disabled")).toBe(true);
  });

  it("opens the payment step with the Numerar/Card choice", () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: "Plată" }));
    const labels = methodButtons().map((b) => (b.textContent ?? "").trim().toLowerCase());
    expect(labels).toEqual(["numerar", "card"]);
  });

  it("selecting Numerar then charging sends the same payload as the old cash tile", async () => {
    completeSaleReturn.mockResolvedValue({ ok: true, transactionId: "tx-1", transactionNumber: "T1", total: 9, items: [], paymentType: "cash", cashSale: true, fiscalApiPending: false });
    const { container } = renderRegister();
    fireEvent.click(screen.getByRole("button", { name: "Plată" }));
    fireEvent.click(methodButtons().find((b) => /numerar/i.test(b.textContent ?? ""))!);

    const form = container.querySelector("form");
    if (!form) throw new Error("checkout form not rendered");
    fireEvent.submit(form);
    await waitFor(() => expect(completeSaleReturn).toHaveBeenCalledTimes(1));

    const fd = completeSaleReturn.mock.calls[0][0] as FormData;
    expect(fd.get("payment_method_id")).toBe("pm-cash");
    expect(fd.get("payment_type")).toBe("cash");
    expect(fd.get("idempotency_key")).toBeTruthy();
    // Cash pre-filled to the exact amount, exactly as the old cash tile did.
    expect(fd.get("cash_received")).toBe("9.00");
    expect(fd.get("change_due")).toBe("0.00");
    const items = JSON.parse(fd.get("cart_json") as string);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ product_id: "p-espresso", quantity: 1, unit_price: 9 });
  });
});
