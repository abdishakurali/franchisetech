"use client";

import posthog from "posthog-js";

/** Fire-and-forget product analytics — never throws. */
export function captureClientEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
): void {
  try {
    if (typeof window === "undefined") return;
    posthog.capture(event, properties);
  } catch {
    // analytics must not block UX
  }
}
