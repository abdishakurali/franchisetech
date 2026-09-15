import {
  fiscalBrowserReceipt,
  type BrowserFiscalConfig,
  type BrowserFiscalItem,
  type BrowserFiscalResult,
} from "./browser";

export interface RecordFiscalAttemptInput {
  transactionId: string;
  attemptNumber: number;
  status: "success" | "failed" | "timeout" | "ambiguous" | "mock_success";
  mockMode: boolean;
  responseContent: string | null;
  receiptNumber: string | null;
  errorCode: string | null;
  errorInfo: string | null;
}

export type RecordFiscalAttempt = (
  input: RecordFiscalAttemptInput
) => Promise<{ ok: boolean; attemptId?: string; error?: string }>;

// The FiscalNet agent call itself is time-bounded (callApi's AbortController,
// browser.ts, default 15s) — recordAttempt has no such bound of its own, and
// one call site (the offline-sync loop) awaits this whole function per queued
// entry. Without a cap here, a hung Supabase/network call for the logging
// step alone could stall that loop indefinitely — a real behavioural change
// from before this fix existed, not just "attempts now get logged". Capped
// shorter than completeSaleReturn's own 25s race in syncQueuedEntry, since
// this is a single lightweight write, not a full sale-recording transaction.
const RECORD_ATTEMPT_TIMEOUT_MS = 10_000;

async function recordAttemptWithTimeout(
  recordAttempt: RecordFiscalAttempt,
  input: RecordFiscalAttemptInput
): Promise<{ ok: boolean; attemptId?: string; error?: string }> {
  return Promise.race([
    recordAttempt(input),
    new Promise<{ ok: boolean; error: string }>((resolve) =>
      setTimeout(() => resolve({ ok: false, error: "record_fiscal_receipt_attempt timed out" }), RECORD_ATTEMPT_TIMEOUT_MS)
    ),
  ]);
}

/**
 * The single joined operation: the FiscalNet agent call and recording its
 * outcome happen inside one function, so a call site can't fire the receipt
 * without also logging what happened. Before this, fiscalBrowserReceipt ran
 * with zero DB visibility — the server never learned the outcome of a real
 * sale's fiscal receipt unless someone manually triggered a retry action
 * that, in practice, no UI has ever called.
 *
 * Not insert-pending-then-update-later: by the time recordAttempt is called
 * the outcome is already known (fiscalBrowserReceipt has already resolved),
 * so there is exactly one write per attempt, not two — nothing can be left
 * orphaned mid-flight the way a separate "log the attempt, then separately
 * resolve it" design could be.
 *
 * When FiscalNet is disabled (config.enabled === false), fiscalBrowserReceipt
 * doesn't actually attempt anything — recordAttempt is correspondingly not
 * called, since there is nothing to log.
 */
export async function fiscalBrowserReceiptAndLog(
  config: BrowserFiscalConfig,
  items: BrowserFiscalItem[],
  total: number,
  paymentType: string,
  ctx: {
    transactionId: string;
    attemptNumber?: number;
    recordAttempt: RecordFiscalAttempt;
  }
): Promise<BrowserFiscalResult> {
  const result = await fiscalBrowserReceipt(config, items, total, paymentType);

  if (!config.enabled) return result;

  const status: RecordFiscalAttemptInput["status"] = config.mockMode
    ? "mock_success"
    : result.ok
      ? "success"
      : "failed";

  const logResult = await recordAttemptWithTimeout(ctx.recordAttempt, {
    transactionId: ctx.transactionId,
    attemptNumber: ctx.attemptNumber ?? 1,
    status,
    mockMode: config.mockMode,
    responseContent: result.content ?? result.message ?? null,
    receiptNumber: result.receiptNumber ?? null,
    errorCode: result.ok ? null : "CLIENT_ERROR",
    errorInfo: result.ok ? null : result.message,
  }).catch((e: unknown) => ({ ok: false, error: e instanceof Error ? e.message : String(e) }));

  if (!logResult.ok) {
    console.error("[FiscalNet] failed to record receipt attempt", logResult.error);
  }

  return result;
}
