// A signed, expiring ANAF authorisation link. Ebriza's pattern: the owner can
// sign with their own certificate, or send the link to their accountant, who
// signs on ANAF's site with a certificate that has SPV rights for the CUI.
// The accountant isn't a member of the organisation, so the OAuth callback
// trusts the organisation id only when it comes from a state we signed.

import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signAuthState(orgId: string, secret: string, now = Date.now()): string {
  const payload = `${orgId}.${now + AUTH_LINK_TTL_MS}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload, secret)}`;
}

/** The organisation id from a state we signed and that hasn't expired; null otherwise. */
export function verifyAuthState(state: string | null | undefined, secret: string, now = Date.now()): string | null {
  if (!state || !secret) return null;
  const [encoded, signature] = state.split(".");
  if (!encoded || !signature) return null;
  let payload: string;
  try { payload = Buffer.from(encoded, "base64url").toString("utf8"); } catch { return null; }
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const [orgId, expiresAt] = payload.split(".");
  if (!/^[0-9a-f-]{36}$/i.test(orgId ?? "") || !(Number(expiresAt) > now)) return null;
  return orgId;
}

/** Secret for signing links: a dedicated one if configured, else CRON_SECRET (server-only). */
export function authLinkSecret(): string {
  return process.env.ANAF_STATE_SECRET?.trim() || process.env.CRON_SECRET?.trim() || "";
}
