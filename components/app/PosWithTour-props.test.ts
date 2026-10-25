import { beforeEach, describe, expect, it, vi } from "vitest";

const { writePosCatalogCache } = vi.hoisted(() => ({
  writePosCatalogCache: vi.fn(),
}));

vi.mock("@/components/app/PosRegister", () => ({ PosRegister: vi.fn() }));
vi.mock("@/lib/pos-offline-queue", () => ({
  invalidateProbeCache: vi.fn(),
  probeServerOnline: vi.fn(),
}));
vi.mock("@/lib/pos-catalog-cache", () => ({
  catalogCacheAgeLabel: vi.fn(),
  readPosCatalogCache: () => null,
  writePosCatalogCache,
}));

import { buildRegisterProps } from "@/components/app/PosWithTour";

describe("buildRegisterProps", () => {
  beforeEach(() => {
    writePosCatalogCache.mockClear();
  });

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

  it("does not synchronously persist the catalog while deriving render props", () => {
    buildRegisterProps({
      orgId: "org-1",
      products: [{ id: "product-1" }],
      categories: [],
      paymentMethods: [],
    } as never, true);

    expect(writePosCatalogCache).not.toHaveBeenCalled();
  });
});
