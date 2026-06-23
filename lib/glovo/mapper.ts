// Map a Glovo order to a franchisetech pos_transaction draft

import type { GlovoOrder, GlovoProduct } from "./client";

export type ProductMapping = {
  external_sku: string;
  product_id: string;
};

export type TransactionDraft = {
  organisation_id: string;
  order_source: "glovo";
  external_order_id: string;
  payment_method: string;
  subtotal: number;
  total_amount: number;
  status: "completed";
  items: Array<{
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;
  }>;
  unmapped_skus: string[];
};

/**
 * Map a Glovo order to the franchisetech transaction format.
 * Unmapped SKUs are skipped and reported — they do NOT fail the order.
 */
export function mapGlovoOrder(
  order: GlovoOrder,
  productMappings: ProductMapping[],
  orgId: string,
): TransactionDraft {
  const mappingIndex = new Map(productMappings.map((m) => [m.external_sku, m.product_id]));
  const unmappedSkus: string[] = [];

  const items = order.packageDetails.products.map((glovoProduct: GlovoProduct) => {
    const productId = mappingIndex.get(glovoProduct.id) ?? null;
    if (!productId) {
      unmappedSkus.push(glovoProduct.id);
    }

    const unitPrice = (glovoProduct.price ?? 0) / 100; // Glovo prices in cents
    const total = unitPrice * glovoProduct.quantity;

    // Collect attribute names as notes (e.g. "fără zahăr, extra espresso")
    const notes = glovoProduct.attributes?.map((a) => a.name).join(", ") || null;

    return {
      product_id: productId,
      product_name: glovoProduct.name,
      quantity: glovoProduct.quantity,
      unit_price: unitPrice,
      total_price: total,
      notes,
    };
  });

  const total = items.reduce((sum, item) => sum + item.total_price, 0);

  if (unmappedSkus.length > 0) {
    console.warn("[glovo-mapper] Unmapped product SKUs:", unmappedSkus, "orderId:", order.orderId);
  }

  return {
    organisation_id: orgId,
    order_source: "glovo",
    external_order_id: order.orderId,
    payment_method: "card", // Glovo collects payment — treated as card for POS
    subtotal: total,
    total_amount: total,
    status: "completed",
    items,
    unmapped_skus: unmappedSkus,
  };
}
