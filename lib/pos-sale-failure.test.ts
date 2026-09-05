// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { classifySaleFailure } from "@/lib/pos-sale-failure";

describe("classifySaleFailure", () => {
  it("queues the sale when completeSaleReturn throws a network-shaped error", () => {
    expect(classifySaleFailure(new Error("Failed to fetch"))).toBe("queue");
  });

  it("queues the sale when the browser reports itself offline, regardless of message", () => {
    vi.stubGlobal("navigator", { onLine: false });
    try {
      expect(classifySaleFailure(new Error("some opaque error"))).toBe("queue");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reloads on a stale server action error instead of queuing", () => {
    expect(classifySaleFailure(new Error("Failed to find Server Action 'abc123'"))).toBe("reload");
  });

  it("fails (does not queue) a genuine validation error while online", () => {
    expect(classifySaleFailure(new Error("Cash received is less than the total due."))).toBe("fail");
  });
});
