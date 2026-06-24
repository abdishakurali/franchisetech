import type { OrgModuleRow } from "@/lib/business-modules";
import { isModuleEnabled } from "@/lib/business-modules";

export type ProductModuleVisibility = {
  inventory: boolean;
  recipeCosting: boolean;
};

export type ProductTypeSnapshot = {
  is_ingredient?: boolean | null;
  is_stock_tracked?: boolean | null;
  is_purchaseable?: boolean | null;
  item_type?: string | null;
  supplier_id?: string | null;
};

const INVENTORY_ITEM_TYPES = new Set([
  "merchandise",
  "supply",
  "packaging",
  "raw_material",
]);

const ALL_ITEM_TYPES = new Set([
  "finished_product",
  "ingredient",
  "merchandise",
  "supply",
  "packaging",
  "raw_material",
]);

export function productModuleVisibility(flags: OrgModuleRow): ProductModuleVisibility {
  return {
    inventory: isModuleEnabled(flags, "inventory"),
    recipeCosting: isModuleEnabled(flags, "recipe_costing"),
  };
}

export function allowedItemTypes(visibility: ProductModuleVisibility): string[] {
  const types = ["finished_product"];
  if (visibility.recipeCosting) types.push("ingredient");
  if (visibility.inventory) {
    types.push("merchandise", "supply", "packaging", "raw_material");
  }
  return types;
}

import type { PosLocale } from "@/lib/pos-i18n";

export function itemTypeSelectOptions(
  visibility: ProductModuleVisibility,
  locale: PosLocale = "en",
): { value: string; label: string }[] {
  return allowedItemTypes(visibility).map((value) => ({
    value,
    label: itemTypeLabel(value, locale),
  }));
}

const ITEM_TYPE_LABELS: Record<string, { en: string; ro: string }> = {
  finished_product: { en: "Finished product", ro: "Produs finit" },
  ingredient: { en: "Ingredient", ro: "Ingredient" },
  merchandise: { en: "Goods", ro: "Marfă" },
  supply: { en: "Supply", ro: "Consumabil" },
  packaging: { en: "Packaging", ro: "Ambalaj" },
  raw_material: { en: "Raw material", ro: "Materie primă" },
};

export function itemTypeLabel(value: string | null | undefined, locale: PosLocale = "en"): string {
  if (!value || !ITEM_TYPE_LABELS[value]) return "";
  return locale === "ro" ? ITEM_TYPE_LABELS[value].ro : ITEM_TYPE_LABELS[value].en;
}

function normalizeItemType(
  raw: string,
  visibility: ProductModuleVisibility,
  fallback: string | null,
): string | null {
  if (raw && ALL_ITEM_TYPES.has(raw) && allowedItemTypes(visibility).includes(raw)) {
    return raw;
  }
  if (fallback && ALL_ITEM_TYPES.has(fallback) && allowedItemTypes(visibility).includes(fallback)) {
    return fallback;
  }
  return "finished_product";
}

/** Apply form product-type fields respecting disabled modules (preserves existing on update). */
export function resolveProductTypeFields(
  formData: FormData,
  visibility: ProductModuleVisibility,
  mode: "create" | "update",
  existing?: ProductTypeSnapshot | null,
): {
  is_ingredient: boolean;
  is_stock_tracked: boolean;
  is_purchaseable: boolean;
  item_type: string | null;
  supplier_id: string | null;
} {
  const availableInPos = formData.get("available_in_pos") === "on";

  let isIngredient = mode === "update" ? Boolean(existing?.is_ingredient) : false;
  let isStockTracked = mode === "update" ? Boolean(existing?.is_stock_tracked) : false;
  let isPurchaseable = mode === "update" ? Boolean(existing?.is_purchaseable) : false;

  if (visibility.recipeCosting) {
    isIngredient = formData.get("is_ingredient") === "on";
  }

  if (visibility.inventory) {
    const stockFromForm = formData.get("is_stock_tracked") === "on";
    isStockTracked = mode === "create" ? isIngredient || stockFromForm : stockFromForm;
    isPurchaseable = formData.get("is_purchaseable") === "on" || isIngredient;
  } else if (mode === "create") {
    isStockTracked = false;
    isPurchaseable = false;
  }

  const rawItemType = String(formData.get("item_type") ?? "").trim();
  const existingType = existing?.item_type ?? null;
  let itemType = normalizeItemType(rawItemType, visibility, existingType);

  if (mode === "create") {
    if (rawItemType && allowedItemTypes(visibility).includes(rawItemType)) {
      itemType = rawItemType;
    } else if (isIngredient && visibility.recipeCosting) {
      itemType = "ingredient";
    } else if (availableInPos) {
      itemType = "finished_product";
    } else {
      itemType = normalizeItemType("", visibility, null);
    }
  }

  if (!visibility.inventory && itemType && INVENTORY_ITEM_TYPES.has(itemType)) {
    itemType = "finished_product";
  }
  if (!visibility.recipeCosting && itemType === "ingredient") {
    itemType = "finished_product";
  }

  const supplierRaw = String(formData.get("supplier_id") ?? "").trim();
  const supplier_id = visibility.inventory
    ? supplierRaw || null
    : mode === "update"
      ? existing?.supplier_id ?? null
      : null;

  return {
    is_ingredient: isIngredient,
    is_stock_tracked: isStockTracked,
    is_purchaseable: isPurchaseable,
    item_type: itemType,
    supplier_id,
  };
}

export function showProductTypeSection(visibility: ProductModuleVisibility): boolean {
  return visibility.inventory || visibility.recipeCosting;
}
