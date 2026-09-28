export type PosConnectionState = "synced" | "syncing" | "offline";

export interface PosConnectionStatus {
  state: PosConnectionState;
  /** Sales not yet confirmed synced to the server — meaningful for
   *  "syncing" (about to/being flushed) and "offline" (queued locally). */
  queuedCount: number;
}

/**
 * Gate B: exactly three states, never a fourth. "Has unsynced entries while
 * online" collapses into "syncing" rather than a separate idle/stalled
 * state — from the cashier's point of view there's nothing to distinguish
 * "about to sync" from "currently syncing" that's worth a fourth label.
 */
export function computeConnectionStatus(input: {
  browserOffline: boolean;
  syncing: boolean;
  queuedCount: number;
}): PosConnectionStatus {
  if (input.browserOffline) {
    return { state: "offline", queuedCount: input.queuedCount };
  }
  if (input.syncing || input.queuedCount > 0) {
    return { state: "syncing", queuedCount: input.queuedCount };
  }
  return { state: "synced", queuedCount: 0 };
}
