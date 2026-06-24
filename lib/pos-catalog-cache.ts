/**
 * POS product catalog cache — localStorage on this device.
 * Used for faster repeat visits and selling from cached menu when offline.
 */

const STORAGE_KEY = "pos_catalog_cache_v1";

export type PosCatalogSnapshot = {
  orgId: string;
  products: unknown[];
  categories: unknown[];
  paymentMethods: unknown[];
  sgrProduct: unknown | null;
  sgrEnabled: boolean;
  vatRateGroupMap: Record<number, number>;
  defaultVatRate: number;
  cachedAt: string;
  sessionId?: string;
  currency?: string;
};

export function readPosCatalogCache(orgId?: string): PosCatalogSnapshot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PosCatalogSnapshot;
    if (!parsed?.products?.length) return null;
    if (orgId && parsed.orgId !== orgId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePosCatalogCache(snapshot: PosCatalogSnapshot) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // quota — ignore
  }
}

export function catalogCacheAgeLabel(cachedAt: string, locale: "en" | "ro"): string | null {
  const ms = Date.now() - new Date(cachedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return locale === "ro" ? "Chiar acum" : "Just now";
  if (mins < 60) return locale === "ro" ? `Acum ${mins} min` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return locale === "ro" ? `Acum ${hrs} h` : `${hrs}h ago`;
}
