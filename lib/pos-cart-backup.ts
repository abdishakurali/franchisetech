import { normalizeCartLines } from "@/lib/pos-line-discount";
import { isSaleAttempt, type SaleAttempt } from "@/lib/pos-sale-attempt";

export type CartItemBackup = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  fiscalnet_vat_group?: number | null;
  /** Per-line discount % (P1.7b). */
  discount_pct?: number;
};

export type CheckoutStep = "order" | "payment";

export type CartBackupWrite = {
  cart: CartItemBackup[];
  sessionId: string;
  checkoutStep?: CheckoutStep;
  paymentMethodId?: string;
  cashReceived?: number | "";
  discountPct?: number;
  /** In-flight checkout attempt — lets a reload resend the same idempotency key. */
  saleAttempt?: SaleAttempt | null;
};

/** Restored after reload — cart + discount only; never payment step or cash received. */
export type CartBackupRestore = {
  cart: CartItemBackup[];
  sessionId: string;
  discountPct?: number;
  saleAttempt?: SaleAttempt;
};

const STORAGE_KEY = "pos_cart_backup";

/** Parse stored backup JSON into a safe restore payload (Register step only). */
export function parseCartBackupRestore(
  raw: string | null,
  sessionId: string | null | undefined
): CartBackupRestore | null {
  if (!sessionId || !raw) return null;
  try {
    const backup = JSON.parse(raw) as CartBackupWrite;
    if (backup.sessionId === sessionId && Array.isArray(backup.cart) && backup.cart.length > 0) {
      return {
        cart: normalizeCartLines(backup.cart, backup.discountPct ?? 0),
        sessionId: backup.sessionId,
        discountPct: backup.discountPct,
        ...(isSaleAttempt(backup.saleAttempt) ? { saleAttempt: backup.saleAttempt } : {}),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function readCartBackupFromStorage(sessionId: string | null | undefined): CartBackupRestore | null {
  if (!sessionId || typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  const restored = parseCartBackupRestore(raw, sessionId);
  if (restored) sessionStorage.removeItem(STORAGE_KEY);
  return restored;
}

export function writeCartBackupToStorage(data: CartBackupWrite) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function clearCartBackupFromStorage() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
