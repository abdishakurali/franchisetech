/**
 * Converts an invoice/transfer line quantity (in the unit printed on the
 * document, e.g. GRM) into the product's own stock unit (e.g. kg), so 50 g of
 * matcha deducts 0.05 from a product stocked in kg.
 *
 * Only physically meaningful conversions are allowed (mass↔mass,
 * volume↔volume). A piece ("buc"/C62/H87) matches any product counted in
 * discrete units (each, pack, bottle, box…), 1:1 — the same default the
 * invoice form uses when a product is picked. Anything else is rejected
 * rather than guessed, because a wrong factor silently corrupts stock.
 */

type Dimension = "mass" | "volume" | "count";

// factor = how many base units (g, ml, piece) one of this unit represents
const UNITS: Record<string, { dim: Dimension; factor: number }> = {
  // mass (base g)
  kg: { dim: "mass", factor: 1000 }, kgm: { dim: "mass", factor: 1000 }, kilogram: { dim: "mass", factor: 1000 },
  g: { dim: "mass", factor: 1 }, gr: { dim: "mass", factor: 1 }, grm: { dim: "mass", factor: 1 }, gram: { dim: "mass", factor: 1 },
  // volume (base ml)
  l: { dim: "volume", factor: 1000 }, ltr: { dim: "volume", factor: 1000 }, litre: { dim: "volume", factor: 1000 },
  liter: { dim: "volume", factor: 1000 }, litru: { dim: "volume", factor: 1000 },
  ml: { dim: "volume", factor: 1 }, mlt: { dim: "volume", factor: 1 },
  // discrete pieces
  each: { dim: "count", factor: 1 }, buc: { dim: "count", factor: 1 }, c62: { dim: "count", factor: 1 },
  h87: { dim: "count", factor: 1 }, pcs: { dim: "count", factor: 1 }, st: { dim: "count", factor: 1 },
  bucata: { dim: "count", factor: 1 }, "bucată": { dim: "count", factor: 1 },
};

// Discrete packaging units: matched 1:1 with a piece, never with mass/volume.
const DISCRETE_PACKAGING = new Set(["pack", "box", "case", "bottle", "cup", "portion", "set", "bax", "pachet", "cutie", "sticla", "sticlă"]);

function norm(unit: string | null | undefined): string {
  return (unit ?? "").trim().toLowerCase();
}

export type StockQuantityResult =
  | { ok: true; stockQty: number }
  | { ok: false; error: string };

export function toStockQuantity(
  quantity: number,
  documentUnit: string | null | undefined,
  productUnit: string | null | undefined,
): StockQuantityResult {
  if (!Number.isFinite(quantity) || quantity <= 0) return { ok: false, error: "Cantitatea trebuie să fie mai mare decât zero." };
  const from = norm(documentUnit);
  const to = norm(productUnit) || "each";
  const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
  if (from === to) return { ok: true, stockQty: round6(quantity) };

  const a = UNITS[from];
  const b = UNITS[to];
  if (a && b && a.dim === b.dim) return { ok: true, stockQty: round6((quantity * a.factor) / b.factor) };

  const aIsPiece = a?.dim === "count" || DISCRETE_PACKAGING.has(from);
  const bIsPiece = b?.dim === "count" || DISCRETE_PACKAGING.has(to);
  if (aIsPiece && bIsPiece) return { ok: true, stockQty: round6(quantity) };

  return {
    ok: false,
    error: `UM „${documentUnit || "—"}” nu se poate converti în UM-ul de stoc al produsului („${productUnit || "—"}”). Alegeți o UM compatibilă.`,
  };
}
