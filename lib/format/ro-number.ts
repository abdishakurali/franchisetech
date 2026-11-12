/**
 * Parse a number typed or exported the Romanian way as well as the English way.
 *
 * - "14.50"    -> 14.5   (dot decimal, as before)
 * - "14,50"    -> 14.5   (comma decimal: Romanian keyboards / Excel)
 * - "1.234,50" -> 1234.5 (comma present: comma is the decimal separator, dots are thousands)
 *
 * Anything else that is not a finite number returns null, so callers keep their
 * own fallback. Pure, no server imports, safe in client and server code.
 */
export function parseLocaleNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const raw = String(input).trim();
  if (!raw) return null;
  if (raw.includes(",")) {
    // Only accept a single decimal comma, with optional dot thousands groups.
    const m = /^([+-]?)(\d{1,3}(?:\.\d{3})+|\d+),(\d+)$/.exec(raw);
    if (!m) return null;
    const parsed = Number(`${m[1]}${m[2].replace(/\./g, "")}.${m[3]}`);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
