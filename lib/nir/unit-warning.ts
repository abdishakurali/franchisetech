import type { AppT } from "@/lib/app-i18n";
import { unitLabel } from "@/lib/units-of-measure";
import { unitMismatch } from "@/lib/unit-kind";

/**
 * Non-blocking warning text for a purchase line whose unit disagrees with the
 * product's stock unit. The RPC adds the received quantity (or the quantity when
 * received is blank) as-is, in the product's unit; this only says so.
 */
export function purchaseLineUnitWarning(
  line: { quantity: string; received_quantity?: string; unit_of_measure: string },
  productUnit: string | null | undefined,
  t: AppT,
  locale: "ro" | "en",
): string | null {
  if (!productUnit || !line.unit_of_measure) return null;
  if (!unitMismatch(line.unit_of_measure, productUnit)) return null;
  const typed = (line.received_quantity?.trim() || line.quantity?.trim() || "").replace(",", ".");
  const qty = typed && Number.isFinite(Number(typed)) ? typed : "N";
  return t.purchases.form.unitMismatch(qty, unitLabel(productUnit, locale), unitLabel(line.unit_of_measure, locale));
}
