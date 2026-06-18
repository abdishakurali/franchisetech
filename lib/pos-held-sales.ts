import type { CartItemBackup } from "@/lib/pos-cart-backup";

export type HeldSale = {
  id: string;
  label: string;
  cart: CartItemBackup[];
  discountPct: number;
  customerName?: string;
  heldAt: string;
};

const STORAGE_KEY = "pos_held_sales";
const MAX_HELD = 5;

function readAll(): HeldSale[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as HeldSale[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(sales: HeldSale[]) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sales.slice(0, MAX_HELD)));
  } catch {
    // ignore quota errors
  }
}

export function listHeldSales(): HeldSale[] {
  return readAll().sort((a, b) => b.heldAt.localeCompare(a.heldAt));
}

export function holdCurrentSale(input: {
  cart: CartItemBackup[];
  discountPct: number;
  customerName?: string;
  label?: string;
}): HeldSale | null {
  if (!input.cart.length) return null;
  const sale: HeldSale = {
    id: `hold_${Date.now().toString(36)}`,
    label: input.label?.trim() || `Order ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    cart: input.cart,
    discountPct: input.discountPct,
    customerName: input.customerName,
    heldAt: new Date().toISOString(),
  };
  writeAll([sale, ...readAll()]);
  return sale;
}

export function resumeHeldSale(id: string): HeldSale | null {
  const sales = readAll();
  const found = sales.find((s) => s.id === id) ?? null;
  if (!found) return null;
  writeAll(sales.filter((s) => s.id !== id));
  return found;
}

export function removeHeldSale(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}
