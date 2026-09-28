import type { QueuedSale } from "@/lib/pos-offline-queue";

export async function flushPendingSalesSequentially(
  browserOffline: boolean,
  entries: QueuedSale[],
  syncEntry: (entry: QueuedSale) => Promise<boolean>,
): Promise<number> {
  if (browserOffline) return 0;

  let synced = 0;
  for (const entry of entries) {
    if (await syncEntry(entry)) synced += 1;
  }
  return synced;
}
