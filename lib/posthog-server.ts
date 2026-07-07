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
