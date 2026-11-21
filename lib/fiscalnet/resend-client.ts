/**
 * Browser side of "send the fiscal receipt again".
 *
 * begin (server: lock + pending attempt row + `printing`) → one call to the
 * local FiscalNet agent → finish (server: record the answer). If begin is
 * refused, nothing is sent to the printer. The printer is called at most once
 * per call of this function, and the server refuses a second begin while the
 * first is still `printing`.
 */

import { fiscalBrowserReceipt, type BrowserFiscalConfig, type BrowserFiscalResult } from "./browser";
import { fiscalAttemptStatus, RECORD_ATTEMPT_TIMEOUT_MS } from "./log-attempt";
import { PRINTER_CHECKED_VALUE } from "./resend";
import type { BeginResendResult } from "@/app/actions/fiscal-resend";

export type ResendDeps = {
  begin: (fd: FormData) => Promise<BeginResendResult>;
  finish: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  /** Injected in tests; defaults to the real browser call. */
  send?: typeof fiscalBrowserReceipt;
};

export type ResendOutcome =
  | { kind: "refused"; message: string }
  | { kind: "sent"; result: BrowserFiscalResult; confirmed: boolean; logged: boolean };

export async function resendFiscalReceipt(
  config: BrowserFiscalConfig,
  transactionId: string,
  deps: ResendDeps,
): Promise<ResendOutcome> {
  const beginFd = new FormData();
  beginFd.set("transaction_id", transactionId);
  beginFd.set("printer_checked", PRINTER_CHECKED_VALUE);
  const begun = await deps.begin(beginFd);
  if (!begun.ok) return { kind: "refused", message: begun.message };

  const send = deps.send ?? fiscalBrowserReceipt;
  let result: BrowserFiscalResult;
  try {
    result = await send(config, begun.items, begun.total, begun.paymentType, begun.paymentCode);
  } catch (e) {
    // buildFiscalNetReceiptLines throws on a missing VAT group / payment code:
    // nothing reached the printer.
    result = { ok: false, message: e instanceof Error ? e.message : String(e) };
  }

  const status = fiscalAttemptStatus(config, result);
  const finishFd = new FormData();
  finishFd.set("attempt_id", begun.attemptId);
  finishFd.set("status", status);
  const response = result.rawResponse ?? result.content ?? result.message ?? "";
  if (response) finishFd.set("response_content", response);
  if (result.receiptNumber) finishFd.set("receipt_number", result.receiptNumber);
  if (!result.ok) {
    finishFd.set("error_code", result.errorCode ?? "CLIENT_ERROR");
    finishFd.set("error_info", result.message);
  }
  const logged = await Promise.race([
    deps.finish(finishFd).then((r) => r.ok, () => false),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), RECORD_ATTEMPT_TIMEOUT_MS)),
  ]);
  if (!logged) console.error("[FiscalNet] resend answer not recorded", { transactionId, attemptId: begun.attemptId });

  return { kind: "sent", result, confirmed: status === "success" || status === "mock_success", logged };
}
