import { describe, expect, it } from "vitest";
import { planPostSaleEffects } from "@/lib/pos-sale-replay";

describe("planPostSaleEffects", () => {
  it("first save marks fiscal status and asks the browser to print", () => {
    expect(planPostSaleEffects({ idempotent: false, fiscalEnabled: true, fiscalApiMode: true })).toEqual({
      markFiscalStatus: true,
      fiscalApiPending: true,
      runFirstTimeSideEffects: true,
    });
  });

  it("replay after a successful print never prints again or resets status", () => {
    expect(
      planPostSaleEffects({ idempotent: true, fiscalEnabled: true, fiscalApiMode: true, existingFiscalStatus: "success" }),
    ).toEqual({ markFiscalStatus: false, fiscalApiPending: false, runFirstTimeSideEffects: false });
  });

  it("replay after a lost response still prints if the receipt is pending", () => {
    const effects = planPostSaleEffects({
      idempotent: true,
      fiscalEnabled: true,
      fiscalApiMode: true,
      existingFiscalStatus: "api_pending",
    });
    expect(effects.fiscalApiPending).toBe(true);
    expect(effects.markFiscalStatus).toBe(false);
    expect(effects.runFirstTimeSideEffects).toBe(false);
  });

  it("replay with failed/unknown status does not auto-print (needs a human retry)", () => {
    for (const status of ["failed", "error", null, undefined]) {
      expect(
        planPostSaleEffects({ idempotent: true, fiscalEnabled: true, fiscalApiMode: true, existingFiscalStatus: status })
          .fiscalApiPending,
      ).toBe(false);
    }
  });

  it("fiscal disabled never prints", () => {
    expect(planPostSaleEffects({ idempotent: false, fiscalEnabled: false, fiscalApiMode: true }).fiscalApiPending).toBe(false);
  });
});
