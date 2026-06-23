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
