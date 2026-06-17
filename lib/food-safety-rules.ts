/**
 * franchisetech Food Safety Rules
 *
 * These are default guidance values based on FSAI and general food safety best practice.
 * They are NOT a guarantee of compliance.
 * Your business remains responsible for following official guidance and your own
 * food-safety procedures.
 *
 * Default ranges can be adjusted to match your food-safety plan via Equipment settings.
 */

export type CheckCategory =
  | 'cold_storage'   // fridge, cold_room, chill_display
  | 'frozen_storage' // freezer
  | 'hot_holding'    // hot hold, bain-marie
  | 'cooking'        // cooking core temperature
  | 'reheating'      // reheating core temperature
  | 'cooling'        // time-based: food into fridge within 2 hours
  | 'delivery';      // received delivery temperature

export type TempStatus = 'pass' | 'warning' | 'fail';

// ─── Category metadata ────────────────────────────────────────────────────────

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  targetLabel: string;
  unit: 'temperature' | 'time'; // time = cooling check
  actionRequiredOnFail: boolean;
  disclaimer?: string;
}

export const CATEGORY_META: Record<CheckCategory, CategoryMeta> = {
  cold_storage: {
    label: 'Cold storage',
    shortLabel: 'Cold storage',
    targetLabel: '0°C to 5°C',
    unit: 'temperature',
    actionRequiredOnFail: true,
  },
  frozen_storage: {
    label: 'Frozen storage',
    shortLabel: 'Frozen',
    targetLabel: '-18°C or colder',
    unit: 'temperature',
    actionRequiredOnFail: true,
  },
  hot_holding: {
    label: 'Hot holding',
    shortLabel: 'Hot hold',
    targetLabel: '63°C or above',
    unit: 'temperature',
    actionRequiredOnFail: true,
  },
  cooking: {
    label: 'Cooking',
    shortLabel: 'Cooking',
    targetLabel: '75°C or above (core)',
    unit: 'temperature',
    actionRequiredOnFail: true,
    disclaimer: 'Core temperature — insert probe into thickest part of food.',
  },
  reheating: {
    label: 'Reheating',
    shortLabel: 'Reheating',
    targetLabel: '70°C or above (core)',
    unit: 'temperature',
    actionRequiredOnFail: true,
    disclaimer: 'Core temperature — insert probe into thickest part of food.',
  },
  cooling: {
    label: 'Cooling',
    shortLabel: 'Cooling',
    targetLabel: 'Into fridge within 2 hours of cooking',
    unit: 'time',
    actionRequiredOnFail: true,
    disclaimer: 'Food should be cooled as quickly as possible and placed in the fridge within 2 hours.',
  },
  delivery: {
    label: 'Delivery temperature',
    shortLabel: 'Delivery',
    targetLabel: 'Chilled ≤5°C · Frozen ≤-18°C · Hot ≥63°C',
    unit: 'temperature',
    actionRequiredOnFail: true,
  },
};

// ─── Asset type → category mapping ───────────────────────────────────────────

export type AssetType = 'fridge' | 'freezer' | 'cold_room' | 'chill_display' | 'hot_hold' | 'probe' | 'other';

export function getCategoryForAssetType(assetType: AssetType): CheckCategory {
  switch (assetType) {
    case 'fridge':
    case 'cold_room':
    case 'chill_display':
      return 'cold_storage';
    case 'freezer':
      return 'frozen_storage';
    case 'hot_hold':
      return 'hot_holding';
    default:
      return 'cold_storage'; // probe/other — user selects
  }
}

// ─── Temperature evaluation ───────────────────────────────────────────────────

export function evaluateByCategory(
  category: CheckCategory,
  valueC: number,
  opts?: {
    deliveryType?: string | null;
    customMin?: number | null;
    customMax?: number | null;
  }
): TempStatus {
  // Custom range override
  if (opts?.customMin != null || opts?.customMax != null) {
    const min = opts?.customMin ?? -Infinity;
    const max = opts?.customMax ?? Infinity;
    const hasMin = Number.isFinite(min);
    const hasMax = Number.isFinite(max);
    if (valueC >= min && valueC <= max) return 'pass';
    if (hasMin && !hasMax) return valueC >= min - 3 ? 'warning' : 'fail';
    if (!hasMin && hasMax) return valueC <= max + 3 ? 'warning' : 'fail';
    const tolerance = Math.abs((max - min) * 0.15) || 3;
    if (valueC >= min - tolerance && valueC <= max + tolerance) return 'warning';
    return 'fail';
  }

  switch (category) {
    case 'cold_storage':
      if (valueC >= 0 && valueC <= 5) return 'pass';
      if ((valueC > 5 && valueC <= 8) || (valueC >= -2 && valueC < 0)) return 'warning';
      return 'fail';

    case 'frozen_storage':
      if (valueC <= -18) return 'pass';
      if (valueC > -18 && valueC <= -15) return 'warning';
      return 'fail';

    case 'hot_holding':
      if (valueC >= 63) return 'pass';
      if (valueC >= 60 && valueC < 63) return 'warning';
      return 'fail';

    case 'cooking':
      if (valueC >= 75) return 'pass';
      if (valueC >= 70 && valueC < 75) return 'warning';
      return 'fail';

    case 'reheating':
      if (valueC >= 70) return 'pass';
      if (valueC >= 65 && valueC < 70) return 'warning';
      return 'fail';

    case 'delivery': {
      const dt = opts?.deliveryType ?? 'chilled';
      if (dt === 'frozen') {
        if (valueC <= -18) return 'pass';
        if (valueC > -18 && valueC <= -15) return 'warning';
        return 'fail';
      }
      if (dt === 'hot') {
        if (valueC >= 63) return 'pass';
        if (valueC >= 60 && valueC < 63) return 'warning';
        return 'fail';
      }
      if (dt === 'ambient') return 'pass'; // no temp rule
      // chilled (default)
      if (valueC >= 0 && valueC <= 5) return 'pass';
      if ((valueC > 5 && valueC <= 8) || (valueC >= -2 && valueC < 0)) return 'warning';
      return 'fail';
    }

    default:
      return 'pass';
  }
}

/** Time-based evaluation for cooling checks */
export function evaluateCooling(
  finishedCookingAt: Date,
  placedInFridgeAt: Date
): TempStatus {
  const minutes = (placedInFridgeAt.getTime() - finishedCookingAt.getTime()) / 60_000;
  if (minutes <= 120) return 'pass';    // within 2 hours
  if (minutes <= 150) return 'warning'; // within 2.5 hours
  return 'fail';                         // over 2.5 hours
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export function statusLabel(status: TempStatus): string {
  switch (status) {
    case 'pass':    return 'Pass';
    case 'warning': return 'Needs attention — monitor or recheck';
    case 'fail':    return 'Action required';
  }
}

export function statusBg(status: TempStatus): string {
  switch (status) {
    case 'pass':    return 'bg-green-50 text-green-700 border-green-200';
    case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'fail':    return 'bg-red-50 text-red-700 border-red-200';
  }
}

export function statusColor(status: TempStatus): string {
  switch (status) {
    case 'pass':    return 'text-green-600';
    case 'warning': return 'text-amber-600';
    case 'fail':    return 'text-red-600';
  }
}

export function categoryLabel(category: CheckCategory): string {
  return CATEGORY_META[category]?.label ?? category;
}

export function targetRangeLabelForCategory(category: CheckCategory, deliveryType?: string | null): string {
  if (category === 'delivery') {
    if (deliveryType === 'frozen') return '-18°C or colder';
    if (deliveryType === 'hot')    return '63°C or above';
    if (deliveryType === 'ambient') return 'Ambient — no temperature rule';
    return '0°C to 5°C (chilled)';
  }
  return CATEGORY_META[category]?.targetLabel ?? '—';
}

export function actionRequired(status: TempStatus, category: CheckCategory): boolean {
  return status === 'fail' && CATEGORY_META[category]?.actionRequiredOnFail === true;
}

// ─── Check type options (for the log form) ────────────────────────────────────

export const CHECK_TYPE_OPTIONS: Array<{ value: CheckCategory; label: string; description: string; needsUnit: boolean }> = [
  { value: 'cold_storage',   label: 'Cold storage check',          description: 'Fridge, cold room, chill display', needsUnit: true },
  { value: 'frozen_storage', label: 'Frozen storage check',        description: 'Freezer',                          needsUnit: true },
  { value: 'hot_holding',    label: 'Hot holding check',           description: 'Hot hold, bain-marie',             needsUnit: true },
  { value: 'cooking',        label: 'Cooking temperature',         description: 'Core temperature of cooked food',  needsUnit: false },
  { value: 'reheating',      label: 'Reheating temperature',       description: 'Core temperature after reheating', needsUnit: false },
  { value: 'cooling',        label: 'Cooling check',               description: 'Time food takes to reach fridge',  needsUnit: false },
  { value: 'delivery',       label: 'Delivery temperature',        description: 'Received goods temperature',       needsUnit: false },
];

export function categoryNeedsUnit(category: CheckCategory): boolean {
  return CHECK_TYPE_OPTIONS.find((o) => o.value === category)?.needsUnit ?? true;
}
