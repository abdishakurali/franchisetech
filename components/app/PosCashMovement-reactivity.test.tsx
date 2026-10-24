// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PosI18nProvider } from "@/lib/pos-i18n-context";

const posCashMovement = vi.fn();
vi.mock("@/app/actions/kitchenops", () => ({
  addCustomerFromPos: vi.fn(),
  closePosSession: vi.fn(),
  completeSaleReturn: vi.fn(),
  posCashMovement: (...args: unknown[]) => posCashMovement(...args),
  voidTransaction: vi.fn(),
}));
vi.mock("@/app/actions/fiscalnet", () => ({ runZReport: vi.fn(), recordFiscalReceiptAttempt: vi.fn() }));
vi.mock("@/app/actions/loyalty", () => ({ getLoyaltyStampStatus: vi.fn(), recordLoyaltyRedemption: vi.fn() }));
vi.mock("@/app/actions/table-service", () => ({ sendTabOrder: vi.fn(), getTabPendingItems: vi.fn() }));

const { TillDialog } = await import("@/components/app/PosRegister");

describe("cash movement reactivity", () => {
  afterEach(() => {
    cleanup();
    posCashMovement.mockReset();
  });

  it("returns a confirmed movement to the live POS summary without a route refresh", async () => {
    posCashMovement.mockResolvedValue({ ok: true, idempotent: false });
    const onRecorded = vi.fn();
    render(
      <PosI18nProvider orgIsRO={false}>
        <TillDialog sessionId="session-1" onRecorded={onRecorded} />
      </PosI18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /cash/i }));
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: "Extra float" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => expect(onRecorded).toHaveBeenCalledTimes(1));
    const submitted = posCashMovement.mock.calls[0][0] as FormData;
    expect(submitted.get("client_reconciles")).toBe("1");
    expect(onRecorded).toHaveBeenCalledWith(expect.objectContaining({
      movement_type: "cash_in",
      amount: 25,
      reason: "Extra float",
    }));
  });
});
