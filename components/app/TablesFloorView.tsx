"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { TableWithStatus } from "@/app/actions/table-service";

function statusLabel(tab: TableWithStatus["active_tab"]): string {
  if (!tab) return "Liberă";
  if (tab.status === "bill_requested") return "Solicită nota";
  return "Ocupată";
}

function statusColor(tab: TableWithStatus["active_tab"]): string {
  if (!tab) return "bg-emerald-500";
  if (tab.status === "bill_requested") return "bg-blue-500";
  return "bg-red-500";
}

function statusBadgeVariant(tab: TableWithStatus["active_tab"]): "default" | "secondary" | "destructive" | "outline" {
  if (!tab) return "default";
  if (tab.status === "bill_requested") return "secondary";
  return "destructive";
}

function cardBorder(tab: TableWithStatus["active_tab"]): string {
  if (!tab) return "border-border hover:border-emerald-300";
  if (tab.status === "bill_requested") return "border-blue-200 bg-blue-50/40 hover:border-blue-400";
  return "border-red-100 bg-muted/40 hover:border-red-300";
}

function formatDuration(openedAt: string): string {
  const ms = Date.now() - new Date(openedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

type Props = {
  tables: TableWithStatus[];
  /** pos = tap opens till on /app/pos; manage = link to table detail page */
  variant?: "pos" | "manage";
  onSelectTable?: (table: TableWithStatus) => void;
  pending?: boolean;
};

export function TablesFloorView({
  tables,
  variant = "manage",
  onSelectTable,
  pending = false,
}: Props) {
  const sections = useMemo(() => {
    const map = new Map<string, TableWithStatus[]>();
    for (const t of tables) {
      const key = t.section?.trim() || "Sală";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tables]);

  const [activeSection, setActiveSection] = useState(sections[0]?.[0] ?? "Sală");

  const visibleTables = sections.find(([s]) => s === activeSection)?.[1] ?? tables;

  return (
    <div className="flex-1 flex flex-col">
      {sections.length > 1 && (
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {sections.map(([section]) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
          Liberă
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
          Ocupată
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
          Solicită nota
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {visibleTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            variant={variant}
            onSelect={() => onSelectTable?.(table)}
            disabled={pending}
          />
        ))}
      </div>
    </div>
  );
}

function TableCard({
  table,
  variant,
  onSelect,
  disabled,
}: {
  table: TableWithStatus;
  variant: "pos" | "manage";
  onSelect?: () => void;
  disabled?: boolean;
}) {
  const tab = table.active_tab;
  const dot = statusColor(tab);
  const variantBadge = statusBadgeVariant(tab);
  const label = statusLabel(tab);

  const inner = (
    <div
      className={`
        relative border rounded-xl p-4 cursor-pointer transition-all min-h-[100px]
        hover:shadow-md ${cardBorder(tab)}
        ${disabled ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      <span className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${dot}`} />
      <p className="font-semibold text-base truncate pr-4">{table.name}</p>
      {table.capacity && (
        <p className="text-xs text-muted-foreground mt-0.5">{table.capacity} locuri</p>
      )}
      <Badge variant={variantBadge} className="mt-3 text-xs">
        {label}
      </Badge>
      {tab && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {formatDuration(tab.opened_at)}
          {tab.cover_count ? ` · ${tab.cover_count} pers.` : ""}
        </p>
      )}
      {variant === "pos" && (
        <p className="text-[10px] font-medium text-primary mt-2 uppercase tracking-wide">
          {tab ? "Continuă comanda" : "Deschide bon"}
        </p>
      )}
    </div>
  );

  if (variant === "pos") {
    return (
      <button type="button" className="text-left w-full" onClick={onSelect} disabled={disabled}>
        {inner}
      </button>
    );
  }

  return <Link href={`/app/tables/${table.id}`}>{inner}</Link>;
}
