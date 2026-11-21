import { beforeEach, describe, expect, it, vi } from "vitest";

const getActiveOrg = vi.fn();
const rpc = vi.fn();
const fromService = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/kitchenops/data", () => ({
  getActiveOrg: () => getActiveOrg(),
  stringValue: (fd: FormData, k: string) => String(fd.get(k) ?? "").trim(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: async () => ({ rpc: (...a: unknown[]) => rpc(...a), from: (...a: unknown[]) => fromService(...a) }),
}));

const { beginFiscalReceiptResend } = await import("@/app/actions/fiscal-resend");

/** Minimal chainable PostgREST stand-in that resolves to `result`. */
function query(result: unknown) {
  const q: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit"]) q[m] = () => q;
  q.maybeSingle = async () => result;
  q.single = async () => result;
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve(result).then(ok);
  return q;
}

function org(role: string, openSession: string | null = "sess-open") {
  getActiveOrg.mockResolvedValue({
    orgId: "org-1",
    user: { id: "user-1" },
    membership: { role, organisations: { country_code: "RO", fiscalnet_enabled: true } },
    supabase: { from: () => query({ data: openSession ? { id: openSession } : null }) },
  });
}

function fd(extra: Record<string, string> = {}) {
  const f = new FormData();
  f.set("transaction_id", "tx-1");
  f.set("printer_checked", "nu-a-iesit");
  for (const [k, v] of Object.entries(extra)) f.set(k, v);
  return f;
}

beforeEach(() => {
  getActiveOrg.mockReset();
  rpc.mockReset();
  fromService.mockReset();
});

describe("beginFiscalReceiptResend", () => {
  it("refuses unless the printer check was confirmed, before touching the database", async () => {
    org("owner");
    const f = fd();
    f.delete("printer_checked");
    expect(await beginFiscalReceiptResend(f)).toMatchObject({ ok: false, message: expect.stringMatching(/verificat casa/) });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("refuses roles that cannot transact", async () => {
    org("accountant");
    expect(await beginFiscalReceiptResend(fd())).toMatchObject({ ok: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("refuses a cashier when no till session is open", async () => {
    org("cashier", null);
    expect(await beginFiscalReceiptResend(fd())).toMatchObject({ ok: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("a cashier is limited to the open till session; a manager is not", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "RESEND_NOT_SAME_SESSION" } });
    org("cashier");
    expect(await beginFiscalReceiptResend(fd())).toMatchObject({ ok: false, message: expect.stringMatching(/manager/) });
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_transaction_id: "tx-1", p_required_session_id: "sess-open", p_stuck_minutes: 5 });

    org("manager");
    await beginFiscalReceiptResend(fd());
    expect(rpc.mock.calls[1][1]).toMatchObject({ p_required_session_id: null });
  });

  it("returns the saved sale's lines once the database granted the resend", async () => {
    org("owner");
    rpc.mockResolvedValue({ data: { attempt_id: "att-2", attempt_number: 2 }, error: null });
    fromService.mockImplementation((table: string) =>
      table === "pos_transactions"
        ? query({
            data: {
              transaction_number: "KO-1",
              total: 18,
              payment_methods: { type: "cash", fiscalnet_code: 1 },
              pos_transaction_items: [
                { product_name: "B", quantity: 1, unit_price: 9, vat_rate: 11, discount_pct: 0, created_at: "2026-11-21T10:00:02Z" },
                { product_name: "A", quantity: 1, unit_price: 9, vat_rate: 11, discount_pct: 0, created_at: "2026-11-21T10:00:01Z" },
              ],
            },
          })
        : query({ data: [{ rate: 11, fiscalnet_vat_group: 2 }] }),
    );
    const res = await beginFiscalReceiptResend(fd());
    expect(res).toEqual({
      ok: true, attemptId: "att-2", attemptNumber: 2, transactionNumber: "KO-1", total: 18, paymentType: "cash", paymentCode: 1,
      items: [
        { productName: "A", quantity: 1, unitPrice: 9, vatRate: 11, fiscalNetGroup: 2 },
        { productName: "B", quantity: 1, unitPrice: 9, vatRate: 11, fiscalNetGroup: 2 },
      ],
    });
  });

  it("closes the attempt as failed when the sale has no lines (nothing is sent)", async () => {
    org("owner");
    rpc.mockResolvedValueOnce({ data: { attempt_id: "att-2", attempt_number: 2 }, error: null }).mockResolvedValueOnce({ data: {}, error: null });
    fromService.mockImplementation((table: string) => query(table === "pos_transactions" ? { data: { transaction_number: "KO-1", total: 9, pos_transaction_items: [] } } : { data: [] }));
    expect(await beginFiscalReceiptResend(fd())).toMatchObject({ ok: false });
    expect(rpc.mock.calls[1][0]).toBe("finish_fiscal_receipt_resend");
    expect(rpc.mock.calls[1][1]).toMatchObject({ p_attempt_id: "att-2", p_status: "failed", p_error_code: "RESEND_NO_LINES" });
  });
});
