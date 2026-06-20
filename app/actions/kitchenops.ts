"use server";

// FiscalNet — Romania-only fiscal receipt integration
import { printFiscalReceipt, shouldPrintFiscalReceipt } from "@/lib/fiscalnet";
import { buildFiscalNetConfig } from "@/lib/fiscalnet/config";
import { isFiscalNetActive } from "@/lib/fiscalnet/eligibility";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getActiveOrg, numberValue, stringValue } from "@/lib/kitchenops/data";
import { requireActiveSite } from "@/lib/site-context";
import { normaliseIndustry, RESTAURANT_FEATURE_KEYS, type RestaurantFeatureKey } from "@/lib/restaurant-features";
import { lineDiscountPct, transactionDiscountPct, type PosCartLine } from "@/lib/pos-line-discount";
import {
  canCancelPurchase,
  isAlreadyPosted,
  mapNirPostRpcError,
  nirPostErrorRedirect,
  parsePurchaseLinesFromForm,
  purchaseLineTotals,
  type PurchaseLineInput,
} from "@/lib/nir/purchase";
import { createServiceClient } from "@/lib/supabase/server";
import { seedOrgVatRatesIfEmpty } from "@/lib/vat-rates-server";
import { formCheckboxEnabled } from "@/lib/form-checkbox";
import { saveOrgModuleFlags, fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { productModuleVisibility, resolveProductTypeFields } from "@/lib/product-module-fields";
import { nearestVatRate, VAT_DEFAULTS_BY_COUNTRY } from "@/lib/vat-rates";

function canTransact(role: string | null) { return ["owner","manager","staff","cashier"].includes(role ?? ""); }
function canManage(role: string | null) { return ["owner","manager"].includes(role ?? ""); }
function canUpdateKitchen(role: string | null) { return ["owner","manager","kitchen"].includes(role ?? ""); }
function nullableNum(fd: FormData, key: string) {
  const v = Number(String(fd.get(key) ?? "").trim());
  return Number.isFinite(v) && String(fd.get(key) ?? "").trim() !== "" ? v : null;
}

type PosSaleCartItem = PosCartLine & { fiscalnet_vat_group?: number | null };

function buildPosItemCalcs(cart: PosSaleCartItem[], legacyCartPct: number) {
  return cart.map((item) => {
    const appliedPct = lineDiscountPct(item, legacyCartPct);
    const discountMultiplier = 1 - appliedPct / 100;
    const grossBefore = item.quantity * item.unit_price;
    const grossAmount = grossBefore * discountMultiplier;
    const vatDecimal = item.vat_rate / 100;
    const netAmount = vatDecimal > 0 ? grossAmount / (1 + vatDecimal) : grossAmount;
    const vatAmount = grossAmount - netAmount;
    return {
      ...item,
      applied_discount_pct: appliedPct,
      unit_price_gross: item.unit_price,
      net_amount: Number(netAmount.toFixed(4)),
      vat_amount: Number(vatAmount.toFixed(4)),
      gross_amount: Number(grossAmount.toFixed(4)),
      line_total: Number(grossAmount.toFixed(2)),
      discount_amount: Number((grossBefore - grossAmount).toFixed(4)),
    };
  });
}

type KitchenCartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price?: number;
};

async function createKitchenOrderIfEnabled({
  supabase,
  orgId,
  userId,
  orgRow,
  transactionId,
  transactionNumber,
  items,
  orderType,
  tableLabel,
  note,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  orgId: string;
  userId: string;
  orgRow: Record<string, unknown> | null;
  transactionId: string;
  transactionNumber: string;
  items: KitchenCartItem[];
  orderType?: string | null;
  tableLabel?: string | null;
  note?: string | null;
}) {
  if (!items.length) return;

  try {
    let enabled = Boolean(orgRow?.kitchen_display_enabled);
    if (!enabled) {
      const { data: featureRow, error: featureError } = await supabase
        .from("organisations")
        .select("kitchen_display_enabled")
        .eq("id", orgId)
        .maybeSingle();
      if (featureError) return;
      enabled = Boolean(featureRow?.kitchen_display_enabled);
    }
    if (!enabled) return;

    const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];
    const { data: products } = productIds.length
      ? await supabase.from("products").select("id,image_url,kitchen_station").in("id", productIds).eq("organisation_id", orgId)
      : { data: [] };
    const imageByProduct = new Map((products ?? []).map((p: { id: string; image_url: string | null; kitchen_station?: string | null }) => [p.id, p.image_url]));
    const stationByProduct = new Map((products ?? []).map((p: { id: string; image_url: string | null; kitchen_station?: string | null }) => [p.id, p.kitchen_station ?? null]));

    const { data: order, error } = await supabase
      .from("kitchen_orders")
      .insert({
        organisation_id: orgId,
        sale_id: transactionId,
        order_number: transactionNumber,
        status: "sent",
        order_type: orderType || null,
        table_label: tableLabel || null,
        note: note || null,
        source: "pos",
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !order) throw error;

    await supabase.from("kitchen_order_items").insert(
      items.map((item) => ({
        kitchen_order_id: order.id,
        product_id: item.product_id || null,
        name: item.product_name || "Item",
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unit_price ?? 0),
        line_total: Number(item.quantity || 1) * Number(item.unit_price ?? 0),
        image_url: imageByProduct.get(item.product_id) ?? null,
        kitchen_station: stationByProduct.get(item.product_id) ?? null,
        modifiers: {},
        status: "sent",
      }))
    );

    await supabase.from("pos_audit_events").insert({
      organisation_id: orgId,
      transaction_id: transactionId,
      event_type: "kitchen_order_created",
      after_data: { kitchen_order_id: order.id, order_number: transactionNumber },
      performed_by: userId,
    }).then(() => null, () => null);
  } catch (error) {
    console.warn("[Kitchen] order creation failed after sale", {
      orgId,
      transactionId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function ensurePosDefaults() {
  const { supabase, orgId } = await getActiveOrg();
  const { data: orgRow } = await supabase.from("organisations").select("country_code").eq("id", orgId).single();
  const countryCode = orgRow?.country_code ?? null;

  const { data: cats } = await supabase.from("product_categories").select("id").eq("organisation_id", orgId).limit(1);
  if (!cats?.length) {
    await supabase.from("product_categories").insert([
      { organisation_id: orgId, name: "Drinks", color: "#2563eb", sort_order: 1 },
      { organisation_id: orgId, name: "Food", color: "#16a34a", sort_order: 2 },
      { organisation_id: orgId, name: "Snacks", color: "#f59e0b", sort_order: 3 },
    ]);
  }
  const { data: methods } = await supabase.from("payment_methods").select("id").eq("organisation_id", orgId).limit(1);
  if (!methods?.length) {
    await supabase.from("payment_methods").insert([
      { organisation_id: orgId, name: "Cash", type: "cash" },
      { organisation_id: orgId, name: "Card", type: "card" },
      { organisation_id: orgId, name: "Online", type: "online" },
      { organisation_id: orgId, name: "Other", type: "other" },
    ]);
  }
  await seedOrgVatRatesIfEmpty(supabase, orgId, countryCode);
}

export async function addCategory(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  if (!name) return;
  await supabase.from("product_categories").insert({
    organisation_id: orgId, name,
    color: stringValue(formData, "color") || null,
    sort_order: numberValue(formData, "sort_order"),
    category_type: stringValue(formData, "category_type") || "both",
  });
  revalidatePath("/app/products");
  revalidatePath("/app/settings");
}

export async function updateCategory(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  const name = stringValue(formData, "name");
  if (!id || !name) return;
  const categoryType = stringValue(formData, "category_type");
  await supabase.from("product_categories").update({
    name,
    color: stringValue(formData, "color") || null,
    sort_order: numberValue(formData, "sort_order"),
    ...(categoryType ? { category_type: categoryType } : {}),
  }).eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/products");
  revalidatePath("/app/settings");
  revalidatePath("/app/pos");
}

export async function deleteCategory(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  await supabase.from("products").update({ category_id: null }).eq("organisation_id", orgId).eq("category_id", id);
  await supabase.from("product_categories").delete().eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/products");
  revalidatePath("/app/settings");
  revalidatePath("/app/pos");
}

export async function addUnit(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  if (!name) return;
  await supabase.from("units_of_measure").insert({
    organisation_id: orgId, name,
    abbreviation: stringValue(formData, "abbreviation") || null,
  }).then(() => null, () => null);
  revalidatePath("/app/products");
  revalidatePath("/app/settings");
}

export async function updateUnit(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  const name = stringValue(formData, "name");
  if (!id || !name) return;
  await supabase.from("units_of_measure").update({
    name,
    abbreviation: stringValue(formData, "abbreviation") || null,
  }).eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/products");
  revalidatePath("/app/settings");
}

export async function deleteUnit(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  await supabase.from("units_of_measure").delete().eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/products");
  revalidatePath("/app/settings");
}

export async function updateCashDrawerSettings(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const mode = stringValue(formData, "cash_drawer_mode");
  const safeMode = ["off", "manual", "local_connector", "android_connector"].includes(mode) ? mode : "manual";
  const existingToken = stringValue(formData, "existing_token");
  const rawToken = stringValue(formData, "cash_drawer_connector_token");
  const token = rawToken || existingToken || null;

  await supabase.from("organisations").update({
    cash_drawer_mode: safeMode,
    cash_drawer_connector_port: numberValue(formData, "cash_drawer_connector_port", 17878),
    cash_drawer_connector_token: token,
    cash_drawer_trigger_on_cash_sale: formData.get("cash_drawer_trigger_on_cash_sale") === "on",
    cash_drawer_trigger_on_cash_in: formData.get("cash_drawer_trigger_on_cash_in") === "on",
    cash_drawer_trigger_on_cash_out: formData.get("cash_drawer_trigger_on_cash_out") === "on",
    cash_drawer_last_status: "Not checked",
    cash_drawer_last_checked_at: new Date().toISOString(),
  }).eq("id", orgId);

  revalidatePath("/app/settings");
  revalidatePath("/app/pos");
}

export async function addProduct(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  if (!name) return;
  const availableInPos = formData.get("available_in_pos") === "on";
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const visibility = productModuleVisibility(moduleFlags);
  const typeFields = resolveProductTypeFields(formData, visibility, "create");
  const isSellable = availableInPos || formData.get("is_sellable") === "on";
  const openingStock = visibility.inventory ? nullableNum(formData, "opening_stock") : null;

  const { data: inserted } = await supabase.from("products").insert({
    organisation_id: orgId,
    name,
    category_id: stringValue(formData, "category_id") || null,
    sku: stringValue(formData, "sku") || null,
    unit_of_measure: stringValue(formData, "unit_of_measure") || "each",
    sale_price: numberValue(formData, "sale_price"),
    cost_price: nullableNum(formData, "cost_price"),
    vat_rate: numberValue(formData, "vat_rate"),
    placeholder_type: stringValue(formData, "placeholder_type") || null,
    kitchen_station: stringValue(formData, "kitchen_station") || null,
    available_in_pos: availableInPos,
    is_ingredient: typeFields.is_ingredient,
    is_stock_tracked: typeFields.is_stock_tracked,
    is_sellable: isSellable,
    is_purchaseable: typeFields.is_purchaseable,
    item_type: typeFields.item_type,
    supplier_id: typeFields.supplier_id,
    current_stock_qty: openingStock ?? 0,
    active: true,
  }).select("id").single();

  // Handle image upload after insert so we can use the product ID in the path
  const imageFile = formData.get("image_file") as File | null;
  if (inserted && imageFile && imageFile.size > 0) {
    try {
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      if (ALLOWED_TYPES.includes(imageFile.type)) {
        const ext = imageFile.type === "image/webp" ? "webp" : imageFile.type === "image/png" ? "png" : "jpg";
        const path = `${orgId}/products/${inserted.id}/${Date.now()}.${ext}`;
        const { data: up } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        if (up?.path) {
          const { data: pub } = supabase.storage.from("product-images").getPublicUrl(up.path);
          await supabase.from("products")
            .update({ image_url: pub.publicUrl })
            .eq("id", inserted.id)
            .eq("organisation_id", orgId);
        }
      }
    } catch { /* non-fatal — product saved without image */ }
  }

  // Record opening stock movement if opening_stock was given
  if (visibility.inventory && inserted && openingStock && openingStock > 0) {
    await supabase.from("stock_movements").insert({
      organisation_id: orgId,
      product_id: inserted.id,
      movement_type: "opening",
      quantity_change: openingStock,
      unit_of_measure: stringValue(formData, "unit_of_measure") || "each",
      reason: "Opening stock",
    }).then(() => null, () => null);
  }

  revalidatePath("/app/products");
  revalidatePath("/app/pos");
  revalidatePath("/app/stock");
  redirect("/app/products");
}

/** Minimal POS quick-add — no redirect; returns result for in-till dialog. */
export async function addProductFromPos(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, error: "Permission denied." };
  const name = stringValue(formData, "name");
  if (!name) return { ok: false, error: "Product name is required." };
  const salePrice = numberValue(formData, "sale_price", 0);
  if (!Number.isFinite(salePrice) || salePrice < 0) return { ok: false, error: "Enter a valid sale price." };

  const { error } = await supabase.from("products").insert({
    organisation_id: orgId,
    name,
    category_id: stringValue(formData, "category_id") || null,
    unit_of_measure: "each",
    sale_price: salePrice,
    vat_rate: numberValue(formData, "vat_rate"),
    available_in_pos: true,
    is_ingredient: false,
    is_stock_tracked: false,
    is_sellable: true,
    is_purchaseable: false,
    item_type: "finished_product",
    current_stock_qty: 0,
    active: true,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/products");
  revalidatePath("/app/pos");
  return { ok: true };
}

export async function updateProduct(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, error: "Permission denied." };
  const id = stringValue(formData, "id");
  if (!id) return { ok: false, error: "Product not found." };
  const availableInPos = formData.get("available_in_pos") === "on";

  const [{ data: existing }, moduleFlags] = await Promise.all([
    supabase
      .from("products")
      .select("is_ingredient,is_stock_tracked,is_purchaseable,item_type,supplier_id")
      .eq("id", id)
      .eq("organisation_id", orgId)
      .maybeSingle(),
    fetchOrgModuleFlags(supabase, orgId),
  ]);

  const visibility = productModuleVisibility(moduleFlags);
  const typeFields = resolveProductTypeFields(formData, visibility, "update", existing);

  // Determine image URL: new upload > clear > keep existing
  const imageFile = formData.get("image_file") as File | null;
  const clearImage = formData.get("clear_image") === "1";
  let imageUrl: string | null | undefined = undefined; // undefined = no change

  if (imageFile && imageFile.size > 0) {
    try {
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      if (ALLOWED_TYPES.includes(imageFile.type)) {
        const ext = imageFile.type === "image/webp" ? "webp" : imageFile.type === "image/png" ? "png" : "jpg";
        const path = `${orgId}/products/${id}/${Date.now()}.${ext}`;
        const { data: up } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        if (up?.path) {
          const { data: pub } = supabase.storage.from("product-images").getPublicUrl(up.path);
          imageUrl = pub.publicUrl;
        }
      }
    } catch { /* non-fatal */ }
  } else if (clearImage) {
    imageUrl = null;
  }

  const { error } = await supabase.from("products").update({
    name: stringValue(formData, "name"),
    category_id: stringValue(formData, "category_id") || null,
    sku: stringValue(formData, "sku") || null,
    unit_of_measure: stringValue(formData, "unit_of_measure") || "each",
    sale_price: numberValue(formData, "sale_price"),
    cost_price: nullableNum(formData, "cost_price"),
    vat_rate: numberValue(formData, "vat_rate"),
    ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
    placeholder_type: stringValue(formData, "placeholder_type") || null,
    kitchen_station: stringValue(formData, "kitchen_station") || null,
    available_in_pos: availableInPos,
    is_ingredient: typeFields.is_ingredient,
    is_stock_tracked: typeFields.is_stock_tracked,
    is_sellable: availableInPos || formData.get("is_sellable") === "on",
    is_purchaseable: typeFields.is_purchaseable,
    item_type: typeFields.item_type,
    supplier_id: typeFields.supplier_id,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("organisation_id", orgId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/products");
  revalidatePath(`/app/products/${id}`);
  revalidatePath(`/app/products/${id}/edit`);
  revalidatePath("/app/pos");
  return { ok: true };
}

export async function deleteProduct(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return { ok: false, error: "Permission denied." };
  const id = stringValue(formData, "id");
  if (!id) return { ok: false, error: "Product not found." };
  const { error } = await supabase.from("products").update({ active: false }).eq("id", id).eq("organisation_id", orgId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/products");
  revalidatePath("/app/pos");
  return { ok: true };
}

// ---- POS Session Management ----

export async function openPosSession(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const openingCash = numberValue(formData, "opening_cash", 0);
  // Resolve active site server-side — client cannot spoof site_id
  const { siteId } = await requireActiveSite(supabase, orgId, membership.id, membership.role);

  // Close any stale open sessions first
  await supabase.from("pos_sessions")
    .update({ status: "stale", closed_at: new Date().toISOString() })
    .eq("organisation_id", orgId)
    .eq("status", "open");

  const { error } = await supabase.from("pos_sessions").insert({
    organisation_id: orgId,
    site_id: siteId,
    opened_by: user.id,
    opening_cash: openingCash,
    expected_cash: openingCash,
    status: "open",
  });
  if (error) {
    console.error("openPosSession:", error.message);
    return;
  }
  const cookieStore = await cookies();
  cookieStore.set("pos_till_open", "1", { path: "/app", maxAge: 60 * 60 * 24 });
  revalidatePath("/app/pos");
}

export async function posCashMovement(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const sessionId = stringValue(formData, "session_id");
  const movementType = stringValue(formData, "movement_type"); // "cash_in" | "cash_out"
  const amount = numberValue(formData, "amount", 0);
  const reason = stringValue(formData, "reason");
  if (!sessionId || !amount || !reason) return;

  const absAmount = Math.abs(amount);
  await supabase.from("pos_cash_movements").insert({
    organisation_id: orgId,
    session_id: sessionId,
    movement_type: movementType,
    amount: movementType === "cash_in" ? absAmount : -absAmount,
    reason,
    performed_by: user.id,
  });

  // Update expected cash
  const delta = movementType === "cash_in" ? absAmount : -absAmount;
  const { data: session } = await supabase.from("pos_sessions").select("expected_cash").eq("id", sessionId).single();
  if (session) {
    const newExpected = Number(session.expected_cash ?? 0) + delta;
    await supabase.from("pos_sessions").update({ expected_cash: newExpected }).eq("id", sessionId);
  }

  revalidatePath("/app/pos");
}

export async function closePosSession(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const sessionId = stringValue(formData, "session_id");
  const countedCash = numberValue(formData, "counted_cash", 0);
  const notes = stringValue(formData, "notes") || null;
  if (!sessionId) return;

  const { data: session } = await supabase.from("pos_sessions").select("expected_cash").eq("id", sessionId).single();
  const expectedCash = Number(session?.expected_cash ?? 0);
  const difference = countedCash - expectedCash;

  await supabase.from("pos_sessions").update({
    status: "closed",
    closed_by: user.id,
    closed_at: new Date().toISOString(),
    counted_cash: countedCash,
    cash_difference: difference,
    notes,
    updated_at: new Date().toISOString(),
  }).eq("id", sessionId).eq("organisation_id", orgId);

  const cookieStore = await cookies();
  cookieStore.delete("pos_till_open");

  // Save to pos_daily_close
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("pos_daily_close").insert({
    organisation_id: orgId,
    session_id: sessionId,
    report_date: today,
    expected_cash: expectedCash,
    counted_cash: countedCash,
    cash_difference: difference,
    notes,
    closed_by: user.id,
  }).then(() => null, () => null);

  revalidatePath("/app/pos");
  revalidatePath("/app/reports/z-report");
}

// ---- POS Sale ----

export async function completeSale(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canTransact(membership.role)) return;
  // Resolve active site server-side — client cannot spoof site_id
  const { siteId } = await requireActiveSite(supabase, orgId, membership.id, membership.role);

  type CartItem = PosSaleCartItem;
  const rawCart = stringValue(formData, "cart_json");
  const cart: CartItem[] = rawCart ? JSON.parse(rawCart) : [];
  if (!cart.length) return;

  const sessionId = stringValue(formData, "session_id") || null;
  const paymentMethodId = stringValue(formData, "payment_method_id") || null;
  const paymentType = stringValue(formData, "payment_type") || "other"; // cash|card|online|other
  const customerName = stringValue(formData, "customer_name") || null;
  const legacyCartPct = numberValue(formData, "discount_pct", 0);

  const itemCalcs = buildPosItemCalcs(cart, legacyCartPct);
  const txDiscountPct = transactionDiscountPct(cart, legacyCartPct);

  const subtotalNet = itemCalcs.reduce((s, i) => s + i.net_amount, 0);
  const taxTotal = itemCalcs.reduce((s, i) => s + i.vat_amount, 0);
  const totalGross = itemCalcs.reduce((s, i) => s + i.gross_amount, 0);
  const discountTotal = itemCalcs.reduce((s, i) => s + i.discount_amount, 0);
  const transactionNumber = `KO-${Date.now().toString(36).toUpperCase()}`;

  const { data: tx, error: txErr } = await supabase.from("pos_transactions").insert({
    organisation_id: orgId,
    site_id: siteId,
    transaction_number: transactionNumber,
    sold_by: user.id,
    payment_method_id: paymentMethodId,
    session_id: sessionId,
    customer_name: customerName,
    subtotal: Number(totalGross.toFixed(2)),
    subtotal_net: Number(subtotalNet.toFixed(2)),
    tax_total: Number(taxTotal.toFixed(2)),
    total: Number(totalGross.toFixed(2)),
    total_gross: Number(totalGross.toFixed(2)),
    subtotal_gross_before_discount: Number((totalGross + discountTotal).toFixed(2)),
    discount_total: Number(discountTotal.toFixed(2)),
    discount_pct: txDiscountPct,
    status: "completed",
  }).select("id").single();

  if (txErr || !tx) {
    return;
  }

  const transactionId = tx.id;

  await supabase.from("pos_transaction_items").insert(
    itemCalcs.map((item) => ({
      organisation_id: orgId,
      transaction_id: transactionId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_price_gross: item.unit_price_gross,
      vat_rate: item.vat_rate,
      net_amount: item.net_amount,
      vat_amount: item.vat_amount,
      gross_amount: item.gross_amount,
      line_total: item.line_total,
      discount_amount: item.discount_amount,
      discount_pct: item.applied_discount_pct > 0 ? item.applied_discount_pct : 0,
    }))
  );

  // Reduce ingredient stock for recipe products (non-fatal)
  try {
    const soldProductIds = [...new Set(cart.map((i) => i.product_id).filter(Boolean))];
    if (soldProductIds.length > 0) {
      const { data: recipes } = await supabase
        .from("recipes")
        .select("id,product_id,yield_qty,recipe_items(ingredient_product_id,quantity,unit_of_measure)")
        .in("product_id", soldProductIds)
        .eq("organisation_id", orgId);

      for (const recipe of recipes ?? []) {
        const soldItem = cart.find((i) => i.product_id === recipe.product_id);
        if (!soldItem || !soldItem.quantity) continue;
        const recipeItems = (recipe.recipe_items ?? []) as Array<{ingredient_product_id:string|null;quantity:number;unit_of_measure:string|null}>;
        const yieldQty = Math.max(Number(recipe.yield_qty ?? 1), 1);
        for (const ri of recipeItems) {
          if (!ri.ingredient_product_id) continue;
          const useQty = (Number(ri.quantity) / yieldQty) * soldItem.quantity;
          const { data: prod } = await supabase.from("products").select("current_stock_qty").eq("id", ri.ingredient_product_id).single();
          if (prod) {
            const newQty = Number(prod.current_stock_qty ?? 0) - useQty;
            await supabase.from("products").update({ current_stock_qty: newQty }).eq("id", ri.ingredient_product_id);
            await supabase.from("stock_movements").insert({
              organisation_id: orgId,
              product_id: ri.ingredient_product_id,
              movement_type: "sale_used",
              quantity_change: -useQty,
              unit_of_measure: ri.unit_of_measure ?? "each",
              reference_type: "sale",
              reference_id: transactionId,
              performed_by: user.id,
            }).then(() => null, () => null);
          }
        }
      }
    }
  } catch { /* non-fatal — sale is recorded, stock log failed */ }

  // If cash payment and open session: update expected cash
  if (sessionId && paymentType === "cash") {
    const { data: session } = await supabase.from("pos_sessions").select("expected_cash").eq("id", sessionId).single();
    if (session) {
      const newExpected = Number(session.expected_cash ?? 0) + Number(totalGross.toFixed(2));
      await supabase.from("pos_sessions").update({ expected_cash: newExpected }).eq("id", sessionId);
    }
    // Record cash movement for audit
    await supabase.from("pos_cash_movements").insert({
      organisation_id: orgId,
      session_id: sessionId,
      movement_type: "sale",
      amount: Number(totalGross.toFixed(2)),
      reason: `Sale ${transactionNumber}`,
      performed_by: user.id,
    }).then(() => null, () => null);
  }

  // Audit event (non-fatal)
  await supabase.from("pos_audit_events").insert({
    organisation_id: orgId,
    transaction_id: transactionId,
    event_type: "created",
    performed_by: user.id,
  }).then(() => null, () => null);

  const saleOrgRow = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as unknown as Record<string, unknown> | null;
  await createKitchenOrderIfEnabled({
    supabase,
    orgId,
    userId: user.id,
    orgRow: saleOrgRow,
    transactionId,
    transactionNumber,
    items: cart,
  });

  // ── FiscalNet fiscal receipt (Romania only, non-fatal) ──────────────────
  // SAFETY: Sale already saved above. Fiscal print failure MUST NOT block
  // or lose the sale. Runs after save, before redirect only.
  try {
    const orgRow = saleOrgRow;
    const countryCode = (orgRow?.country_code as string) ?? null;
    const config = buildFiscalNetConfig(orgRow ?? {});
    if (shouldPrintFiscalReceipt(countryCode, config)) {
      if (config.connectionMode === "file") {
        await supabase.from("pos_transactions")
          .update({
            fiscal_receipt_required: true,
            fiscal_receipt_status: "api_pending",
          })
          .eq("id", transactionId)
          .eq("organisation_id", orgId)
          .then(() => null, () => null);
        console.info("[FiscalNet] receipt download required", {
          mode: config.connectionMode,
          transactionId,
          bonuriPathNull: !config.bonuriPath,
          raspunsPathNull: !config.raspunsPath,
        });
      } else {
        await supabase.from("pos_transactions")
          .update({ fiscal_receipt_required: true })
          .eq("id", transactionId)
          .eq("organisation_id", orgId)
          .then(() => null, () => null);

        const fiscalItems = itemCalcs.map((item) => ({
          productName:     item.product_name as string,
          quantity:        Number(item.quantity),
          unitPrice:       Number(item.unit_price),
          vatRate:         Number((item as Record<string, unknown>).vat_rate ?? 0),
          ...(item.applied_discount_pct > 0 ? { discountPercent: item.applied_discount_pct } : {}),
        }));

        await printFiscalReceipt({
          supabase,
          orgId,
          transactionId,
          transactionRef: transactionNumber,
          performedBy: user.id,
          config,
          items: fiscalItems,
          totalGross: Number(totalGross.toFixed(2)),
          paymentType,
        });
      }
    }
  } catch { /* non-fatal — fiscal print failure cannot block the sale */ }

  revalidatePath("/app/pos");
  revalidatePath("/app/transactions");
  revalidatePath("/app/reports/sales");
  revalidatePath("/app");
  const drawerParam = paymentType === "cash" ? "&drawer=cash_sale" : "";
  redirect(`/app/transactions/${transactionId}?recorded=1${drawerParam}`);
}

export async function voidTransaction(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const transactionId = stringValue(formData, "transaction_id");
  const reason = stringValue(formData, "reason");
  if (!transactionId || !reason) return;

  const { data: tx } = await supabase.from("pos_transactions").select("*").eq("organisation_id", orgId).eq("id", transactionId).single();
  if (!tx || tx.status === "voided") return;

  await supabase.from("pos_transactions").update({ status: "voided" }).eq("id", transactionId).eq("organisation_id", orgId);

  // If cash payment with session: reduce expected cash
  const paymentType = (tx.payment_methods as { type?: string } | null)?.type;
  if (tx.session_id && (paymentType === "cash" || !paymentType)) {
    const total = Number(tx.total ?? 0);
    const { data: session } = await supabase.from("pos_sessions").select("expected_cash").eq("id", tx.session_id).single();
    if (session) {
      const newExpected = Number(session.expected_cash ?? 0) - total;
      await supabase.from("pos_sessions").update({ expected_cash: newExpected }).eq("id", tx.session_id);
    }
  }

  await supabase.from("pos_audit_events").insert({
    organisation_id: orgId, transaction_id: transactionId, event_type: "voided",
    reason, before_data: { status: tx.status, total: tx.total }, performed_by: user.id,
  }).then(() => null, () => null);

  revalidatePath(`/app/transactions/${transactionId}`);
  revalidatePath("/app/transactions");
  revalidatePath("/app/reports/sales");
  redirect(`/app/transactions/${transactionId}`);
}

export async function addSupplier(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  if (!name) return;
  await supabase.from("suppliers").insert({
    organisation_id: orgId, name,
    contact_name: stringValue(formData, "contact_name") || null,
    email: stringValue(formData, "email") || null,
    phone: stringValue(formData, "phone") || null,
    address: stringValue(formData, "address") || null,
    notes: stringValue(formData, "notes") || null,
  });
  revalidatePath("/app/suppliers");
  redirect("/app/suppliers");
}

export async function updateSupplier(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  await supabase.from("suppliers").update({
    name: stringValue(formData, "name"),
    contact_name: stringValue(formData, "contact_name") || null,
    email: stringValue(formData, "email") || null,
    phone: stringValue(formData, "phone") || null,
    address: stringValue(formData, "address") || null,
    notes: stringValue(formData, "notes") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/suppliers");
  redirect("/app/suppliers");
}

export async function deleteSupplier(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  await supabase.from("suppliers").update({ active: false }).eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/suppliers");
  redirect("/app/suppliers");
}

async function loadProductNameLookup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  productIds: string[]
) {
  const productLookup = new Map<string, string>();
  if (!productIds.length) return productLookup;
  const { data: prods } = await supabase.from("products").select("id,name").in("id", productIds);
  for (const p of prods ?? []) productLookup.set(p.id, p.name);
  return productLookup;
}

async function replacePurchaseItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  purchaseId: string,
  items: PurchaseLineInput[],
  productLookup: Map<string, string>
) {
  await supabase.from("purchase_items").delete().eq("purchase_id", purchaseId).eq("organisation_id", orgId);
  if (!items.length) return;
  await supabase.from("purchase_items").insert(
    items.map((item) => ({
      organisation_id: orgId,
      purchase_id: purchaseId,
      product_id: item.product_id,
      product_name: productLookup.get(item.product_id) || "Item",
      item_name: productLookup.get(item.product_id) || "Item",
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.total_cost,
      tax_rate: item.tax_rate,
      tax_amount: item.tax_amount,
      unit_of_measure: item.unit_of_measure,
    }))
  );
}

function buildDraftPurchaseRow(
  orgId: string,
  userId: string,
  header: ReturnType<typeof parsePurchaseHeaderFromForm>,
  totals: { subtotalAmount: number; taxTotal: number; totalAmount: number }
) {
  const purchasedAt = new Date(`${header.purchaseDate}T12:00:00`).toISOString();
  return {
    organisation_id: orgId,
    supplier_id: header.supplierId || null,
    supplier: header.supplierId ? "" : "Direct",
    purchased_at: purchasedAt,
    purchase_date: header.purchaseDate,
    nir_date: header.nirDate,
    supplier_invoice_date: header.supplierInvoiceDate,
    reference: header.reference,
    invoice_number: header.invoiceNumber,
    notes: header.notes,
    site_id: header.siteId || null,
    received_by_user_id: header.receivedBy || userId,
    total_amount: totals.totalAmount,
    subtotal_amount: totals.subtotalAmount,
    tax_total: totals.taxTotal,
    status: "draft",
    created_by: userId,
  };
}

async function ensureDraftPurchaseForPost(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  userId: string,
  formData: FormData
): Promise<string | null> {
  const purchaseId = stringValue(formData, "purchase_id") || null;
  const header = parsePurchaseHeaderFromForm(formData);
  let items = parsePurchaseLinesFromForm(formData);

  if (purchaseId) {
    const { data: existing } = await supabase
      .from("purchases")
      .select("id,status,posted_at,nir_number")
      .eq("id", purchaseId)
      .eq("organisation_id", orgId)
      .single();
    if (!existing) return null;
    if (isAlreadyPosted(existing.status, existing.posted_at, existing.nir_number)) {
      redirect(`/app/purchases/${purchaseId}?error=already_posted`);
    }
    if (existing.status === "cancelled") {
      redirect(`/app/purchases/${purchaseId}?error=cancelled`);
    }
    if (existing.status !== "draft") {
      redirect(`/app/purchases/${purchaseId}?error=invalid_status`);
    }

    if (!items.length) {
      items = await loadDraftPurchaseItems(supabase, orgId, purchaseId);
    }
    if (!items.length) return null;

    const totals = purchaseLineTotals(items);
    const productLookup = await loadProductNameLookup(supabase, items.map((i) => i.product_id));
    await supabase
      .from("purchases")
      .update(buildDraftPurchaseRow(orgId, userId, header, totals))
      .eq("id", purchaseId)
      .eq("organisation_id", orgId);
    await replacePurchaseItems(supabase, orgId, purchaseId, items, productLookup);
    return purchaseId;
  }

  if (!items.length) return null;

  const totals = purchaseLineTotals(items);
  const productLookup = await loadProductNameLookup(supabase, items.map((i) => i.product_id));
  const { data: purchase } = await supabase
    .from("purchases")
    .insert(buildDraftPurchaseRow(orgId, userId, header, totals))
    .select("id")
    .single();
  if (!purchase) return null;
  await replacePurchaseItems(supabase, orgId, purchase.id, items, productLookup);
  return purchase.id;
}

function parsePurchaseHeaderFromForm(formData: FormData) {
  const purchaseDate = stringValue(formData, "purchase_date") || new Date().toISOString().slice(0, 10);
  const nirDate = stringValue(formData, "nir_date") || purchaseDate;
  const invoiceNumber = stringValue(formData, "invoice_number") || null;
  const supplierInvoiceDate = stringValue(formData, "supplier_invoice_date") || null;
  const reference = stringValue(formData, "reference") || invoiceNumber || null;
  const notes = stringValue(formData, "notes") || null;
  const siteId = stringValue(formData, "site_id") || null;
  const receivedBy = stringValue(formData, "received_by_user_id") || null;
  return {
    supplierId: stringValue(formData, "supplier_id") || null,
    purchaseDate,
    nirDate,
    invoiceNumber,
    supplierInvoiceDate,
    reference,
    notes,
    siteId,
    receivedBy,
  };
}

async function loadDraftPurchaseItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  purchaseId: string
): Promise<PurchaseLineInput[]> {
  const { data } = await supabase
    .from("purchase_items")
    .select("product_id,quantity,unit_cost,total_cost,tax_rate,tax_amount,unit_of_measure")
    .eq("purchase_id", purchaseId)
    .eq("organisation_id", orgId);
  return (data ?? [])
    .filter((row: { product_id?: string | null; quantity?: number | null }) => row.product_id && Number(row.quantity) > 0)
    .map((row: {
      product_id: string;
      quantity: number;
      unit_cost: number;
      total_cost: number;
      tax_rate: number;
      tax_amount: number;
      unit_of_measure: string | null;
    }) => ({
      product_id: row.product_id,
      quantity: Number(row.quantity),
      unit_cost: Number(row.unit_cost),
      total_cost: Number(row.total_cost),
      tax_rate: Number(row.tax_rate ?? 0),
      tax_amount: Number(row.tax_amount ?? 0),
      unit_of_measure: row.unit_of_measure || "each",
    }));
}

export async function savePurchaseDraft(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const purchaseId = stringValue(formData, "purchase_id") || null;
  const header = parsePurchaseHeaderFromForm(formData);
  const items = parsePurchaseLinesFromForm(formData);
  if (!items.length) return;

  const { subtotalAmount, taxTotal, totalAmount } = purchaseLineTotals(items);
  const productLookup = await loadProductNameLookup(supabase, items.map((i) => i.product_id));

  const row = buildDraftPurchaseRow(orgId, user.id, header, { subtotalAmount, taxTotal, totalAmount });

  let targetId = purchaseId;

  if (purchaseId) {
    const { data: existing } = await supabase
      .from("purchases")
      .select("id,status,posted_at")
      .eq("id", purchaseId)
      .eq("organisation_id", orgId)
      .single();
    if (!existing || existing.status !== "draft" || existing.posted_at) return;
    await supabase.from("purchases").update(row).eq("id", purchaseId).eq("organisation_id", orgId);
    await replacePurchaseItems(supabase, orgId, purchaseId, items, productLookup);
  } else {
    const { data: purchase } = await supabase.from("purchases").insert(row).select("id").single();
    if (!purchase) return;
    targetId = purchase.id;
    await replacePurchaseItems(supabase, orgId, purchase.id, items, productLookup);
  }

  revalidatePath("/app/purchases");
  revalidatePath(`/app/purchases/${targetId}`);
  redirect(`/app/purchases/${targetId}`);
}

export async function postNirPurchase(formData: FormData) {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const draftId = await ensureDraftPurchaseForPost(supabase, orgId, user.id, formData);
  if (!draftId) {
    redirect("/app/purchases/new?error=no_items");
  }

  const serviceSupabase = await createServiceClient();
  const { error } = await serviceSupabase.rpc("post_nir_purchase", {
    p_purchase_id: draftId,
    p_org_id: orgId,
    p_actor_id: user.id,
  });

  if (error) {
    const code = mapNirPostRpcError(error.message);
    redirect(nirPostErrorRedirect(draftId, code));
  }

  revalidatePath("/app/purchases");
  revalidatePath("/app/stock");
  revalidatePath("/app/products");
  revalidatePath(`/app/purchases/${draftId}`);
  redirect(`/app/purchases/${draftId}?posted=1`);
}

/** @deprecated Use postNirPurchase — kept for import paths that still call addPurchase */
export async function addPurchase(formData: FormData) {
  return postNirPurchase(formData);
}

export async function addRecipe(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const productId = stringValue(formData, "product_id");
  const ingredientNames = formData.getAll("ingredient_name").map((v) => String(v).trim());
  if (!productId || !ingredientNames.some(Boolean)) return;
  const recipeName = stringValue(formData, "name") || "Recipe";
  const quantities = formData.getAll("quantity").map((v) => Number(v || 0));
  const units = formData.getAll("unit_of_measure").map((v) => String(v || "each"));
  const unitCosts = formData.getAll("unit_cost").map((v) => Number(v || 0));
  const { data: recipe } = await supabase.from("recipes").insert({
    organisation_id: orgId, product_id: productId, name: recipeName,
    yield_qty: numberValue(formData, "yield_qty", 1),
  }).select("id").single();
  if (!recipe) return;
  await supabase.from("recipe_items").insert(
    ingredientNames.flatMap((ingredientName, index) => {
      if (!ingredientName) return [];
      const quantity = quantities[index] ?? 0;
      const unitCost = unitCosts[index] ?? 0;
      const totalCost = quantity * unitCost;
      return [{ organisation_id: orgId, recipe_id: recipe.id, ingredient_name: ingredientName, quantity, unit_of_measure: units[index] || "each", unit_cost: unitCost, total_cost: totalCost, unit: units[index] || "each", cost: totalCost }];
    })
  );
  revalidatePath("/app/recipes");
}

export async function addRecipeFromProducts(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const productId = stringValue(formData, "product_id");
  if (!productId) return;
  const recipeName = stringValue(formData, "name") || "Recipe";
  const yieldQty = numberValue(formData, "yield_qty", 1);

  const ingredientProductIds = formData.getAll("ingredient_product_id").map((v) => String(v)).filter(Boolean);
  const quantities = formData.getAll("quantity").map((v) => Number(v || 0));

  if (!ingredientProductIds.length || ingredientProductIds.every((id, i) => !id || !(quantities[i] > 0))) return;

  // Fetch ingredient product details (name, unit, cost)
  const { data: ingredientProducts } = await supabase
    .from("products")
    .select("id,name,unit_of_measure,cost_price")
    .in("id", ingredientProductIds.filter(Boolean));

  const productMap = new Map((ingredientProducts ?? []).map((p) => [p.id, p]));

  const { data: recipe } = await supabase.from("recipes").insert({
    organisation_id: orgId, product_id: productId, name: recipeName, yield_qty: yieldQty,
  }).select("id").single();
  if (!recipe) return;

  const items = ingredientProductIds.flatMap((pid, i) => {
    if (!pid || !(quantities[i] > 0)) return [];
    const p = productMap.get(pid);
    const unitCost = Number(p?.cost_price ?? 0);
    const qty = quantities[i];
    return [{
      organisation_id: orgId,
      recipe_id: recipe.id,
      ingredient_product_id: pid,
      ingredient_name: p?.name ?? "Unknown",
      quantity: qty,
      unit_of_measure: p?.unit_of_measure ?? "each",
      unit: p?.unit_of_measure ?? "each",
      unit_cost: unitCost,
      cost: unitCost * qty,
      total_cost: unitCost * qty,
    }];
  });

  if (items.length) await supabase.from("recipe_items").insert(items);

  revalidatePath("/app/recipes");
  redirect("/app/recipes");
}

export async function addCustomer(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  if (!name) return;
  await supabase.from("customers").insert({
    organisation_id: orgId,
    name,
    email: stringValue(formData, "email") || null,
    phone: stringValue(formData, "phone") || null,
    notes: stringValue(formData, "notes") || null,
  });
  revalidatePath("/app/customers");
  redirect("/app/customers");
}

export async function addCustomerFromPos(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canTransact(membership.role)) return;
  const name = stringValue(formData, "name");
  if (!name) return;
  await supabase.from("customers").insert({
    organisation_id: orgId,
    name,
    email: stringValue(formData, "email") || null,
    phone: stringValue(formData, "phone") || null,
    notes: stringValue(formData, "notes") || null,
  });
  revalidatePath("/app/pos");
  revalidatePath("/app/customers");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === "," && !quoted) { row.push(cell.trim()); cell = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
      continue;
    }
    cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() ?? []).map((h) => h.toLowerCase().trim());
  return rows.map((cols) => Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""])));
}

function csvBool(v: string) {
  return ["1", "true", "yes", "y", "on"].includes(String(v ?? "").trim().toLowerCase());
}

async function csvText(formData: FormData) {
  const file = formData.get("csv_file") as File | null;
  if (file && file.size > 0) return file.text();
  return stringValue(formData, "csv_text");
}

export async function importProductsCsv(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const rows = parseCsv(await csvText(formData));
  let imported = 0, skipped = 0;
  const { data: existingCats } = await supabase.from("product_categories").select("id,name").eq("organisation_id", orgId);
  const categories = new Map((existingCats ?? []).map((c) => [String(c.name).toLowerCase(), c.id]));
  const { data: vatRateRows } = await supabase
    .from("vat_rates")
    .select("id,name,rate,is_default,active,fiscalnet_vat_group,sort_order")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("sort_order");
  const catalogRates = (vatRateRows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    rate: Number(r.rate),
    is_default: r.is_default as boolean | null,
    active: r.active as boolean | null,
    fiscalnet_vat_group: r.fiscalnet_vat_group as number | null,
    sort_order: r.sort_order as number | null,
  }));
  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) { skipped++; continue; }
    let categoryId = null;
    const categoryName = row.category?.trim();
    if (categoryName) {
      categoryId = categories.get(categoryName.toLowerCase()) ?? null;
      if (!categoryId) {
        const { data: cat } = await supabase.from("product_categories").insert({ organisation_id: orgId, name: categoryName }).select("id").single();
        categoryId = cat?.id ?? null;
        if (categoryId) categories.set(categoryName.toLowerCase(), categoryId);
      }
    }
    const rawVat = row.vat_rate !== "" && row.vat_rate != null ? Number(row.vat_rate) : null;
    let vatRate = rawVat ?? 0;
    if (catalogRates.length > 0) {
      const nearest = nearestVatRate(catalogRates, vatRate);
      vatRate = nearest?.rate ?? vatRate;
    }
    const { error } = await supabase.from("products").insert({
      organisation_id: orgId, name, category_id: categoryId,
      sku: row.sku || row.barcode || null,
      unit_of_measure: row.unit || "each",
      sale_price: Number(row.sale_price_gross || 0),
      cost_price: row.cost_price ? Number(row.cost_price) : null,
      vat_rate: vatRate,
      available_in_pos: row.available_in_pos ? csvBool(row.available_in_pos) : true,
      is_ingredient: csvBool(row.is_ingredient),
      is_stock_tracked: csvBool(row.is_stock_tracked),
      is_sellable: !csvBool(row.is_ingredient),
      current_stock_qty: row.current_stock_qty ? Number(row.current_stock_qty) : 0,
      reorder_level: row.reorder_level ? Number(row.reorder_level) : 0,
      image_url: row.image_url || null, active: true,
    });
    if (error) skipped++; else imported++;
  }
  revalidatePath("/app/products");
  revalidatePath("/app/pos");
  redirect(`/app/products/import?imported=${imported}&skipped=${skipped}`);
}

export async function importSuppliersCsv(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const rows = parseCsv(await csvText(formData));
  const payload = rows.filter((r) => r.name).map((r) => ({
    organisation_id: orgId, name: r.name, contact_name: r.contact_name || null,
    phone: r.phone || null, email: r.email || null, address: r.address || null,
    notes: r.notes || null, active: true,
  }));
  if (payload.length) await supabase.from("suppliers").insert(payload);
  revalidatePath("/app/suppliers");
  redirect(`/app/suppliers/import?imported=${payload.length}&skipped=${Math.max(rows.length - payload.length, 0)}`);
}

export async function importCustomersCsv(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const rows = parseCsv(await csvText(formData));
  const payload = rows.filter((r) => r.name).map((r) => ({
    organisation_id: orgId, name: r.name, phone: r.phone || null,
    email: r.email || null, notes: r.notes || null,
  }));
  if (payload.length) await supabase.from("customers").insert(payload);
  revalidatePath("/app/customers");
  redirect(`/app/customers/import?imported=${payload.length}&skipped=${Math.max(rows.length - payload.length, 0)}`);
}

export async function cancelPurchase(formData: FormData) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const purchaseId = stringValue(formData, "purchase_id");
  if (!purchaseId) return;
  const { data: purchase } = await supabase
    .from("purchases")
    .select("status,posted_at")
    .eq("id", purchaseId)
    .eq("organisation_id", orgId)
    .single();
  if (!purchase || !canCancelPurchase(purchase.status)) {
    redirect(`/app/purchases/${purchaseId}?error=cannot_cancel`);
  }
  await supabase
    .from("purchases")
    .update({ status: "cancelled" })
    .eq("id", purchaseId)
    .eq("organisation_id", orgId);
  revalidatePath("/app/purchases");
  redirect("/app/purchases");
}
export async function deleteProducts(ids: string[]) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  if (!ids.length) return;
  await supabase.from("products").update({ active: false }).in("id", ids).eq("organisation_id", orgId);
  revalidatePath("/app/products");
  revalidatePath("/app/pos");
  revalidatePath("/app/stock");
}

export async function deletePurchases(ids: string[]) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  if (!ids.length) return;
  const { data: rows } = await supabase
    .from("purchases")
    .select("id,status")
    .in("id", ids)
    .eq("organisation_id", orgId);
  const draftIds = (rows ?? []).filter((r) => canCancelPurchase(r.status)).map((r) => r.id);
  if (!draftIds.length) return;
  await supabase.from("purchases").update({ status: "cancelled" }).in("id", draftIds).eq("organisation_id", orgId);
  revalidatePath("/app/purchases");
}

export async function deleteSuppliers(ids: string[]) {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  if (!ids.length) return;
  await supabase.from("suppliers").update({ active: false }).in("id", ids).eq("organisation_id", orgId);
  revalidatePath("/app/suppliers");
}

export async function createIngredientInline(formData: FormData): Promise<{ id: string; name: string; unit_of_measure: string | null; cost_price: number | null; current_stock_qty: number | null } | { error: string }> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return { error: "Permission denied" };

  const name = stringValue(formData, "name");
  if (!name) return { error: "Name is required" };

  const unitOfMeasure = stringValue(formData, "unit_of_measure") || "each";
  const costPrice = numberValue(formData, "cost_price", 0);
  const openingStock = numberValue(formData, "opening_stock", 0);

  const { data, error } = await supabase.from("products").insert({
    organisation_id: orgId,
    name,
    unit_of_measure: unitOfMeasure,
    cost_price: costPrice,
    current_stock_qty: openingStock,
    is_ingredient: true,
    is_stock_tracked: true,
    is_sellable: false,
    available_in_pos: false,
    active: true,
  }).select("id,name,unit_of_measure,cost_price,current_stock_qty").single();

  if (error || !data) return { error: error?.message ?? "Failed to create" };
  revalidatePath("/app/recipes");
  return data as { id: string; name: string; unit_of_measure: string | null; cost_price: number | null; current_stock_qty: number | null };
}

export async function updateProductStock(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) throw new Error("Permission denied");
  const productId = stringValue(formData, "product_id");
  if (!productId) throw new Error("Product ID required");
  const qty = numberValue(formData, "quantity", 0);
  const { error } = await supabase
    .from("products")
    .update({ current_stock_qty: qty })
    .eq("id", productId)
    .eq("organisation_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/app/products");
}

// ── Business country ────────────────────────────────────────────
const ALLOWED_COUNTRY_CODES = ["IE", "RO", "UK", "OTHER"] as const;
type CountryCode = (typeof ALLOWED_COUNTRY_CODES)[number];

export async function updateOrgCountry(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const raw = stringValue(formData, "country_code");
  const code: CountryCode = (ALLOWED_COUNTRY_CODES as readonly string[]).includes(raw)
    ? (raw as CountryCode)
    : "IE";
  await supabase.from("organisations").update({ country_code: code }).eq("id", orgId);
  revalidatePath("/app/settings");
}

// ── updateOrgCurrency ────────────────────────────────────────────────────────
const ALLOWED_CURRENCIES: Record<string, { code: string; symbol: string }> = {
  EUR: { code: "EUR", symbol: "€" },
  RON: { code: "RON", symbol: "lei" },
  GBP: { code: "GBP", symbol: "£" },
  USD: { code: "USD", symbol: "$" },
  DKK: { code: "DKK", symbol: "kr" },
  SEK: { code: "SEK", symbol: "kr" },
  NOK: { code: "NOK", symbol: "kr" },
  CHF: { code: "CHF", symbol: "Fr" },
  PLN: { code: "PLN", symbol: "zł" },
  CZK: { code: "CZK", symbol: "Kč" },
  HUF: { code: "HUF", symbol: "Ft" },
};

export async function updateOrgCurrency(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const raw = stringValue(formData, "currency_code");
  const entry = ALLOWED_CURRENCIES[raw] ?? ALLOWED_CURRENCIES["EUR"];
  await supabase
    .from("organisations")
    .update({ currency_code: entry.code, currency_symbol: entry.symbol })
    .eq("id", orgId);
  revalidatePath("/app", "layout");
}

export async function updateOrganisationIndustry(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  await supabase
    .from("organisations")
    .update({ business_type: normaliseIndustry(formData.get("business_type")) })
    .eq("id", orgId);
  revalidatePath("/app/settings");
  revalidatePath("/app", "layout");
}

export async function updateRestaurantFeatureFlags(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const { data: before } = await supabase
    .from("organisations")
    .select(RESTAURANT_FEATURE_KEYS.join(","))
    .eq("id", orgId)
    .maybeSingle();
  const beforeFlags = (before ?? {}) as Partial<Record<RestaurantFeatureKey, boolean | null>>;

  const updates = Object.fromEntries(
    RESTAURANT_FEATURE_KEYS.map((key) => [key, formData.get(key) === "on"])
  ) as Record<RestaurantFeatureKey, boolean>;

  await supabase.from("organisations").update(updates).eq("id", orgId);

  for (const key of RESTAURANT_FEATURE_KEYS) {
    const oldValue = Boolean(beforeFlags[key]);
    const newValue = updates[key];
    if (oldValue === newValue) continue;
    await supabase.from("pos_audit_events").insert({
      organisation_id: orgId,
      event_type: newValue ? "feature_enabled" : "feature_disabled",
      before_data: { feature: key, enabled: oldValue },
      after_data: { feature: key, enabled: newValue },
      performed_by: user.id,
    }).then(() => null, () => null);
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/kitchen");
  revalidatePath("/app", "layout");
}

export async function updateKitchenOrderStatus(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canUpdateKitchen(membership.role)) return;

  const id = stringValue(formData, "kitchen_order_id");
  const status = stringValue(formData, "status");
  if (!id || !["sent", "preparing", "ready", "completed"].includes(status)) return;

  const timestampColumn = `${status}_at`;
  await supabase
    .from("kitchen_orders")
    .update({ status, [timestampColumn]: new Date().toISOString() })
    .eq("id", id)
    .eq("organisation_id", orgId);

  await supabase.from("pos_audit_events").insert({
    organisation_id: orgId,
    event_type: "kitchen_order_status_changed",
    after_data: { kitchen_order_id: id, status },
    performed_by: user.id,
  }).then(() => null, () => null);

  revalidatePath("/app/kitchen");
}


// ── completeSaleReturn ───────────────────────────────────────────────────────
// Same as completeSale but returns data instead of redirecting.
// Used by PosRegister so the client can handle FiscalNet browser API call.

export type CompleteSaleResult =
  | { ok: false; error: string }
  | {
      ok: true;
      transactionId: string;
      transactionNumber: string;
      total: number;
      paymentType: string;
      cashSale: boolean;
      items: Array<{ productName: string; quantity: number; unitPrice: number; vatRate: number; fiscalNetGroup: number | null; discountPercent?: number; discountValue?: number }>;
      fiscalApiPending: boolean;
      changeDue?: number;
    };

export async function completeSaleReturn(formData: FormData): Promise<CompleteSaleResult> {
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canTransact(membership.role)) return { ok: false, error: "Permission denied." };
  // Resolve active site server-side — client cannot spoof site_id
  const { siteId } = await requireActiveSite(supabase, orgId, membership.id, membership.role);

  type CartItem = PosSaleCartItem;
  const rawCart = stringValue(formData, "cart_json");
  const cart: CartItem[] = rawCart ? JSON.parse(rawCart) : [];
  if (!cart.length) return { ok: false, error: "Cart is empty." };

  const sessionId        = stringValue(formData, "session_id") || null;
  const paymentMethodId  = stringValue(formData, "payment_method_id") || null;
  const paymentType      = stringValue(formData, "payment_type") || "other";
  const customerName     = stringValue(formData, "customer_name") || null;
  const legacyCartPct    = numberValue(formData, "discount_pct", 0);
  const cashReceivedRaw  = stringValue(formData, "cash_received");
  const cashReceivedNum  = cashReceivedRaw ? parseFloat(cashReceivedRaw) : null;
  const cashReceivedStored = (cashReceivedNum !== null && Number.isFinite(cashReceivedNum) && cashReceivedNum > 0)
    ? Number(cashReceivedNum.toFixed(2))
    : null;
  const orgRow = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as unknown as Record<string, unknown> | null;
  const splitEnabled = Boolean(orgRow?.payment_split_enabled);
  const tipsEnabled = Boolean(orgRow?.tips_enabled);
  const kitchenEnabled = Boolean(orgRow?.kitchen_display_enabled);
  const restaurantFlowEnabled = Boolean(orgRow?.restaurant_order_flow_enabled);
  const orderTypesEnabled = Boolean(orgRow?.order_types_enabled);
  const tableServiceEnabled = Boolean(orgRow?.table_service_enabled);
  const orderType = orderTypesEnabled ? stringValue(formData, "order_type") : "";
  const tableLabel = tableServiceEnabled ? stringValue(formData, "table_label") : "";
  const kitchenNote = (kitchenEnabled || restaurantFlowEnabled) ? stringValue(formData, "kitchen_note") : "";
  const customerNote = restaurantFlowEnabled ? stringValue(formData, "customer_note") : "";
  const txDiscountPct = transactionDiscountPct(cart, legacyCartPct);

  const itemCalcs = buildPosItemCalcs(cart, legacyCartPct);

  const subtotalNet = itemCalcs.reduce((s, i) => s + i.net_amount, 0);
  const taxTotal    = itemCalcs.reduce((s, i) => s + i.vat_amount, 0);
  const totalGross  = itemCalcs.reduce((s, i) => s + i.gross_amount, 0);
  const tipAmount = tipsEnabled ? Math.max(0, Number(numberValue(formData, "tip_amount", 0).toFixed(2))) : 0;
  const saleTotal = Number((totalGross + tipAmount).toFixed(2));
  const discountTotal = itemCalcs.reduce((s, i) => s + i.discount_amount, 0);
  const transactionNumber = `KO-${Date.now().toString(36).toUpperCase()}`;

  type PaymentRow = { method: string; payment_method_id: string | null; amount: number; reference?: string; note?: string };
  let paymentRows: PaymentRow[] = [];
  if (splitEnabled) {
    try {
      const raw = stringValue(formData, "split_payments_json");
      const parsed = raw ? JSON.parse(raw) as Array<Record<string, unknown>> : [];
      paymentRows = parsed
        .map((row) => ({
          method: String(row.method ?? "other"),
          payment_method_id: row.payment_method_id ? String(row.payment_method_id) : null,
          amount: Number(row.amount ?? 0),
          reference: row.reference ? String(row.reference) : undefined,
          note: row.note ? String(row.note) : undefined,
        }))
        .filter((row) => Number.isFinite(row.amount) && row.amount > 0);
    } catch {
      return { ok: false, error: "Split payments are not valid." };
    }
    if (!paymentRows.length) {
      // No split rows submitted — fall back to the selected payment method
      paymentRows = [{ method: paymentType, payment_method_id: paymentMethodId, amount: saleTotal }];
    }
  } else {
    paymentRows = [{ method: paymentType, payment_method_id: paymentMethodId, amount: saleTotal }];
  }

  const paidTotal = Number(paymentRows.reduce((sum, row) => sum + row.amount, 0).toFixed(2));
  const hasCashPayment = paymentRows.some((row) => row.method === "cash");
  const cashOverpay = splitEnabled && hasCashPayment && paidTotal > saleTotal ? Number((paidTotal - saleTotal).toFixed(2)) : 0;
  if (paidTotal + 0.0001 < saleTotal) return { ok: false, error: "Payment total is less than the sale total." };
  if (paidTotal > saleTotal + 0.0001 && !cashOverpay) return { ok: false, error: "Payment total is higher than the sale total." };
  // Server-side: cash received must cover the sale total if provided
  if (paymentType === "cash" && !splitEnabled && cashReceivedStored !== null && cashReceivedStored + 0.005 < saleTotal) {
    return { ok: false, error: "Cash received is less than the total due." };
  }

  const { data: tx, error: txErr } = await supabase.from("pos_transactions").insert({
    organisation_id: orgId,
    site_id: siteId,
    transaction_number: transactionNumber,
    sold_by: user.id,
    payment_method_id: paymentMethodId,
    session_id: sessionId,
    customer_name: customerName,
    notes: customerNote || null,
    subtotal: Number(totalGross.toFixed(2)),
    subtotal_net: Number(subtotalNet.toFixed(2)),
    tax_total: Number(taxTotal.toFixed(2)),
    total: saleTotal,
    total_gross: saleTotal,
    tip_amount: tipAmount,
    subtotal_gross_before_discount: Number((totalGross + discountTotal).toFixed(2)),
    discount_total: Number(discountTotal.toFixed(2)),
    discount_pct: txDiscountPct,
    status: "completed",
  }).select("id").single();

  if (txErr || !tx) return { ok: false, error: txErr?.message ?? "Failed to save transaction." };

  const transactionId = tx.id;

  await supabase.from("pos_transaction_items").insert(
    itemCalcs.map((item) => ({
      organisation_id:  orgId,
      transaction_id:   transactionId,
      product_id:       item.product_id,
      product_name:     item.product_name,
      quantity:         item.quantity,
      unit_price:       item.unit_price,
      unit_price_gross: item.unit_price_gross,
      vat_rate:         item.vat_rate,
      net_amount:       item.net_amount,
      vat_amount:       item.vat_amount,
      gross_amount:     item.gross_amount,
      line_total:       item.line_total,
      discount_amount:  item.discount_amount,
      discount_pct:     item.applied_discount_pct > 0 ? item.applied_discount_pct : 0,
    }))
  );

  // Stock reduction (non-fatal)
  try {
    const soldProductIds = [...new Set(cart.map((i) => i.product_id).filter(Boolean))];
    if (soldProductIds.length > 0) {
      const { data: recipes } = await supabase
        .from("recipes")
        .select("id,product_id,yield_qty,recipe_items(ingredient_product_id,quantity,unit_of_measure)")
        .in("product_id", soldProductIds)
        .eq("organisation_id", orgId);
      for (const recipe of recipes ?? []) {
        const soldItem = cart.find((i) => i.product_id === recipe.product_id);
        if (!soldItem) continue;
        const recipeItems = (recipe.recipe_items ?? []) as Array<{ingredient_product_id:string|null;quantity:number;unit_of_measure:string|null}>;
        const yieldQty = Math.max(Number(recipe.yield_qty ?? 1), 1);
        for (const ri of recipeItems) {
          if (!ri.ingredient_product_id) continue;
          const useQty = (Number(ri.quantity) / yieldQty) * soldItem.quantity;
          const { data: prod } = await supabase.from("products").select("current_stock_qty").eq("id", ri.ingredient_product_id).single();
          if (prod) {
            await supabase.from("products").update({ current_stock_qty: Number(prod.current_stock_qty ?? 0) - useQty }).eq("id", ri.ingredient_product_id);
            await supabase.from("stock_movements").insert({ organisation_id: orgId, product_id: ri.ingredient_product_id, movement_type: "sale_used", quantity_change: -useQty, unit_of_measure: ri.unit_of_measure ?? "each", reference_type: "sale", reference_id: transactionId, performed_by: user.id }).then(() => null, () => null);
          }
        }
      }
    }
  } catch { /* non-fatal */ }

  // Cash session tracking
  await supabase.from("sale_payments").insert(
    paymentRows.map((row) => ({
      organisation_id: orgId,
      sale_id: transactionId,
      method: row.method,
      payment_method_id: row.payment_method_id,
      amount: row.amount,
      currency: ((orgRow?.currency_code as string | undefined) ?? "EUR"),
      reference: row.reference ?? null,
      note: row.note ?? null,
      created_by: user.id,
      metadata: {
        ...(splitEnabled ? { split: true } : {}),
        ...(!splitEnabled && row.method === "cash" && cashReceivedStored !== null ? {
          cash_received: cashReceivedStored,
          change_due: Number((cashReceivedStored - saleTotal).toFixed(2)),
        } : {}),
      },
    }))
  ).then(() => null, () => null);

  if (sessionId && hasCashPayment) {
    const cashAmount = paymentRows.filter((row) => row.method === "cash").reduce((sum, row) => sum + row.amount, 0) - cashOverpay;
    const { data: session } = await supabase.from("pos_sessions").select("expected_cash").eq("id", sessionId).single();
    if (session) {
      await supabase.from("pos_sessions").update({ expected_cash: Number(session.expected_cash ?? 0) + Number(cashAmount.toFixed(2)) }).eq("id", sessionId);
    }
    await supabase.from("pos_cash_movements").insert({ organisation_id: orgId, session_id: sessionId, movement_type: "sale", amount: Number(cashAmount.toFixed(2)), reason: `Sale ${transactionNumber}`, performed_by: user.id }).then(() => null, () => null);
  }

  // Audit event
  await supabase.from("pos_audit_events").insert({ organisation_id: orgId, transaction_id: transactionId, event_type: "created", performed_by: user.id }).then(() => null, () => null);

  await createKitchenOrderIfEnabled({
    supabase,
    orgId,
    userId: user.id,
    orgRow,
    transactionId,
    transactionNumber,
    items: cart,
    orderType,
    tableLabel,
    note: kitchenNote,
  });

  // ── FiscalNet: for API mode, mark pending — browser will fire the call ──
  const countryCode = (orgRow?.country_code as string) ?? null;
  const isRO = countryCode === "RO";
  const fnEnabled = isFiscalNetActive(countryCode, orgRow?.fiscalnet_enabled as boolean | null | undefined);
  const fnMock    = (orgRow?.fiscalnet_mock_mode as boolean) !== false;
  const connMode  = (orgRow?.fiscalnet_connection_mode as string) ?? "api";

  // For API mode: just mark the flag — browser will call localhost:65400
  const fiscalApiPending = fnEnabled && (connMode === "file" || !fnMock);
  if (fnEnabled) {
    await supabase.from("pos_transactions")
      .update({ fiscal_receipt_required: true, fiscal_receipt_status: (fiscalApiPending) ? "api_pending" : "pending" })
      .eq("id", transactionId).eq("organisation_id", orgId)
      .then(() => null, () => null);
  }

  revalidatePath("/app/pos");
  revalidatePath("/app/transactions");
  revalidatePath("/app/reports/sales");
  revalidatePath("/app");

  return {
    ok: true,
    transactionId,
    transactionNumber,
    total: saleTotal,
    paymentType,
    cashSale: hasCashPayment,
    items: itemCalcs.map((i) => ({
      productName: i.product_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      vatRate: i.vat_rate,
      fiscalNetGroup: (i as CartItem).fiscalnet_vat_group ?? null,
      ...(i.applied_discount_pct > 0 ? { discountPercent: i.applied_discount_pct } : {}),
    })),
    fiscalApiPending,
    changeDue: cashOverpay,
  };
}

// ── Payment Methods Management ────────────────────────────────────────────

export async function addPaymentMethod(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  const type = stringValue(formData, "type") || "other";
  const fiscalnetCode = formData.get("fiscalnet_code") ? Number(formData.get("fiscalnet_code")) : null;
  if (!name) return;
  await supabase.from("payment_methods").insert({
    organisation_id: orgId,
    name,
    type,
    fiscalnet_code: fiscalnetCode,
    active: true,
  });
  revalidatePath("/app/settings");
}

export async function updatePaymentMethod(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  const name = stringValue(formData, "name");
  const type = stringValue(formData, "type");
  const active = formData.get("active") === "true";
  const fcRaw = formData.get("fiscalnet_code");
  const fiscalnetCode = fcRaw && String(fcRaw).trim() !== "" ? Number(fcRaw) : null;
  if (!id) return;
  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (type) updates.type = type;
  updates.active = active;
  updates.fiscalnet_code = fiscalnetCode;
  await supabase.from("payment_methods").update(updates).eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/settings");
}

export async function deletePaymentMethod(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  await supabase.from("payment_methods").delete().eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/settings");
}

// ── VAT Rates Management ─────────────────────────────────────────────────

export async function addVatRate(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const name = stringValue(formData, "name");
  const rate = numberValue(formData, "rate");
  const fgRaw = formData.get("fiscalnet_vat_group");
  const fiscalnetVatGroup = fgRaw && String(fgRaw).trim() !== "" ? Number(fgRaw) : null;
  const isDefault = formData.get("is_default") === "true";
  if (!name) return;
  if (isDefault) {
    await supabase.from("vat_rates").update({ is_default: false }).eq("organisation_id", orgId);
  }
  await supabase.from("vat_rates").insert({
    organisation_id: orgId,
    name,
    rate,
    fiscalnet_vat_group: fiscalnetVatGroup,
    is_default: isDefault,
    active: true,
  });
  revalidatePath("/app/settings");
  revalidatePath("/app/products");
}

export async function updateVatRate(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  const name = stringValue(formData, "name");
  const rate = numberValue(formData, "rate");
  const fgRaw = formData.get("fiscalnet_vat_group");
  const fiscalnetVatGroup = fgRaw && String(fgRaw).trim() !== "" ? Number(fgRaw) : null;
  const isDefault = formData.get("is_default") === "true";
  const active = formData.get("active") !== "false";
  if (isDefault) {
    await supabase.from("vat_rates").update({ is_default: false }).eq("organisation_id", orgId).neq("id", id);
  }
  await supabase.from("vat_rates").update({ name, rate, fiscalnet_vat_group: fiscalnetVatGroup, is_default: isDefault, active }).eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/settings");
}

export async function deleteVatRate(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const id = stringValue(formData, "id");
  if (!id) return;
  await supabase.from("vat_rates").delete().eq("id", id).eq("organisation_id", orgId);
  revalidatePath("/app/settings");
}

// ── VAT defaults seeding ─────────────────────────────────────────────────

export async function seedDefaultVatRates(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const countryCode = (stringValue(formData, "country_code") ?? "IE").toUpperCase();
  const defaults = VAT_DEFAULTS_BY_COUNTRY[countryCode] ?? VAT_DEFAULTS_BY_COUNTRY.IE;
  const { count } = await supabase
    .from("vat_rates")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId);
  if ((count ?? 0) > 0) return; // don't overwrite existing
  const rows = defaults.map((d, i) => ({
    organisation_id: orgId,
    name: d.name,
    rate: d.rate,
    fiscalnet_vat_group: d.fiscalnet_vat_group,
    is_default: d.is_default,
    active: true,
    sort_order: i + 1,
  }));
  await supabase.from("vat_rates").insert(rows);
  revalidatePath("/app/settings");
}


// ── Business profile & modules ────────────────────────────────────────────

export async function updateBusinessCapabilities(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  "use server";
  const { supabase, membership, user, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) {
    return { ok: false, error: "You do not have permission to change these settings." };
  }

  const profile = String(formData.get("business_profile") ?? "").trim();

  const moduleResult = await saveOrgModuleFlags(supabase, orgId, {
    business_profile: profile,
    inventory_enabled: formCheckboxEnabled(formData, "inventory_enabled"),
    recipe_costing_enabled: formCheckboxEnabled(formData, "recipe_costing_enabled"),
    team_advanced_enabled: formCheckboxEnabled(formData, "team_advanced_enabled"),
    multi_site_ops_enabled: formCheckboxEnabled(formData, "multi_site_ops_enabled"),
  });
  if (!moduleResult.ok) {
    return { ok: false, error: moduleResult.error };
  }

  const { data: before } = await supabase
    .from("organisations")
    .select(RESTAURANT_FEATURE_KEYS.join(","))
    .eq("id", orgId)
    .maybeSingle();
  const beforeFlags = (before ?? {}) as Partial<Record<RestaurantFeatureKey, boolean | null>>;

  const featureUpdates = Object.fromEntries(
    RESTAURANT_FEATURE_KEYS.map((key) => [key, formCheckboxEnabled(formData, key)])
  ) as Record<RestaurantFeatureKey, boolean>;

  const { error: featureError } = await supabase.from("organisations").update(featureUpdates).eq("id", orgId);
  if (featureError) {
    console.error("update_business_capabilities_features", featureError);
    return { ok: false, error: "Module settings saved, but feature toggles could not be updated." };
  }

  for (const key of RESTAURANT_FEATURE_KEYS) {
    const oldValue = Boolean(beforeFlags[key]);
    const newValue = featureUpdates[key];
    if (oldValue === newValue) continue;
    await supabase.from("pos_audit_events").insert({
      organisation_id: orgId,
      event_type: newValue ? "feature_enabled" : "feature_disabled",
      before_data: { feature: key, enabled: oldValue },
      after_data: { feature: key, enabled: newValue },
      performed_by: user.id,
    }).then(() => null, () => null);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/setup-checklist");
  revalidatePath("/app/reports");
  revalidatePath("/app/products");
  revalidatePath("/app/stock");
  revalidatePath("/app/purchases");
  revalidatePath("/app/suppliers");
  revalidatePath("/app/recipes");
  revalidatePath("/app/operations");
  return { ok: true };
}

export async function updateBusinessProfileAndModules(formData: FormData): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const profile = String(formData.get("business_profile") ?? "").trim();
  const inventory = formCheckboxEnabled(formData, "inventory_enabled");
  const recipeCosting = formCheckboxEnabled(formData, "recipe_costing_enabled");
  const teamAdvanced = formCheckboxEnabled(formData, "team_advanced_enabled");
  const multiSite = formCheckboxEnabled(formData, "multi_site_ops_enabled");

  const updates: Record<string, unknown> = {};
  if (profile === "simple" || profile === "standard" || profile === "multi_site") {
    updates.business_profile = profile;
  }
  updates.inventory_enabled = inventory;
  updates.recipe_costing_enabled = recipeCosting;
  updates.team_advanced_enabled = teamAdvanced;
  updates.multi_site_ops_enabled = multiSite;

  if (Object.keys(updates).length) {
    await supabase.from("organisations").update(updates).eq("id", orgId);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/setup-checklist");
}

export async function enableBusinessModule(module: "inventory" | "recipe_costing" | "team_advanced" | "multi_site"): Promise<void> {
  "use server";
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const columnMap = {
    inventory: "inventory_enabled",
    recipe_costing: "recipe_costing_enabled",
    team_advanced: "team_advanced_enabled",
    multi_site: "multi_site_ops_enabled",
  } as const;

  await supabase.from("organisations").update({ [columnMap[module]]: true }).eq("id", orgId);
  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/setup-checklist");
}

export async function enableInventoryFromSetup(): Promise<void> {
  return enableBusinessModule("inventory");
}


// ─────────────────────────────────────────────────────────────────────────────
// Session cash movements — used by close-till to generate REGISTRU DE CASA
// ─────────────────────────────────────────────────────────────────────────────
export async function getSessionMovements(sessionId: string): Promise<{
  movement_type: "opening" | "cash_in" | "cash_out";
  amount: number;
  reason: string | null;
  created_at: string;
}[]> {
  "use server";
  const { getActiveOrg } = await import("@/lib/kitchenops/data");
  const { supabase } = await getActiveOrg();
  const { data } = await supabase
    .from("pos_cash_movements")
    .select("movement_type,amount,reason,created_at")
    .eq("session_id", sessionId)
    .in("movement_type", ["opening", "cash_in", "cash_out"])
    .order("created_at", { ascending: true });
  return (data ?? []) as {
    movement_type: "opening" | "cash_in" | "cash_out";
    amount: number;
    reason: string | null;
    created_at: string;
  }[];
}
