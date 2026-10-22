/**
 * One checkout attempt = one idempotency key.
 *
 * The key must survive double taps, retries, timeouts and a page reload
 * mid-request, so post_pos_document can return the already-saved sale instead
 * of recording a second one. It changes only when the sale itself changes
 * (different lines/total/session) or after the attempt is confirmed saved or
 * queued (the caller clears it then).
 *
 * Payment method is deliberately NOT part of the fingerprint: if a cash
 * attempt timed out but was saved, switching to card must still resolve to the
 * existing sale rather than charge the customer twice.
 */

export type SaleAttempt = {
  key: string;
  fingerprint: string;
};

export type SaleAttemptLine = {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_pct?: number;
};

export function saleAttemptFingerprint(
  sessionId: string | null | undefined,
  lines: SaleAttemptLine[],
  dueTotal: number,
): string {
  const normalized = lines
    .map((l) => `${l.product_id}:${Number(l.quantity)}:${Number(l.unit_price).toFixed(2)}:${Number(l.discount_pct ?? 0)}`)
    .sort()
    .join("|");
  return `${sessionId ?? ""}#${normalized}#${Number(dueTotal).toFixed(2)}`;
}

export function resolveSaleAttempt(
  current: SaleAttempt | null | undefined,
  fingerprint: string,
  makeKey: () => string = () => crypto.randomUUID(),
): SaleAttempt {
  if (current && current.key && current.fingerprint === fingerprint) return current;
  return { key: makeKey(), fingerprint };
}

export function isSaleAttempt(value: unknown): value is SaleAttempt {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SaleAttempt).key === "string" &&
    (value as SaleAttempt).key.length > 0 &&
    typeof (value as SaleAttempt).fingerprint === "string"
  );
}
