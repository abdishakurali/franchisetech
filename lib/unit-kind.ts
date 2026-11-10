/**
 * Unit KIND (mass / volume / count) and scale, for NON-BLOCKING warnings only.
 *
 * Purchases and recipe deductions add or subtract the raw number typed, in the
 * product's own unit; nothing converts. So "1 each" on a gram product adds 1 g,
 * and "250 g" on a kg product adds 250 kg. These helpers only say when the two
 * units disagree so the screen can warn. They never change any quantity.
 *
 * Unknown (custom) units return "unknown" and never warn: we cannot tell.
 */
export type UnitKind = "mass" | "volume" | "count" | "unknown";

function normalise(unit: string | null | undefined): string {
  return String(unit ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // ă -> a, ț -> t, ș -> s
    .replace(/\.$/, "");
}

// Scale is relative to the base unit of the kind (g for mass, ml for volume).
const MASS: Record<string, number> = {
  mg: 0.001,
  g: 1, gr: 1, gram: 1, grame: 1, grams: 1,
  kg: 1000, kgs: 1000, kilogram: 1000, kilograme: 1000, kilograms: 1000,
};
const VOLUME: Record<string, number> = {
  ml: 1, mililitru: 1, mililitri: 1, millilitre: 1, milliliter: 1,
  cl: 10, dl: 100,
  l: 1000, lt: 1000, litre: 1000, liter: 1000, litru: 1000, litri: 1000, litres: 1000, liters: 1000,
};
// Count units are all treated as "one of something": Buc, each, bottle and pack
// are equivalent labels for a counted product and must not warn against each other.
const COUNT = new Set([
  "each", "buc", "bucata", "bucati", "bc", "pcs", "pc", "piece", "pieces", "unit", "units", "unitate", "unitati",
  "bottle", "bottles", "sticla", "sticle",
  "pack", "packs", "pachet", "pachete",
  "box", "cutie", "cutii", "case", "bax", "baxuri",
  "can", "doza", "doze",
  "portion", "portie", "portii",
  "cup", "cana", "cesti", "ceasca",
]);

export function unitKind(unit: string | null | undefined): UnitKind {
  const u = normalise(unit);
  if (!u) return "unknown";
  if (u in MASS) return "mass";
  if (u in VOLUME) return "volume";
  if (COUNT.has(u)) return "count";
  return "unknown";
}

function unitScale(unit: string | null | undefined): number | null {
  const u = normalise(unit);
  if (u in MASS) return MASS[u];
  if (u in VOLUME) return VOLUME[u];
  return null;
}

export type UnitMismatch =
  | { type: "kind"; lineKind: UnitKind; productKind: UnitKind }
  | { type: "scale"; lineKind: UnitKind; productKind: UnitKind };

/**
 * Non-null when a line's unit would make "the number typed" mean something
 * different in the product's unit:
 *  - kind: mass vs volume vs count (kg vs each, Buc vs litre), or
 *  - scale: same kind, different size (g vs kg, ml vs litre).
 * Null when equivalent (each/Buc/bottle/pack, kg/kilogram) or when either unit
 * is unknown or empty.
 */
export function unitMismatch(lineUnit: string | null | undefined, productUnit: string | null | undefined): UnitMismatch | null {
  const lineKind = unitKind(lineUnit);
  const productKind = unitKind(productUnit);
  if (lineKind === "unknown" || productKind === "unknown") return null;
  if (lineKind !== productKind) return { type: "kind", lineKind, productKind };
  const a = unitScale(lineUnit);
  const b = unitScale(productUnit);
  if (a !== null && b !== null && a !== b) return { type: "scale", lineKind, productKind };
  return null;
}
