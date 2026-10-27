"use client";

import posthog from "posthog-js";

/** The visitor's anonymous PostHog id, so server-side events (e.g. a submitted lead) join the same funnel. */
export function getClientDistinctId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return posthog.get_distinct_id() ?? null;
  } catch {
    return null;
  }
}

/** Fire-and-forget product analytics — never throws. */
export function captureClientEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
): void {
  try {
    if (typeof window === "undefined") return;
    posthog.capture(event, {
      event_schema_version: 1,
      event_source: "client",
      ...properties,
    });
  } catch {
    // analytics must not block UX
  }
}
