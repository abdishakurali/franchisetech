export const DEFAULT_OPERATIONAL_UNITS = [
  "each",
  "portion",
  "kg",
  "g",
  "litre",
  "ml",
  "cup",
  "bottle",
  "box",
  "case",
  "pack",
] as const;

// Display-only Romanian labels for the canonical unit codes above. The stored
// value (in products.unit_of_measure and units_of_measure.name) stays in
// English for stability — only what's shown to the user is localized.
// Org-defined custom units aren't in this map and render as typed, unchanged.
const UNIT_LABELS_RO: Partial<Record<(typeof DEFAULT_OPERATIONAL_UNITS)[number], string>> = {
  each: "bucată",
  portion: "porție",
  litre: "litru",
  cup: "cană",
  bottle: "sticlă",
  box: "cutie",
  case: "bax",
  pack: "pachet",
};

export function unitLabel(unit: string, locale: "en" | "ro"): string {
  if (locale !== "ro") return unit;
  return UNIT_LABELS_RO[unit as (typeof DEFAULT_OPERATIONAL_UNITS)[number]] ?? unit;
}

// A custom unit that collides (case-insensitively) with a standard unit's
// code or Romanian label would be indistinguishable from it on the till and
// in reports — this is the exact "Buc"/"Units" duplication that made the
// custom-unit list read-only before. Enforced on add/rename, not just shown.
export function isReservedUnitName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;
  if ((DEFAULT_OPERATIONAL_UNITS as readonly string[]).some((u) => u.toLowerCase() === normalized)) return true;
  return Object.values(UNIT_LABELS_RO).some((label) => label.toLowerCase() === normalized);
}

type UnitRow = { name: string | null };

function uniqueUnitNames(names: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const units: string[] = [];
  for (const raw of names) {
    const name = String(raw ?? "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    units.push(name);
  }
  return units;
}

export function mergeUnitNames(rows: UnitRow[] | null | undefined): string[] {
  return uniqueUnitNames([
    ...DEFAULT_OPERATIONAL_UNITS,
    ...((rows ?? []).map((row) => row.name)),
  ]);
}

export async function listOperationalUnitNames(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("units_of_measure")
    .select("name")
    .or(`organisation_id.eq.${orgId},organisation_id.is.null`)
    .order("name");
  return mergeUnitNames(data as UnitRow[] | null);
}

export function validateOperationalUnit(unit: string, allowedUnits: string[]): { ok: true; unit: string } | { ok: false; error: string } {
  const normalized = unit.trim();
  if (!normalized) return { ok: false, error: "Unit of measure is required." };
  if (!allowedUnits.includes(normalized)) {
    return { ok: false, error: `Unit of measure "${normalized}" is not configured in Settings.` };
  }
  return { ok: true, unit: normalized };
}
