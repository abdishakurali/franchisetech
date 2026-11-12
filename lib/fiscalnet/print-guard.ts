/**
 * Client-side guard so one POS transaction is sent to FiscalNet at most once
 * per browser (all tabs). The server already refuses to request a second print
 * once the receipt status is final; this closes the window where a print is
 * still in flight and a replay/second tab sees status `api_pending`.
 *
 * A failed print can be retried deliberately with releaseFiscalPrint().
 */

const PREFIX = "fiscal_print_claim:";
const memoryClaims = new Set<string>();

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function storage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/** Returns true if the caller may print this transaction now. */
export function claimFiscalPrint(transactionId: string, store: StorageLike | null = storage()): boolean {
  if (!transactionId) return false;
  if (memoryClaims.has(transactionId)) return false;
  try {
    if (store?.getItem(PREFIX + transactionId)) return false;
    store?.setItem(PREFIX + transactionId, new Date().toISOString());
  } catch {
    // storage unavailable — fall back to this tab's memory only
  }
  memoryClaims.add(transactionId);
  return true;
}

/** Allow a later explicit retry (e.g. the print definitely failed before reaching the device). */
export function releaseFiscalPrint(transactionId: string, store: StorageLike | null = storage()): void {
  memoryClaims.delete(transactionId);
  try {
    store?.removeItem(PREFIX + transactionId);
  } catch {
    // ignore
  }
}

/**
 * Age of this browser's stored claim in ms, or null when there is none.
 * Used only by the missing-receipt recovery screen.
 */
export function fiscalPrintClaimAgeMs(
  transactionId: string,
  store: StorageLike | null = storage(),
  now: number = Date.now(),
): number | null {
  try {
    const raw = store?.getItem(PREFIX + transactionId);
    if (!raw) return null;
    const t = Date.parse(raw);
    return Number.isFinite(t) ? Math.max(0, now - t) : null;
  } catch {
    return null;
  }
}

/** Test helper. */
export function __resetFiscalPrintClaimsForTests() {
  memoryClaims.clear();
}
