export const FLOOR_CANVAS_WIDTH = 1000;
export const FLOOR_CANVAS_HEIGHT = 700;
export const DEFAULT_FLOOR_BACKGROUND = "/floors/default-wood.svg";

export type TableShapeKind = "square" | "rectangle" | "round";

export function floorBackgroundUrl(section: {
  background_url?: string | null;
  background_preset?: string | null;
}): string {
  if (section.background_url?.trim()) return section.background_url.trim();
  if (section.background_preset === "wood" || !section.background_preset) {
    return DEFAULT_FLOOR_BACKGROUND;
  }
  return DEFAULT_FLOOR_BACKGROUND;
}

export function tableStatusStyle(tab: {
  status: "open" | "bill_requested" | "closed" | "voided";
} | null): {
  fill: string;
  border: string;
  text: string;
} {
  if (!tab || tab.status === "closed" || tab.status === "voided") {
    return {
      fill: "rgba(236, 253, 245, 0.92)",
      border: "#10b981",
      text: "#065f46",
    };
  }
  if (tab.status === "bill_requested") {
    return {
      fill: "rgba(219, 234, 254, 0.95)",
      border: "#3b82f6",
      text: "#1e3a8a",
    };
  }
  return {
    fill: "rgba(254, 226, 226, 0.95)",
    border: "#ef4444",
    text: "#7f1d1d",
  };
}

export function formatFloorMoney(value: number, currency = "RON"): string {
  if (currency === "RON") return `${value.toFixed(2)} lei`;
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(value);
}

export function formatSeatsLabel(
  capacity: number | null | undefined,
  coverCount: number | null | undefined,
  occupied: boolean
): string | null {
  if (!capacity && !coverCount) return null;
  if (!occupied) {
    return capacity ? `${capacity} locuri` : null;
  }
  if (capacity) {
    if (coverCount != null && coverCount > 0) {
      const remaining = Math.max(0, capacity - coverCount);
      return `${coverCount}/${capacity} pers. · ${remaining} libere`;
    }
    return `${capacity} locuri`;
  }
  return coverCount != null && coverCount > 0 ? `${coverCount} pers.` : null;
}

export function formatTabDuration(openedAt: string): string {
  const ms = Date.now() - new Date(openedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `deschis de ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `deschis de ${hrs}h ${rem}m` : `deschis de ${hrs}h`;
}
