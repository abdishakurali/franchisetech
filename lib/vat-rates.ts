/** Org VAT/TVA catalog — shared types and helpers. Source: public.vat_rates (Settings). */

export type OrgVatRate = {
  id: string;
  name: string;
  rate: number;
  is_default?: boolean | null;
  active?: boolean | null;
  fiscalnet_vat_group?: number | null;
  sort_order?: number | null;
};

export const VAT_DEFAULTS_BY_COUNTRY: Record<
  string,
  Array<{ name: string; rate: number; fiscalnet_vat_group: number | null; is_default: boolean }>
> = {
  RO: [
    { name: "TVA Standard 19%", rate: 19, fiscalnet_vat_group: 1, is_default: true },
    { name: "TVA Redus 9%", rate: 9, fiscalnet_vat_group: 2, is_default: false },
    { name: "TVA Super-redus 5%", rate: 5, fiscalnet_vat_group: 3, is_default: false },
    { name: "Scutit 0%", rate: 0, fiscalnet_vat_group: 4, is_default: false },
  ],
  IE: [
    { name: "Standard Rate 23%", rate: 23, fiscalnet_vat_group: null, is_default: true },
    { name: "Reduced Rate 13.5%", rate: 13.5, fiscalnet_vat_group: null, is_default: false },
    { name: "Second Reduced Rate 9%", rate: 9, fiscalnet_vat_group: null, is_default: false },
    { name: "Zero Rate 0%", rate: 0, fiscalnet_vat_group: null, is_default: false },
  ],
};

export function formatVatRateLabel(rate: OrgVatRate): string {
  return `${rate.name} (${formatRatePercent(rate.rate)})`;
}

export function formatRatePercent(rate: number): string {
  const rounded = Math.round(rate * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded}%`;
}

export function ratesMatch(a: number, b: number): boolean {
  return Math.abs(Number(a) - Number(b)) < 0.001;
}

export function getDefaultVatRate(rates: OrgVatRate[]): OrgVatRate | null {
  const active = rates.filter((r) => r.active !== false);
  return active.find((r) => r.is_default) ?? active[0] ?? null;
}

export function getDefaultVatRateValue(rates: OrgVatRate[]): number {
  return getDefaultVatRate(rates)?.rate ?? 0;
}

export function findRateOption(rates: OrgVatRate[], numericRate: number): OrgVatRate | null {
  return rates.find((r) => r.active !== false && ratesMatch(r.rate, numericRate)) ?? null;
}

export function isKnownVatRate(rates: OrgVatRate[], numericRate: number): boolean {
  return findRateOption(rates, numericRate) !== null;
}

export function resolveVatRateValue(
  rates: OrgVatRate[],
  requested: number | null | undefined,
  fallback = 0
): number {
  if (requested == null || Number.isNaN(Number(requested))) {
    return getDefaultVatRateValue(rates) || fallback;
  }
  const n = Number(requested);
  if (isKnownVatRate(rates, n)) return n;
  return n;
}

export function vatRateOptionsForSelect(rates: OrgVatRate[]): OrgVatRate[] {
  return [...rates]
    .filter((r) => r.active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.rate - b.rate);
}

export function validateVatRate(rates: OrgVatRate[], numericRate: number): { ok: true } | { ok: false; message: string } {
  if (rates.length === 0) return { ok: true };
  const match = findRateOption(rates, numericRate);
  if (match) return { ok: true };
  return {
    ok: false,
    message: `VAT rate ${numericRate}% is not in your Settings catalog. Add it under Settings → VAT rates.`,
  };
}

export function nearestVatRate(rates: OrgVatRate[], numericRate: number): OrgVatRate | null {
  const active = vatRateOptionsForSelect(rates);
  if (!active.length) return null;
  let best = active[0];
  let bestDiff = Math.abs(best.rate - numericRate);
  for (const r of active) {
    const diff = Math.abs(r.rate - numericRate);
    if (diff < bestDiff) {
      best = r;
      bestDiff = diff;
    }
  }
  return best;
}
