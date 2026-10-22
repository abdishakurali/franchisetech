import { describe, expect, it } from "vitest";
import { resolveSaleAttempt, saleAttemptFingerprint, isSaleAttempt } from "@/lib/pos-sale-attempt";
import { parseCartBackupRestore } from "@/lib/pos-cart-backup";

const lines = [
  { product_id: "espresso", quantity: 2, unit_price: 9, discount_pct: 0 },
  { product_id: "croissant", quantity: 1, unit_price: 12.5 },
];

function counter() {
  let n = 0;
  return () => `key-${++n}`;
}

describe("sale attempt idempotency key", () => {
  it("keeps the same key for repeated submits of the same sale (double tap, retry)", () => {
    const makeKey = counter();
    const fp = saleAttemptFingerprint("session-1", lines, 30.5);
    const first = resolveSaleAttempt(null, fp, makeKey);
    const second = resolveSaleAttempt(first, fp, makeKey);
    const third = resolveSaleAttempt(second, saleAttemptFingerprint("session-1", [...lines].reverse(), 30.5), makeKey);
    expect(first.key).toBe("key-1");
    expect(second.key).toBe("key-1");
    expect(third.key).toBe("key-1");
  });

  it("issues a new key when the sale changes", () => {
    const makeKey = counter();
    const first = resolveSaleAttempt(null, saleAttemptFingerprint("session-1", lines, 30.5), makeKey);
    const changedQty = resolveSaleAttempt(
      first,
      saleAttemptFingerprint("session-1", [{ ...lines[0], quantity: 3 }, lines[1]], 39.5),
      makeKey,
    );
    expect(changedQty.key).not.toBe(first.key);
  });

  it("issues a new key for the next identical sale once the attempt is cleared after success", () => {
    const makeKey = counter();
    const fp = saleAttemptFingerprint("session-1", lines, 30.5);
    const first = resolveSaleAttempt(null, fp, makeKey);
    // Caller clears the attempt (null) after a confirmed save.
    const nextCustomer = resolveSaleAttempt(null, fp, makeKey);
    expect(nextCustomer.key).not.toBe(first.key);
  });

  it("restores the in-flight attempt from the cart backup after a reload", () => {
    const fp = saleAttemptFingerprint("session-1", lines, 30.5);
    const attempt = { key: "key-before-reload", fingerprint: fp };
    const raw = JSON.stringify({ cart: lines.map((l) => ({ ...l, product_name: l.product_id, vat_rate: 21 })), sessionId: "session-1", saleAttempt: attempt });
    const restored = parseCartBackupRestore(raw, "session-1");
    expect(restored?.saleAttempt).toEqual(attempt);
    expect(resolveSaleAttempt(restored?.saleAttempt, fp, counter()).key).toBe("key-before-reload");
  });

  it("parses old cart backups without an attempt", () => {
    const raw = JSON.stringify({ cart: [{ product_id: "a", product_name: "A", quantity: 1, unit_price: 1, vat_rate: 21 }], sessionId: "s" });
    expect(parseCartBackupRestore(raw, "s")?.saleAttempt).toBeUndefined();
    expect(isSaleAttempt({ key: "", fingerprint: "x" })).toBe(false);
  });
});
