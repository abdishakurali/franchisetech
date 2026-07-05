export function formatRecipeMoney(v: number, currency = "EUR") {
  if (currency === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: currency || "EUR" }).format(v);
}

/** Rounds a stock quantity to 2dp to hide float drift (e.g. 443.24999999999966) without changing the stored value. */
export function formatQty(v: number) {
  return Number(v.toFixed(2));
}

export function firstJoined<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

export type RecipeItemRow = {
  id: string;
  ingredient_product_id: string | null;
  ingredient_name: string | null;
  quantity: number;
  unit_of_measure: string | null;
  unit_cost: number;
  total_cost: number;
};

export type RecipeRow = {
  id: string;
  name: string;
  yield_qty: number | string;
  product_id: string | null;
  products: { name: string; sale_price: number } | { name: string; sale_price: number }[] | null;
  recipe_items: RecipeItemRow[];
};

export function recipeLineCost(item: RecipeItemRow) {
  const stored = Number(item.total_cost ?? 0);
  if (stored > 0) return stored;
  return Number(item.unit_cost ?? 0) * Number(item.quantity ?? 0);
}

export function recipeTotalCost(items: RecipeItemRow[]) {
  return items.reduce((sum, item) => sum + recipeLineCost(item), 0);
}

export function recipeCostMetrics(
  recipe: Pick<RecipeRow, "yield_qty" | "recipe_items">,
  salePrice: number
) {
  const yieldQty = Number(recipe.yield_qty ?? 1);
  const totalCost = recipeTotalCost(recipe.recipe_items);
  const costPerUnit = yieldQty > 0 ? totalCost / yieldQty : 0;
  const margin = salePrice - costPerUnit;
  const marginPct = salePrice > 0 ? (margin / salePrice) * 100 : 0;
  return { yieldQty, totalCost, costPerUnit, margin, marginPct };
}

export function recipeCanMake(
  recipe: Pick<RecipeRow, "yield_qty" | "recipe_items">,
  stockMap: Map<string, number>,
  nameMap: Map<string, string>
) {
  const yieldQty = Number(recipe.yield_qty ?? 1);
  const trackedItems = recipe.recipe_items.filter(
    (item) => item.ingredient_product_id && Number(item.quantity) > 0
  );

  if (trackedItems.length === 0) {
    return { canMake: null as number | null, limitingIngId: null as string | null, limitingIngName: null as string | null };
  }

  let minPortions = Infinity;
  let limitingIngId: string | null = null;
  let limitingIngName: string | null = null;

  for (const item of trackedItems) {
    const productId = item.ingredient_product_id!;
    const onHand = stockMap.get(productId) ?? 0;
    const qtyPerPortion = Number(item.quantity) / yieldQty;
    const portions = qtyPerPortion > 0 ? Math.floor(onHand / qtyPerPortion) : Infinity;
    if (portions < minPortions) {
      minPortions = portions;
      limitingIngId = productId;
      limitingIngName = nameMap.get(productId) ?? item.ingredient_name ?? null;
    }
  }

  return {
    canMake: Math.max(0, minPortions === Infinity ? 0 : minPortions),
    limitingIngId,
    limitingIngName,
  };
}
