import { isRetryableNetworkError } from "@/lib/pos-offline-queue";

export type SaleFailureAction = "reload" | "queue" | "fail";

export function isStaleServerActionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return message.includes("Failed to find Server Action") || message.includes("failed-to-find-server-action");
}

/**
 * Decides what to do when completeSaleReturn throws after a checkout attempt.
 * Order matters: a stale deploy takes priority over network classification,
 * since reloading fixes both a stale bundle and a transient network blip.
 */
export function classifySaleFailure(err: unknown): SaleFailureAction {
  if (isStaleServerActionError(err)) return "reload";
  if (isRetryableNetworkError(err)) return "queue";
  return "fail";
}
