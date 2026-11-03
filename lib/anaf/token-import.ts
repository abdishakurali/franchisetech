// Tokens handed over by the accountant. Her software obtains them with her
// certificate through its own ANAF app, so we can use the access token but
// can't refresh it (the refresh needs that app's client secret). It expires
// on its own (ANAF documents 90 days), so we read the expiry from the token
// and warn well before it.

export type ImportedToken = { accessToken: string; expiresAt: Date };

/** Reads `exp` from a JWT without trusting it for anything but the date. */
export function jwtExpiry(token: string): Date | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const payload = JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof payload.exp === "number" && payload.exp > 0 ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

export function parseImportedToken(raw: string, now = new Date()): ImportedToken | { error: string } {
  const accessToken = raw.trim().replace(/^Bearer\s+/i, "");
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(accessToken)) {
    return { error: "Nu pare un token ANAF (JWT cu trei părți separate prin punct)." };
  }
  const expiresAt = jwtExpiry(accessToken);
  if (!expiresAt) return { error: "Tokenul nu are dată de expirare (exp)." };
  if (expiresAt <= now) return { error: `Tokenul a expirat la ${expiresAt.toISOString().slice(0, 10)}.` };
  return { accessToken, expiresAt };
}

export const TOKEN_EXPIRY_WARNING_DAYS = 14;

export function daysUntil(date: Date, now = new Date()): number {
  return Math.floor((date.getTime() - now.getTime()) / 86_400_000);
}
