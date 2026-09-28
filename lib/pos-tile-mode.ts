export type PosTileMode = "photo" | "name";

export interface TileModeProduct {
  pos_category?: { id?: string | null; name?: string | null } | null;
  image_url?: string | null;
  available_in_pos?: boolean | null;
  active?: boolean | null;
}

const UNCATEGORIZED_KEY = "__uncategorized__";

function categoryKey(product: TileModeProduct): string {
  return product.pos_category?.id ?? product.pos_category?.name ?? UNCATEGORIZED_KEY;
}

/**
 * Decides, per POS category, whether product tiles should show a photo or
 * fall back to a name+price+colour tile — decided per category, not per
 * product, so a category isn't a patchwork of photo tiles next to blank
 * placeholder tiles. A category with real photo coverage below the
 * threshold renders name tiles for every product in it, even the few that
 * do have a photo, rather than showing an inconsistent mix within one
 * category's grid section.
 *
 * Coverage found against real Dolce Nera data (2026-09-15): overall 67% of
 * sellable products have a photo, but far from uniform — coffee-drink
 * categories are 82-100% covered, while SHOP is 38% and LIMONADA & FRESH is
 * 13%. A flat "every tile gets a photo" design would have rendered those
 * two categories as mostly broken placeholder grids.
 */
export function computeCategoryTileMode(
  products: TileModeProduct[],
  threshold = 0.6
): Map<string, PosTileMode> {
  const totals = new Map<string, { total: number; withImage: number }>();
  for (const p of products) {
    if (p.available_in_pos === false) continue;
    if (p.active === false) continue;
    const key = categoryKey(p);
    const entry = totals.get(key) ?? { total: 0, withImage: 0 };
    entry.total += 1;
    if (p.image_url) entry.withImage += 1;
    totals.set(key, entry);
  }
  const modes = new Map<string, PosTileMode>();
  for (const [key, { total, withImage }] of totals) {
    modes.set(key, total > 0 && withImage / total >= threshold ? "photo" : "name");
  }
  return modes;
}

/** Uncategorized products (no pos_category at all) default to name tiles —
 *  there's no category-level photo signal to trust for them. */
export function tileModeForProduct(
  modes: Map<string, PosTileMode>,
  product: TileModeProduct
): PosTileMode {
  return modes.get(categoryKey(product)) ?? "name";
}
