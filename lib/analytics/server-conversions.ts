// Server-side conversion reporting — fires on confirmed Stripe revenue, not page loads.
// Every export here is a best-effort no-op when its required env vars are absent, so a
// missing credential never breaks the billing webhook it's called from.

type ReportPaidConversionInput = {
  organisationId: string;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  gaClientId?: string | null;
  amountCents: number;
  currency: string;
  transactionId: string;
};

let cachedGoogleAdsToken: { accessToken: string; expiresAt: number } | null = null;

async function getGoogleAdsAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_ADS_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  if (cachedGoogleAdsToken && cachedGoogleAdsToken.expiresAt > Date.now() + 30_000) {
    return cachedGoogleAdsToken.accessToken;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("[conversions] google ads oauth refresh failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedGoogleAdsToken = { accessToken: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/**
 * Uploads a click conversion to Google Ads (offline conversion import) using the
 * stored gclid/gbraid/wbraid from signup. Requires the conversion action to already
 * exist in Google Ads — its numeric ID is passed per call site:
 *   GOOGLE_ADS_CONVERSION_ACTION_ID        → paid subscription (Stripe webhook)
 *   GOOGLE_ADS_TRIAL_CONVERSION_ACTION_ID  → card-verified trial start
 *
 * Required env vars (no-op until provisioned):
 *   GOOGLE_ADS_OAUTH_CLIENT_ID, GOOGLE_ADS_OAUTH_CLIENT_SECRET, GOOGLE_ADS_OAUTH_REFRESH_TOKEN
 *   GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID (optional — only needed if the account sits under a manager/MCC account)
 */
async function uploadGoogleAdsClickConversion(input: {
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  conversionActionId: string;
  transactionId: string;
  /** Omit to use the conversion action's default value (e.g. trial starts). */
  value?: { amountCents: number; currency: string };
}): Promise<void> {
  const clickId = input.gclid || input.gbraid || input.wbraid;
  if (!clickId) return;

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  if (!developerToken || !customerId) return;

  const accessToken = await getGoogleAdsAccessToken();
  if (!accessToken) return;

  const clickIdField = input.gclid ? "gclid" : input.gbraid ? "gbraid" : "wbraid";

  try {
    const res = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}:uploadClickConversions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          ...(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
            ? { "login-customer-id": process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID }
            : {}),
        },
        body: JSON.stringify({
          conversions: [
            {
              [clickIdField]: clickId,
              conversionAction: `customers/${customerId}/conversionActions/${input.conversionActionId}`,
              conversionDateTime: googleAdsDateTime(new Date()),
              ...(input.value
                ? {
                    conversionValue: input.value.amountCents / 100,
                    currencyCode: input.value.currency.toUpperCase(),
                  }
                : {}),
              orderId: input.transactionId,
            },
          ],
          partialFailure: true,
        }),
      }
    );
    if (!res.ok) {
      console.error("[conversions] google ads upload failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[conversions] google ads upload threw", err);
  }
}

/** Google Ads wants `YYYY-MM-DD HH:MM:SS+HH:MM`. */
function googleAdsDateTime(date: Date): string {
  const iso = date.toISOString(); // e.g. 2026-07-05T12:34:56.000Z
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)}+00:00`;
}

/**
 * Sends a GA4 `purchase` event via the Measurement Protocol, attributed to the
 * original session via the stored `_ga` client_id. Requires GA4_API_SECRET
 * (Admin > Data Streams > [stream] > Measurement Protocol API secrets) and
 * NEXT_PUBLIC_GA_MEASUREMENT_ID (already set in production).
 */
async function sendGa4Purchase(input: ReportPaidConversionInput): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret || !input.gaClientId) return;

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: input.gaClientId,
          events: [
            {
              name: "purchase",
              params: {
                transaction_id: input.transactionId,
                value: input.amountCents / 100,
                currency: input.currency.toUpperCase(),
              },
            },
          ],
        }),
      }
    );
    if (!res.ok) {
      console.error("[conversions] ga4 measurement protocol failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[conversions] ga4 measurement protocol threw", err);
  }
}

/**
 * Fires both server-side conversions for a confirmed first payment. Never throws —
 * callers (the Stripe webhook) must still ack Stripe even if a conversion fails to send.
 */
export async function reportPaidConversion(input: ReportPaidConversionInput): Promise<void> {
  const conversionActionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;
  await Promise.allSettled([
    conversionActionId
      ? uploadGoogleAdsClickConversion({
          gclid: input.gclid,
          gbraid: input.gbraid,
          wbraid: input.wbraid,
          conversionActionId,
          transactionId: input.transactionId,
          value: { amountCents: input.amountCents, currency: input.currency },
        })
      : Promise.resolve(),
    sendGa4Purchase(input),
  ]);
}

type ReportTrialConversionInput = {
  organisationId: string;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
};

/**
 * Reports a card-verified trial start to Google Ads (primary bidding signal).
 * Uses the conversion action's default value — no monetary amount is sent.
 * No-op unless GOOGLE_ADS_TRIAL_CONVERSION_ACTION_ID is set. Never throws —
 * called from the card-verification payment flow, which must never break.
 */
export async function reportTrialConversion(input: ReportTrialConversionInput): Promise<void> {
  const conversionActionId = process.env.GOOGLE_ADS_TRIAL_CONVERSION_ACTION_ID;
  if (!conversionActionId) return;
  await uploadGoogleAdsClickConversion({
    gclid: input.gclid,
    gbraid: input.gbraid,
    wbraid: input.wbraid,
    conversionActionId,
    transactionId: `trial_${input.organisationId}`,
  });
}
