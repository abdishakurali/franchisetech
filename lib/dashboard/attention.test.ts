import { describe, expect, it } from "vitest";
import { FISCAL_STUCK_PENDING_MS, fiscalNotConfirmedFilter } from "@/lib/dashboard/attention";

describe("fiscalNotConfirmedFilter", () => {
  const now = new Date("2026-11-12T12:50:00.000Z");

  it("keeps the explicit failure statuses", () => {
    expect(fiscalNotConfirmedFilter(now)).toContain("fiscal_receipt_status.in.(failed,timeout,ambiguous)");
  });

  it("counts api_pending only once it is older than the grace period", () => {
    const cutoff = new Date(now.getTime() - FISCAL_STUCK_PENDING_MS).toISOString();
    expect(cutoff).toBe("2026-11-12T12:45:00.000Z");
    expect(fiscalNotConfirmedFilter(now)).toContain(
      `and(fiscal_receipt_status.eq.api_pending,sold_at.lt.${cutoff})`,
    );
  });

  it("never counts confirmed or not-required receipts", () => {
    const f = fiscalNotConfirmedFilter(now);
    expect(f).not.toContain("success");
    expect(f).not.toContain("not_required");
  });
});
