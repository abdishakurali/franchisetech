import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/app/PosRegister", () => ({ PosRegister: vi.fn() }));
vi.mock("@/lib/pos-offline-queue", () => ({
  invalidateProbeCache: vi.fn(),
  probeServerOnline: vi.fn(),
}));
vi.mock("@/lib/pos-catalog-cache", () => ({
  catalogCacheAgeLabel: vi.fn(),
  readPosCatalogCache: () => null,
  writePosCatalogCache: vi.fn(),
}));

import { buildRegisterProps } from "@/components/app/PosWithTour";

describe("buildRegisterProps", () => {
  it("passes the owner's verified offline state to PosRegister", () => {
    const props = {
      products: [],
      categories: [],
      paymentMethods: [],
      summary: {
        openingCash: 0,
        cashSales: 0,
        cardSales: 0,
        expectedCash: 0,
        txCount: 0,
        topProduct: null,
        cashInTotal: 0,
        cashOutTotal: 0,
        cashOperations: [],
      },
    };

    expect(buildRegisterProps(props, true).browserOffline).toBe(true);
    expect(buildRegisterProps(props, false).browserOffline).toBe(false);
  });
});
