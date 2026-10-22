/**
 * What completeSaleReturn may do after post_pos_document returns.
 *
 * A replay (same idempotency key → RPC answers `idempotent: true`) must be a
 * pure read: no fiscal status reset, no second kitchen ticket, no duplicate
 * analytics, and — critically — no instruction to the browser to print a
 * second fiscal receipt once one was printed.
 */

export const FISCAL_PRINT_PENDING_STATUSES = ["api_pending", "pending"] as const;

export type PostSaleEffects = {
  /** Write fiscal_receipt_required/status on the transaction. */
  markFiscalStatus: boolean;
  /** Tell the browser to send the receipt to FiscalNet. */
  fiscalApiPending: boolean;
  /** Kitchen ticket, tab settlement, growth milestone, PostHog. */
  runFirstTimeSideEffects: boolean;
};

export function planPostSaleEffects(input: {
  idempotent: boolean;
  fiscalEnabled: boolean;
  fiscalApiMode: boolean;
  /** Current fiscal_receipt_status of the existing row (replays only). */
  existingFiscalStatus?: string | null;
}): PostSaleEffects {
  if (!input.idempotent) {
    return {
      markFiscalStatus: input.fiscalEnabled,
      fiscalApiPending: input.fiscalEnabled && input.fiscalApiMode,
      runFirstTimeSideEffects: true,
    };
  }
  const stillPending = (FISCAL_PRINT_PENDING_STATUSES as readonly string[]).includes(
    input.existingFiscalStatus ?? "",
  );
  return {
    markFiscalStatus: false,
    // The first response may have been lost (timeout) before the browser could
    // print; only then is printing on replay correct.
    fiscalApiPending: input.fiscalEnabled && input.fiscalApiMode && stillPending,
    runFirstTimeSideEffects: false,
  };
}
