// ANAF OAuth2 authentication for e-Factura / SPV
// USB token flow: user must insert hardware token + enter PIN once in browser.
// After first auth, refresh_token enables server-side automation.

// anaf_oauth_tokens is service-role only (RLS, no policies): every caller here
// passes an organisation it has already authorised.
import { createServiceClient } from "@/lib/supabase/server";

const ANAF_AUTH_BASE = "https://logincert.anaf.ro/anaf-oauth2/v1";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope?: string;
};

/**
 * Build the URL to redirect the user to ANAF's USB-token login page.
 * The user inserts their hardware token, enters PIN, selects certificate.
 * ANAF redirects back to redirectUri?code=...&state=...
 */
export function getAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  state?: string,
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    token_content_type: "jwt",
    ...(state ? { state } : {}),
  });
  return `${ANAF_AUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access + refresh tokens.
 * Called once from the OAuth callback route.
 */
export async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<TokenPair> {
  const res = await fetch(`${ANAF_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ANAF token exchange failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return parseTokenResponse(data);
}

/**
 * Refresh an access token using a stored refresh token.
 * ANAF documents 90-day access and 365-day refresh tokens
 * (Oauth_procedura_inregistrare_aplicatii_portal_ANAF.pdf).
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenPair> {
  const res = await fetch(`${ANAF_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ANAF token refresh failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return parseTokenResponse(data);
}

function parseTokenResponse(data: Record<string, unknown>): TokenPair {
  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000 - 60_000); // 60s safety margin
  return {
    accessToken: String(data.access_token ?? ""),
    refreshToken: String(data.refresh_token ?? ""),
    expiresAt,
    scope: data.scope ? String(data.scope) : undefined,
  };
}

/**
 * Get a valid access token for an org, auto-refreshing if needed.
 * Uses service_role to read/write anaf_oauth_tokens (never exposed to client).
 */
export async function getOrgAccessToken(orgId: string): Promise<string> {
  const supabase = await createServiceClient();

  const { data: tokenRow, error } = await supabase
    .from("anaf_oauth_tokens")
    .select("access_token,refresh_token,expires_at")
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (error || !tokenRow) {
    throw new Error("ANAF credentials not configured for this organisation");
  }

  const expiresAt = new Date(tokenRow.expires_at);
  const isExpired = expiresAt <= new Date();

  if (!isExpired) {
    return tokenRow.access_token;
  }

  // A token pasted from the accountant's software has no refresh token we
  // can use (it belongs to her app); it must be replaced, not refreshed.
  if (!tokenRow.refresh_token) {
    throw new Error("Tokenul ANAF primit de la contabil a expirat; cereți unul nou și lipiți-l în /app/admin/efactura.");
  }

  // Refresh
  const clientId = process.env.ANAF_CLIENT_ID;
  const clientSecret = process.env.ANAF_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ANAF_CLIENT_ID / ANAF_CLIENT_SECRET env vars not set");
  }

  const tokens = await refreshAccessToken(tokenRow.refresh_token, clientId, clientSecret);
  if (!tokens.accessToken) throw new Error("ANAF token refresh returned no access token");

  // ANAF rotates the refresh token on each refresh; never overwrite it with an
  // empty one, or the organisation is locked out until re-authorised.
  const { error: saveError } = await supabase
    .from("anaf_oauth_tokens")
    .update({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken || tokenRow.refresh_token,
      expires_at: tokens.expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", orgId);
  if (saveError) throw new Error(`ANAF token save failed: ${saveError.message}`);

  return tokens.accessToken;
}

/**
 * Store a new token pair for an org after OAuth callback.
 */
export async function storeOrgTokens(
  orgId: string,
  cif: string,
  tokens: TokenPair,
): Promise<void> {
  if (!tokens.accessToken || !tokens.refreshToken) throw new Error("ANAF returned an incomplete token pair");
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("anaf_oauth_tokens")
    .upsert(
      {
        organisation_id: orgId,
        cif,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organisation_id" },
    );
  if (error) throw new Error(`ANAF token save failed: ${error.message}`);
}

/**
 * Check if an org has ANAF credentials configured.
 */
export async function hasAnafCredentials(orgId: string): Promise<boolean> {
  const supabase = await createServiceClient();
  const { count } = await supabase
    .from("anaf_oauth_tokens")
    .select("*", { count: "exact", head: true })
    .eq("organisation_id", orgId);
  return (count ?? 0) > 0;
}

/**
 * Remove ANAF credentials for an org (disconnect).
 */
export async function revokeOrgTokens(orgId: string): Promise<void> {
  const supabase = await createServiceClient();
  await supabase
    .from("anaf_oauth_tokens")
    .delete()
    .eq("organisation_id", orgId);
}
