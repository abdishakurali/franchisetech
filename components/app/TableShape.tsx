"use client";

import Image from "next/image";
import type { TableWithStatus } from "@/app/actions/table-service";
import {
  FLOOR_CANVAS_HEIGHT,
  FLOOR_CANVAS_WIDTH,
  formatFloorMoney,
  formatSeatsLabel,
  formatTabDuration,
  tableStatusStyle,
  type TableShapeKind,
} from "@/lib/floor-plan/constants";
import { TableSeatRing } from "@/components/app/TableSeatRing";
import { cn } from "@/lib/utils";

export type TableShapeProps = {
  table: TableWithStatus;
  mode: "view" | "edit";
  selected?: boolean;
  currency?: string;
  disabled?: boolean;
  onSelect?: () => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onResizePointerDown?: (e: React.PointerEvent<HTMLSpanElement>) => void;
  style?: React.CSSProperties;
};

export function TableShape({
  table,
  mode,
  selected = false,
  currency = "RON",
  disabled = false,
  onSelect,
  onPointerDown,
  onResizePointerDown,
  style,
}: TableShapeProps) {
  const tab = table.active_tab;
  const status = tableStatusStyle(tab);
  const shape = (table.shape ?? "square") as TableShapeKind;
  const borderRadius = shape === "round" ? "9999px" : shape === "rectangle" ? "12px" : "14px";
  const editSelected = mode === "edit" && selected;
  const editIdle = mode === "edit" && !selected;

  const content = (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center select-none transition-all duration-150",
        mode === "edit" ? "cursor-move" : "cursor-pointer",
        editSelected && "z-20 scale-[1.04] ring-4 ring-violet-400 ring-offset-2 ring-offset-amber-900/30 shadow-[0_0_0_4px_rgba(167,139,250,0.35),0_8px_24px_rgba(0,0,0,0.25)]",
        editIdle && "opacity-95 hover:ring-2 hover:ring-violet-300/60",
        disabled && "opacity-60 pointer-events-none"
      )}
      style={{
        backgroundColor: editIdle ? "rgba(255,255,255,0.88)" : editSelected ? "rgba(255,255,255,0.98)" : status.fill,
        border: editSelected
          ? "3px solid #8b5cf6"
          : editIdle
            ? "2px dashed rgba(139,92,246,0.45)"
            : `2px solid ${status.border}`,
        borderRadius,
        boxShadow: editSelected
          ? undefined
          : tab
            ? "0 2px 8px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onPointerDown={mode === "edit" ? onPointerDown : undefined}
    >
      {table.capacity != null && table.capacity > 0 && (
        <TableSeatRing
          capacity={table.capacity}
          coverCount={tab?.cover_count}
          occupied={Boolean(tab)}
        />
      )}
      {tab && tab.cover_count != null && tab.cover_count > 0 && (
        <span
          className="absolute -top-2 -right-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white shadow-md"
          style={{ backgroundColor: status.border }}
        >
          {tab.cover_count}
        </span>
      )}
      {table.icon_url && (
        <Image
          src={table.icon_url}
          alt=""
          width={28}
          height={28}
          className="absolute top-1 left-1 rounded object-cover opacity-80"
          unoptimized
        />
      )}
      <span
        className="w-full px-1 text-center font-bold leading-snug break-words whitespace-normal"
        style={{
          color: status.text,
          fontSize: table.name.length > 8 ? "0.75rem" : table.name.length > 4 ? "0.875rem" : "1.125rem",
        }}
      >
        {table.name}
      </span>
      {(() => {
        const seats = formatSeatsLabel(table.capacity, tab?.cover_count, Boolean(tab));
        return seats ? (
          <span className="text-[9px] sm:text-[10px] font-medium mt-0.5 opacity-90" style={{ color: status.text }}>
            {seats}
          </span>
        ) : null;
      })()}
      {tab && (
        <div className="mt-1 flex flex-col items-center gap-0.5 px-1 text-center">
          {tab.running_total != null && tab.running_total > 0 && (
            <span className="text-[10px] sm:text-xs font-semibold tabular-nums" style={{ color: status.text }}>
              {formatFloorMoney(tab.running_total, currency)}
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] opacity-80" style={{ color: status.text }}>
            {formatTabDuration(tab.opened_at)}
          </span>
          {tab.status === "bill_requested" && (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">Notă</span>
          )}
        </div>
      )}
      {mode === "edit" && selected && (
        <span
          className="absolute bottom-0 right-0 z-10 h-5 w-5 cursor-se-resize rounded-tl-lg bg-violet-600 border-2 border-white shadow-lg"
          title="Mărește masa"
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizePointerDown?.(e);
          }}
        />
      )}
    </div>
  );

  if (mode === "view") {
    return (
      <button
        type="button"
        className="absolute p-0 border-0 bg-transparent text-left"
        style={style}
        onClick={onSelect}
        disabled={disabled}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="absolute" style={{ ...style, zIndex: selected ? 30 : style?.zIndex }}>
      {content}
    </div>
  );
}

export function layoutToStyle(table: TableWithStatus): React.CSSProperties {
  const x = table.layout_x ?? 40;
  const y = table.layout_y ?? 40;
  const w = table.layout_w ?? 80;
  const h = table.layout_h ?? 80;
  return {
    left: `${(x / FLOOR_CANVAS_WIDTH) * 100}%`,
    top: `${(y / FLOOR_CANVAS_HEIGHT) * 100}%`,
    width: `${(w / FLOOR_CANVAS_WIDTH) * 100}%`,
    height: `${(h / FLOOR_CANVAS_HEIGHT) * 100}%`,
  };
}

export { FLOOR_CANVAS_WIDTH, FLOOR_CANVAS_HEIGHT };
