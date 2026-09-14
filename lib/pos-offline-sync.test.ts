import { describe, expect, it, vi } from "vitest";
import { flushPendingSalesSequentially } from "@/lib/pos-offline-sync";
import type { QueuedSale } from "@/lib/pos-offline-queue";

const queuedSale: QueuedSale = {
  id: "offline_1",
  queuedAt: "2026-09-13T12:00:00.000Z",
  status: "pending_sync",
  label: "1 produs · 3,10 RON",
  payload: {
    idempotency_key: "sale-key-123",
    cart_json: "[]",
  },
};

describe("flushPendingSalesSequentially", () => {
  it("does not submit queued sales while verified offline", async () => {
    const syncEntry = vi.fn().mockResolvedValue(true);

    const synced = await flushPendingSalesSequentially(true, [queuedSale], syncEntry);

    expect(synced).toBe(0);
    expect(syncEntry).not.toHaveBeenCalled();
  });

  it("reuses the original idempotency key when a reconnect submission is retried", async () => {
    const receivedKeys: string[] = [];
    let attempts = 0;
    const syncEntry = vi.fn(async (entry: QueuedSale) => {
      receivedKeys.push(entry.payload.idempotency_key);
      attempts += 1;
      return attempts === 2;
    });

    await flushPendingSalesSequentially(true, [queuedSale], syncEntry);
    const firstReconnect = await flushPendingSalesSequentially(false, [queuedSale], syncEntry);
    const retry = await flushPendingSalesSequentially(false, [queuedSale], syncEntry);

    expect(firstReconnect).toBe(0);
    expect(retry).toBe(1);
    expect(receivedKeys).toEqual(["sale-key-123", "sale-key-123"]);
  });
});
