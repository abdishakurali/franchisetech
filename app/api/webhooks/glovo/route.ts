export const dynamic = "force-dynamic";

// POST /api/webhooks/glovo
// Receives inbound order events from Glovo.
// Must respond 200 within ~2 seconds — Glovo retries every 20 seconds on non-200.
// HMAC-SHA256 signature verification via X-Glovo-Signature header.

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getOrder, updateOrderStatus } from "@/lib/glovo/client";
import { mapGlovoOrder } from "@/lib/glovo/mapper";

const IMMEDIATE_OK = NextResponse.json({ received: true }, { status: 200 });

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return signature === expected;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();

  // Validate HMAC — partnerSecret stored in env per integration
  const partnerSecret = process.env.GLOVO_PARTNER_SECRET;
  if (partnerSecret) {
    const sig = req.headers.get("x-glovo-signature") ?? req.headers.get("x-glovo-hmac-sha256");
    if (!verifySignature(rawBody, sig, partnerSecret)) {
      console.warn("[glovo-webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const trackingNumber = payload.trackingNumber as string | undefined;
  if (!trackingNumber) {
    return NextResponse.json({ error: "Missing trackingNumber" }, { status: 400 });
  }

  // Respond 200 immediately — Glovo retries on non-200
  // Use Next.js after() to process asynchronously
  // If after() not available, process inline (still fast enough for most orders)
  processOrder(trackingNumber).catch((err) => {
    console.error("[glovo-webhook] async processing failed:", err);
  });

  return IMMEDIATE_OK;
}

async function processOrder(trackingNumber: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) return;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Find which org owns this storeAddressId
  // For now we match by provider='glovo' and is_active=true
  // Glovo storeAddressId comes in the order payload after fetching
  const glovoClientId = process.env.GLOVO_CLIENT_ID;
  const glovoClientSecret = process.env.GLOVO_CLIENT_SECRET;
  if (!glovoClientId || !glovoClientSecret) {
    console.error("[glovo-webhook] GLOVO_CLIENT_ID / GLOVO_CLIENT_SECRET not set");
    return;
  }

  // Get active Glovo integration
  const { data: integration } = await supabase
    .from("delivery_integrations")
    .select("organisation_id,store_address_id,access_token,refresh_token,token_expires_at")
    .eq("provider", "glovo")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!integration) {
    console.warn("[glovo-webhook] no active Glovo integration found");
    return;
  }

  const orgId = integration.organisation_id;
  const storeAddressId = integration.store_address_id ?? "";

  // Use stored access token (simplified — no refresh here for brevity)
  const accessToken = integration.access_token ?? "";
  if (!accessToken) {
    console.error("[glovo-webhook] no access token for org", orgId);
    return;
  }

  // Fetch full order from Glovo
  const order = await getOrder(trackingNumber, accessToken);

  // Dedup check
  const { count: existing } = await supabase
    .from("pos_transactions")
    .select("*", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("order_source", "glovo")
    .eq("external_order_id", order.orderId);

  if ((existing ?? 0) > 0) {
    console.log("[glovo-webhook] duplicate order skipped:", order.orderId);
    return;
  }

  // Get product mappings for this org
  const { data: mappings } = await supabase
    .from("delivery_product_mappings")
    .select("external_sku,product_id")
    .eq("organisation_id", orgId)
    .eq("provider", "glovo");

  const draft = mapGlovoOrder(order, mappings ?? [], orgId);

  // Insert pos_transaction
  const { data: tx, error: txError } = await supabase
    .from("pos_transactions")
    .insert({
      organisation_id: orgId,
      order_source: "glovo",
      external_order_id: draft.external_order_id,
      payment_method: draft.payment_method,
      subtotal: draft.subtotal,
      total_amount: draft.total_amount,
      status: "completed",
      transaction_date: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (txError) {
    console.error("[glovo-webhook] failed to insert transaction:", txError);
    return;
  }

  // Insert transaction items
  const itemRows = draft.items.map((item) => ({
    transaction_id: tx.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    notes: item.notes,
  }));

  if (itemRows.length > 0) {
    await supabase.from("pos_transaction_items").insert(itemRows).throwOnError();
  }

  // Acknowledge to Glovo: ACCEPTED
  try {
    await updateOrderStatus(storeAddressId, order.orderId, "ACCEPTED", accessToken);
  } catch (err) {
    console.error("[glovo-webhook] failed to update Glovo status:", err);
    // Non-fatal — transaction is already saved
  }

  console.log("[glovo-webhook] order processed:", order.orderId, "tx:", tx.id);
}
