import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  if (!token) return null;

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

/**
 * Flushes queued events without tearing down the client.
 *
 * Prefer this over shutdownPostHog() on serverless: shutdown() nulls the
 * singleton, so the next invocation pays to rebuild it. captureServerEvent is
 * fire-and-forget, so without a flush the in-flight HTTPS POST races the
 * function freezing — the reason server-side events (trial_started,
 * first_sale_recorded, subscription_created...) have been arriving unreliably.
 * Register it once per request with after() from "next/server".
 */
export async function flushPostHog(): Promise<void> {
  try {
    await posthogClient?.flush();
  } catch {
    // analytics must not block business flows
  }
}

/** Only for tests/scripts that need the process to exit cleanly. */
export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}

/**
 * Fire-and-forget server-side product analytics — never throws, no-ops silently
 * if PostHog isn't configured. distinctId should match the id used by
 * posthog.identify() client-side (the Supabase auth user id) so events merge
 * into the same person timeline.
 */
export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
  groups?: Record<string, string>,
): void {
  try {
    const client = getPostHogClient();
    if (!client) return;
    client.capture({ distinctId, event, properties, groups });
  } catch {
    // analytics must not block business flows
  }
}

/**
 * Awaitable variant for callers that are NOT in a request scope, where after()
 * cannot help — notably lib/growth/activation.ts, which dispatches its capture
 * as a floating promise that may resolve after the request's after() callbacks
 * have already run. Those call sites must await this instead.
 */
export async function captureServerEventAsync(
  distinctId: string,
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
  groups?: Record<string, string>,
): Promise<void> {
  try {
    const client = getPostHogClient();
    if (!client) return;
    client.capture({ distinctId, event, properties, groups });
    await client.flush();
  } catch {
    // analytics must not block business flows
  }
}
