/**
 * Offline sale queue (MVP foundation).
 *
 * Limitations:
 * - Queued sales live in localStorage on this browser only (not synced across devices).
 * - FiscalNet receipt must be printed manually when back online — sync does not auto-print fiscal.
 * - Stock is not reserved while offline; concurrent tills may oversell.
 * - Duplicate sync is prevented by status: only `pending_sync` entries are flushed.
 * - Max 20 entries; oldest dropped when full.
 */

export type QueuedSalePayload = Record<string, string>;

export type OfflineQueueStatus = "pending_sync" | "pending_fiscal";

export type QueuedSale = {
  id: string;
  payload: QueuedSalePayload;
  queuedAt: string;
  status: OfflineQueueStatus;
  /** Human-readable summary, e.g. "2 items · €6.30" */
  label: string;
  transactionId?: string;
  lastError?: string;
};

const STORAGE_KEY = "pos_offline_sale_queue";
const MAX_QUEUE = 20;

function readQueue(): QueuedSale[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as QueuedSale[]) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      ...entry,
      status: entry.status === "pending_fiscal" ? "pending_fiscal" : "pending_sync",
      label: entry.label || "Queued sale",
    }));
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedSale[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(0, MAX_QUEUE)));
  } catch {
    // ignore quota errors
  }
}

export function isBrowserOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/**
 * Probes the server with a real HEAD request so we detect "connected to network
 * but can't reach the server" (e.g. mobile data with no routing, captive portal).
 * Falls back to navigator.onLine when running server-side.
 * Result is cached for PROBE_TTL_MS to avoid hammering on rapid calls.
 */
const PROBE_URL = "/favicon.ico";
const PROBE_TIMEOUT_MS = 5_000;
const PROBE_TTL_MS = 15_000;
let _probeCache: { online: boolean; ts: number } | null = null;

export async function probeServerOnline(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  // Fast: if navigator says offline, skip the fetch
  if (!navigator.onLine) {
    _probeCache = { online: false, ts: Date.now() };
    return false;
  }
  // Use cached result if fresh
  if (_probeCache && Date.now() - _probeCache.ts < PROBE_TTL_MS) {
    return _probeCache.online;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    await fetch(PROBE_URL, { method: "HEAD", cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    _probeCache = { online: true, ts: Date.now() };
    return true;
  } catch {
    _probeCache = { online: false, ts: Date.now() };
    return false;
  }
}

/** Invalidates the probe cache so the next call always re-probes. */
export function invalidateProbeCache() {
  _probeCache = null;
}

/** True when the browser reports offline or a sale failed due to connectivity. */
export function isRetryableNetworkError(err: unknown): boolean {
  if (!isBrowserOnline()) return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /failed to fetch|networkerror|load failed|fetch|unexpected response|from the server|timeout|econnrefused/i.test(
    msg,
  );
}

export function removeOfflineSale(id: string) {
  writeQueue(readQueue().filter((q) => q.id !== id));
}

export function formDataToPayload(fd: FormData): QueuedSalePayload {
  const payload: QueuedSalePayload = {};
  fd.forEach((value, key) => {
    payload[key] = typeof value === "string" ? value : value.name;
  });
  return payload;
}

export function payloadToFormData(payload: QueuedSalePayload): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    fd.set(key, value);
  }
  return fd;
}

export function enqueueOfflineSale(payload: QueuedSalePayload, label: string): QueuedSale {
  const entry: QueuedSale = {
    id: `offline_${Date.now().toString(36)}`,
    payload,
    queuedAt: new Date().toISOString(),
    status: "pending_sync",
    label: label.trim() || "Queued sale",
  };
  writeQueue([entry, ...readQueue()]);
  return entry;
}

export function markOfflineSaleSynced(id: string, transactionId: string) {
  writeQueue(
    readQueue().map((entry) =>
      entry.id === id
        ? { ...entry, status: "pending_fiscal" as const, transactionId, lastError: undefined }
        : entry
    )
  );
}

export function markOfflineSaleSyncFailed(id: string, error: string) {
  writeQueue(
    readQueue().map((entry) =>
      entry.id === id ? { ...entry, lastError: error.slice(0, 200) } : entry
    )
  );
}

export function dismissPendingFiscal(id: string) {
  writeQueue(readQueue().filter((q) => q.id !== id));
}

/** @deprecated use dismissPendingFiscal */
export function dequeueOfflineSale(id: string) {
  dismissPendingFiscal(id);
}

export function listOfflineQueue(): QueuedSale[] {
  return readQueue().sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
}

export function listPendingSync(): QueuedSale[] {
  return listOfflineQueue().filter((q) => q.status === "pending_sync");
}

export function listPendingFiscal(): QueuedSale[] {
  return listOfflineQueue().filter((q) => q.status === "pending_fiscal");
}

export function pendingSyncCount(): number {
  return listPendingSync().length;
}

export function pendingFiscalCount(): number {
  return listPendingFiscal().length;
}

export function offlineQueueCount(): number {
  return readQueue().length;
}
