/**
 * temperature.ts
 *
 * Backward-compatible helpers. New code should import from food-safety-rules.ts.
 * This file uses the same evaluation logic so existing pages continue to work.
 */

import { getCategoryForAssetType, evaluateByCategory } from './food-safety-rules';

export type AssetType = 'fridge' | 'freezer' | 'cold_room' | 'chill_display' | 'hot_hold' | 'probe' | 'other'
export type TempStatus = 'pass' | 'warning' | 'fail'

/** Evaluate temperature based on asset type */
export function evaluateTemperature(
  valueC: number,
  assetType: AssetType,
  minTemp?: number | null,
  maxTemp?: number | null
): TempStatus {
  const category = getCategoryForAssetType(assetType);
  return evaluateByCategory(category, valueC, { customMin: minTemp, customMax: maxTemp });
}

export function getDefaultThresholds(assetType: AssetType): { minTemp: number | null; maxTemp: number | null } {
  switch (assetType) {
    case 'fridge': case 'cold_room': case 'chill_display':
      return { minTemp: 0, maxTemp: 5 }
    case 'freezer':
      return { minTemp: null, maxTemp: -18 }
    case 'hot_hold':
      return { minTemp: 63, maxTemp: null }
    default:
      return { minTemp: null, maxTemp: null }
  }
}

export function statusColor(status: TempStatus): string {
  switch (status) {
    case 'pass': return 'text-green-600'
    case 'warning': return 'text-amber-600'
    case 'fail': return 'text-red-600'
  }
}

export function statusBg(status: TempStatus): string {
  switch (status) {
    case 'pass': return 'bg-green-50 text-green-700 border-green-200'
    case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'fail': return 'bg-red-50 text-red-700 border-red-200'
  }
}

export function statusLabel(status: TempStatus | string): string {
  if (status === 'pass') return 'Pass';
  if (status === 'warning') return 'Needs attention — monitor or recheck';
  if (status === 'fail') return 'Action required';
  return status;
}

export function formatTemp(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}°C`
}

export function targetRangeLabel(assetType: AssetType | string): string {
  switch (assetType) {
    case 'fridge': case 'cold_room': case 'chill_display': return '0°C to 5°C'
    case 'freezer': return '-18°C or colder'
    case 'hot_hold': return '63°C or above'
    default: return 'Record per food-safety plan'
  }
}

export function assetTypeLabel(type: AssetType | string): string {
  const labels: Record<string, string> = {
    fridge: 'Fridge', freezer: 'Freezer', cold_room: 'Cold Room',
    chill_display: 'Chill Display', hot_hold: 'Hot Hold', probe: 'Probe', other: 'Other',
  }
  return labels[type] ?? type
}

export function assetDisplayName(asset?: { name: string | null; asset_type?: string | null } | null): string {
  if (!asset?.name) return '—'
  return asset.asset_type ? `${asset.name} · ${assetTypeLabel(asset.asset_type)}` : asset.name
}

export function correctiveActionLabel(type: string): string {
  const labels: Record<string, string> = {
    door_checked: 'Checked door was closed',
    rechecked: 'Rechecked temperature',
    moved_stock: 'Moved stock to backup unit',
    adjusted_unit: 'Adjusted unit settings',
    called_maintenance: 'Called maintenance',
    discarded_food: 'Food discarded',
    escalated_to_manager: 'Escalated to manager',
    other: 'Other action',
  }
  return labels[type] ?? type
}
