// Server-side only — never import in client components
import { LoopsClient } from "loops";

const apiKey = process.env.LOOPS_API_KEY;
if (!apiKey) {
  throw new Error("LOOPS_API_KEY is not set");
}

const loops = new LoopsClient(apiKey);

export async function trackLoopsEvent(
  email: string,
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  try {
    await loops.sendEvent({
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

  try {
    await loops.createContact({ email, properties: contactProperties });
  } catch {
    await loops.updateContact({ email, properties: contactProperties });
  }
}

export { loops };
