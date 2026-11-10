import type { AppT } from "@/lib/app-i18n";
import { unitLabel } from "@/lib/units-of-measure";
import { unitMismatch } from "@/lib/unit-kind";

/**
 * Non-blocking warning for a recipe line whose saved unit disagrees (in kind or
 * size) with the ingredient product's stock unit. Sale deduction subtracts the
 * raw quantity in the product's unit; nothing converts. Display only.
 */
export function recipeLineUnitWarning(
  savedUnit: string | null | undefined,
  productUnit: string | null | undefined,
  quantity: string,
  t: AppT,
  locale: "ro" | "en",
): string | null {
  if (!savedUnit || !productUnit) return null;
  if (!unitMismatch(savedUnit, productUnit)) return null;
  const q = quantity?.trim().replace(",", ".") ?? "";
  const qty = q && Number.isFinite(Number(q)) ? q : "N";
  return t.recipes.unitMismatch(qty, unitLabel(savedUnit, locale), unitLabel(productUnit, locale));
}
