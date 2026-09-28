import { describe, expect, it } from "vitest";
import { computeConnectionStatus } from "./pos-connection-status";

describe("computeConnectionStatus", () => {
  it("offline wins over everything else, regardless of syncing/queue state", () => {
    expect(computeConnectionStatus({ browserOffline: true, syncing: true, queuedCount: 5 })).toEqual({
      state: "offline",
      queuedCount: 5,
    });
    expect(computeConnectionStatus({ browserOffline: true, syncing: false, queuedCount: 0 })).toEqual({
      state: "offline",
      queuedCount: 0,
    });
  });

  it("online with a nonzero queue is 'syncing', even if the flush loop hasn't started yet", () => {
    expect(computeConnectionStatus({ browserOffline: false, syncing: false, queuedCount: 3 })).toEqual({
      state: "syncing",
      queuedCount: 3,
    });
  });

  it("online and actively flushing is 'syncing' even with a queue of zero (the last entry mid-flight)", () => {
    expect(computeConnectionStatus({ browserOffline: false, syncing: true, queuedCount: 0 })).toEqual({
      state: "syncing",
      queuedCount: 0,
    });
  });

  it("online, not syncing, empty queue is 'synced' with a zeroed count", () => {
    expect(computeConnectionStatus({ browserOffline: false, syncing: false, queuedCount: 0 })).toEqual({
      state: "synced",
      queuedCount: 0,
    });
  });
});
