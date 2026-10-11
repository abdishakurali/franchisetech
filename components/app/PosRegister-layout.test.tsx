// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/app/actions/kitchenops", () => ({
  addCustomerFromPos: vi.fn(),
  closePosSession: vi.fn(),
  completeSaleReturn: vi.fn(),
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

describe("PosRegister product grid density", () => {
  afterEach(cleanup);

  it("renders six compact product tiles per desktop row", () => {
    const { container } = render(
      <PosRegister
        products={[{
          id: "espresso",
          name: "Espresso",
          sale_price: 8,
          image_url: "/missing-espresso.jpg",
          placeholder_type: "coffee",
          pos_category: { id: "coffee", name: "Cafea", color: null },
        }]}
        categories={[{ id: "coffee", name: "Cafea", color: null }]}
        paymentMethods={[]}
        summary={summary}
      />,
    );

    const grid = container.querySelector('[data-tour="pos-product"] > .grid');
    const tile = screen.getByRole("button", { name: /Espresso/i });
    fireEvent.error(screen.getByRole("img", { name: "Espresso" }));
    const icon = tile.querySelector("svg");

    expect(grid?.classList.contains("lg:grid-cols-6")).toBe(true);
    expect(tile.classList.contains("min-h-[112px]")).toBe(true);
    expect(icon?.classList.contains("h-[18px]")).toBe(true);
    expect(icon?.classList.contains("w-[18px]")).toBe(true);
  });
});
