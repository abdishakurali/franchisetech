// Glovo Partners API client
// Docs: https://ondemand-api.glovoapp.com
// Menu Tool: https://menu-tool.glovoapp.com/partners-api/api
// Rate limit: 20 requests per 2-second window — enforced with in-process token bucket

const GLOVO_BASE = {
  prod: "https://ondemand-api.glovoapp.com",
  staging: "https://ondemand-stageapi.glovoapp.com",
} as const;

const GLOVO_MENU_BASE = "https://menu-tool.glovoapp.com/partners-api/api";

export type GlovoEnv = "prod" | "staging";

export type GlovoTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type GlovoOrderStatus =
  | "CREATED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export type GlovoProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  attributes?: Array<{ id: string; name: string; price: number }>;
};

export type GlovoOrder = {
  trackingNumber: string;
  orderId: string;
  status: GlovoOrderStatus;
  storeAddressId: string;
  deliveryAddress?: { label: string };
  packageDetails: {
    products: GlovoProduct[];
    totalPrice: number;
    currency: string;
  };
  customer?: {
    name?: string;
    phone?: string;
  };
  estimatedPickupTime?: string;
};

// In-process token bucket: 20 tokens, refilled every 2 seconds
const bucket = {
  tokens: 20,
  lastRefill: Date.now(),
};

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= 2000) {
    bucket.tokens = 20;
    bucket.lastRefill = now;
  }
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return;
  }
  // Wait until the next 2s window
  const waitMs = 2000 - elapsed;
  await new Promise((r) => setTimeout(r, waitMs + 50));
  bucket.tokens = 19;
  bucket.lastRefill = Date.now();
}

async function glovoFetch(
  url: string,
  options: RequestInit,
  retries = 3,
): Promise<Response> {
  await throttle();
  const res = await fetch(url, options);
  if (res.status === 429 && retries > 0) {
    // Glovo 60s ban on rate limit exceeded — wait 62s then retry
    await new Promise((r) => setTimeout(r, 62_000));
    return glovoFetch(url, options, retries - 1);
  }
  return res;
}

/**
 * Obtain an access token using client credentials.
 * Credentials come from Glovo Partners Web App → Settings → API Credentials.
 */
export async function authenticate(
  clientId: string,
  clientSecret: string,
  env: GlovoEnv = "prod",
): Promise<GlovoTokenPair> {
  const res = await glovoFetch(`${GLOVO_BASE[env]}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "glovo-app-type": "b2b",
    },
    body: JSON.stringify({
      grantType: "client_credentials",
      clientId,
      clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GlovoApiError(`Glovo auth failed: ${res.status}`, res.status, body);
  }

  const data = await res.json();
  const expiresIn = typeof data.expiresIn === "number" ? data.expiresIn : 1199;
  return {
    accessToken: String(data.accessToken ?? ""),
    refreshToken: String(data.refreshToken ?? ""),
    expiresAt: new Date(Date.now() + expiresIn * 1000 - 30_000),
  };
}

/**
 * Refresh an access token using the stored refresh token.
 */
export async function refreshToken(
  refreshTokenValue: string,
  clientId: string,
  clientSecret: string,
  env: GlovoEnv = "prod",
): Promise<GlovoTokenPair> {
  const res = await glovoFetch(`${GLOVO_BASE[env]}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "glovo-app-type": "b2b",
    },
    body: JSON.stringify({
      grantType: "refresh_token",
      refreshToken: refreshTokenValue,
      clientId,
      clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GlovoApiError(`Glovo token refresh failed: ${res.status}`, res.status, body);
  }

  const data = await res.json();
  const expiresIn = typeof data.expiresIn === "number" ? data.expiresIn : 1199;
  return {
    accessToken: String(data.accessToken ?? ""),
    refreshToken: String(data.refreshToken ?? data.refreshToken ?? ""),
    expiresAt: new Date(Date.now() + expiresIn * 1000 - 30_000),
  };
}

/**
 * Fetch a full order by tracking number.
 */
export async function getOrder(
  trackingNumber: string,
  accessToken: string,
  env: GlovoEnv = "prod",
): Promise<GlovoOrder> {
  const res = await glovoFetch(`${GLOVO_BASE[env]}/v2/laas/parcels/${encodeURIComponent(trackingNumber)}`, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GlovoApiError(`Glovo getOrder failed: ${res.status}`, res.status, body);
  }

  return res.json();
}

/**
 * Update the order status visible to the customer and courier.
 */
export async function updateOrderStatus(
  storeAddressId: string,
  orderId: string,
  status: GlovoOrderStatus,
  accessToken: string,
  env: GlovoEnv = "prod",
): Promise<void> {
  const res = await glovoFetch(`${GLOVO_MENU_BASE}/orders/status/${encodeURIComponent(storeAddressId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ orderId, status }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GlovoApiError(`Glovo updateStatus failed: ${res.status}`, res.status, body);
  }
}

/**
 * Temporarily close a store (e.g., end of day).
 */
export async function closeStore(
  storeAddressId: string,
  accessToken: string,
  env: GlovoEnv = "prod",
): Promise<void> {
  await glovoFetch(`${GLOVO_MENU_BASE}/schedule/${encodeURIComponent(storeAddressId)}/closing`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ closed: true }),
  });
}

export class GlovoApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody: string,
  ) {
    super(message);
    this.name = "GlovoApiError";
  }
}
