#!/usr/bin/env node
/**
 * Verifies pos-cart-backup parse/restore logic (sessionStorage contract).
 * Run: node scripts/verify-pos-cart-restore.mjs
 */

function parseCartBackupRestore(raw, sessionId) {
  if (!sessionId || !raw) return null;
  try {
    const backup = JSON.parse(raw);
    if (backup.sessionId === sessionId && Array.isArray(backup.cart) && backup.cart.length > 0) {
      return {
        cart: backup.cart,
        sessionId: backup.sessionId,
        discountPct: backup.discountPct,
      };
    }
  } catch {
    return null;
  }
  return null;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("ok:", msg);
  }
}

const sessionId = "sess-abc";
const cart = [{ product_id: "p1", product_name: "Coffee", quantity: 2, unit_price: 3, vat_rate: 9 }];
const backup = JSON.stringify({
  cart,
  sessionId,
  checkoutStep: "payment",
  paymentMethodId: "pm1",
  cashReceived: 10,
  discountPct: 10,
});

const restored = parseCartBackupRestore(backup, sessionId);
assert(restored !== null, "restores matching session cart");
assert(restored?.cart.length === 1, "cart length preserved");
assert(restored?.discountPct === 10, "discount pct preserved");
assert(restored?.checkoutStep === undefined, "does not restore payment step");

const wrongSession = parseCartBackupRestore(backup, "other-session");
assert(wrongSession === null, "rejects wrong session id");

assert(restored?.cart[0].product_name === "Coffee", "product name intact");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nverify-pos-cart-restore: all checks passed");
