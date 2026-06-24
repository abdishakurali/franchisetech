import { createHmac } from "crypto";

/** HMAC for Chatwoot widget identity validation (Inbox → Settings → Identity Validation). */
export function chatwootIdentifierHash(userId: string): string | undefined {
  const secret = process.env.CHATWOOT_HMAC_TOKEN?.trim();
  if (!secret || !userId) return undefined;
  return createHmac("sha256", secret).update(userId).digest("hex");
}
