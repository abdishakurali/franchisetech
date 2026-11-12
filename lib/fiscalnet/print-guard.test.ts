import { beforeEach, describe, expect, it } from "vitest";
import { __resetFiscalPrintClaimsForTests, claimFiscalPrint, releaseFiscalPrint } from "@/lib/fiscalnet/print-guard";

function fakeStore() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe("fiscal print guard", () => {
  beforeEach(() => __resetFiscalPrintClaimsForTests());

  it("allows exactly one print per transaction", () => {
    const store = fakeStore();
    expect(claimFiscalPrint("tx-1", store)).toBe(true);
    expect(claimFiscalPrint("tx-1", store)).toBe(false);
    expect(claimFiscalPrint("tx-2", store)).toBe(true);
  });

  it("blocks a second tab that shares storage", () => {
    const shared = fakeStore();
    expect(claimFiscalPrint("tx-1", shared)).toBe(true);
    __resetFiscalPrintClaimsForTests(); // simulate other tab: fresh memory, same storage
    expect(claimFiscalPrint("tx-1", shared)).toBe(false);
  });

  it("can be released for a deliberate retry", () => {
    const store = fakeStore();
    claimFiscalPrint("tx-1", store);
    releaseFiscalPrint("tx-1", store);
    expect(claimFiscalPrint("tx-1", store)).toBe(true);
  });

  it("still guards within the tab when storage throws", () => {
    const broken = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(claimFiscalPrint("tx-1", broken)).toBe(true);
    expect(claimFiscalPrint("tx-1", broken)).toBe(false);
  });
});

describe("fiscalPrintClaimAgeMs", () => {
  it("returns the age of a stored claim and null when there is none", async () => {
    const { fiscalPrintClaimAgeMs } = await import("./print-guard");
    const store = new Map<string, string>();
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
    expect(fiscalPrintClaimAgeMs("tx-1", s, 10_000)).toBeNull();
    store.set("fiscal_print_claim:tx-1", new Date(1_000).toISOString());
    expect(fiscalPrintClaimAgeMs("tx-1", s, 181_000)).toBe(180_000);
  });
});
