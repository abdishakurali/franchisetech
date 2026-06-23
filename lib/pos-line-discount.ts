/** Per-line POS discount helpers (P1.7b). */

export type PosCartLine = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  fiscalnet_vat_group?: number | null;
  discount_pct?: number;
};

export function clampDiscountPct(v: number): number {
  return Number(Math.min(Math.max(v, 0), 100).toFixed(2));
}

export function clampDiscountLei(v: number, maxGross: number): number {
  if (maxGross <= 0) return 0;
  return Number(Math.min(Math.max(v, 0), maxGross).toFixed(2));
}

/** Proportional cart-level fixed lei discount for one line. */
export function lineDiscountLeiShare(line: PosCartLine, lines: PosCartLine[], totalLei: number): number {
  const before = cartGrossBefore(lines);
  if (before <= 0 || totalLei <= 0) return 0;
  const share = lineGrossBefore(line) / before;
  return Number((totalLei * share).toFixed(4));
}

export function lineGrossAfterLei(line: PosCartLine, lines: PosCartLine[], totalLei: number): number {
  const leiOff = lineDiscountLeiShare(line, lines, totalLei);
  return Number((lineGrossBefore(line) - leiOff).toFixed(2));
}

export function cartGrossAfterLei(lines: PosCartLine[], totalLei: number): number {
  const before = cartGrossBefore(lines);
  const applied = clampDiscountLei(totalLei, before);
  return Number((before - applied).toFixed(2));
}

export function cartLeiDiscountAmount(lines: PosCartLine[], totalLei: number): number {
  return clampDiscountLei(totalLei, cartGrossBefore(lines));
}

export function cartUsesPctDiscount(lines: PosCartLine[], legacyCartPct = 0): boolean {
  return legacyCartPct > 0 || lines.some((l) => (l.discount_pct ?? 0) > 0);
}

/** Line discount: item field first, then legacy cart-wide % (P1.7 compat). */
export function lineDiscountPct(line: PosCartLine, legacyCartPct = 0): number {
  if (line.discount_pct != null && line.discount_pct > 0) {
    return clampDiscountPct(line.discount_pct);
  }
  if (legacyCartPct > 0) return clampDiscountPct(legacyCartPct);
  return 0;
}

export function lineGrossBefore(line: PosCartLine): number {
  return line.quantity * line.unit_price;
}

export function lineGrossAfter(line: PosCartLine, legacyCartPct = 0): number {
  const pct = lineDiscountPct(line, legacyCartPct);
  return Number((lineGrossBefore(line) * (1 - pct / 100)).toFixed(2));
}

export function cartGrossBefore(lines: PosCartLine[]): number {
  return Number(lines.reduce((s, l) => s + lineGrossBefore(l), 0).toFixed(2));
}

export function cartGrossAfter(lines: PosCartLine[], legacyCartPct = 0): number {
  return Number(lines.reduce((s, l) => s + lineGrossAfter(l, legacyCartPct), 0).toFixed(2));
}

export function cartDiscountAmount(lines: PosCartLine[], legacyCartPct = 0): number {
  return Number((cartGrossBefore(lines) - cartGrossAfter(lines, legacyCartPct)).toFixed(2));
}

/** Transaction header discount_pct: same % on every line, else 0 (mixed discounts). */
export function transactionDiscountPct(lines: PosCartLine[], legacyCartPct = 0): number {
  if (!lines.length) return 0;
  const pcts = lines.map((l) => lineDiscountPct(l, legacyCartPct));
  const first = pcts[0];
  return pcts.every((p) => p === first) ? first : 0;
}

/** Restore backup: spread legacy cart discount onto lines once. */
export function normalizeCartLines(
  lines: PosCartLine[],
  legacyCartPct?: number
): PosCartLine[] {
  const legacy = legacyCartPct && legacyCartPct > 0 ? clampDiscountPct(legacyCartPct) : 0;
  return lines.map((l) => ({
    ...l,
    discount_pct:
      l.discount_pct != null && l.discount_pct > 0
        ? clampDiscountPct(l.discount_pct)
        : legacy > 0
          ? legacy
          : 0,
  }));
}

export function lineVatAmount(line: PosCartLine, legacyCartPct = 0): number {
  const gross = lineGrossAfter(line, legacyCartPct);
  const vatDecimal = line.vat_rate / 100;
  if (vatDecimal <= 0) return 0;
  return gross - gross / (1 + vatDecimal);
}
