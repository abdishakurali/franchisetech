// Server-side only — never import in client components
import { LoopsClient } from "loops";

let loops: LoopsClient | null = null;

function getLoops(): LoopsClient | null {
  const apiKey = process.env.LOOPS_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Loops] LOOPS_API_KEY is not set — lifecycle events skipped");
    return null;
  }
  loops ??= new LoopsClient(apiKey);
  return loops;
}

export async function trackLoopsEvent(
  email: string,
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  const client = getLoops();
  if (!client) return;
  try {
    await client.sendEvent({
      email,
      eventName,
      eventProperties: properties,
    });
  } catch (err) {
    console.error("[Loops] sendEvent failed:", { email, eventName, err });
  }
}

export async function upsertLoopsContact(
  email: string,
  properties: {
    firstName?: string;
    lastName?: string;
    plan?: string;
    trialStartedAt?: string;
    locationCount?: number;
    [key: string]: string | number | boolean | undefined;
  }
) {
  const contactProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean | null>;

  const client = getLoops();
  if (!client) return;
  try {
    await client.createContact({ email, properties: contactProperties });
  } catch {
    await client.updateContact({ email, properties: contactProperties });
  }
}
