"use client";

import { useEffect, useState } from "react";
import { TableShape, layoutToStyle } from "@/components/app/TableShape";
import type { FloorSection, TableWithStatus } from "@/app/actions/table-service";
import { floorBackgroundUrl } from "@/lib/floor-plan/constants";
import { canonicalSectionName } from "@/lib/floor-plan/sections";
import { cn } from "@/lib/utils";

type Props = {
  sections: FloorSection[];
  /** Full section list for canonical name matching when tabs are deduped. */
  allSections?: FloorSection[];
  tables: TableWithStatus[];
  mode?: "view" | "edit";
  currency?: string;
  pending?: boolean;
  selectedTableId?: string | null;
  layoutDraft?: TableWithStatus[];
  activeSectionId?: string;
  onSelectTable?: (table: TableWithStatus) => void;
  onSectionChange?: (sectionId: string) => void;
  onLayoutDraftChange?: (tables: TableWithStatus[]) => void;
  onSelectTableEdit?: (tableId: string | null) => void;
  /** When true, section tabs/legend use wood-themed overlay (parent supplies full-bleed bg). */
  immersive?: boolean;
  /** Hide section tabs (e.g. parent renders them). */
  hideSectionTabs?: boolean;
};

export function FloorPlanCanvas({
  sections,
  allSections,
  tables,
  mode = "view",
  currency = "RON",
  pending = false,
  selectedTableId = null,
  layoutDraft,
  activeSectionId: controlledSectionId,
  onSelectTable,
  onSectionChange,
  onLayoutDraftChange,
  onSelectTableEdit,
  immersive = false,
  hideSectionTabs = false,
}: Props) {
  const [internalSectionId, setInternalSectionId] = useState(sections[0]?.id ?? "");
  const activeSectionId = controlledSectionId ?? internalSectionId;

  useEffect(() => {
    if (sections.length && !sections.some((s) => s.id === activeSectionId)) {
      const next = sections[0]?.id ?? "";
      setInternalSectionId(next);
      onSectionChange?.(next);
    }
  }, [sections, activeSectionId, onSectionChange]);

  const sectionLookup = allSections ?? sections;
  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];
  const displayTables = (layoutDraft ?? tables).filter((t) => {
    if (!activeSection || sections.length === 0) return true;
    if (t.section_id === activeSection.id) return true;
    const tableCanonical = canonicalSectionName(
      (sectionLookup.find((s) => s.id === t.section_id)?.name ?? t.section?.trim()) || "Sală"
    );
    return tableCanonical === canonicalSectionName(activeSection.name);
  });

  function handleSectionChange(id: string) {
    setInternalSectionId(id);
    onSectionChange?.(id);
  }

  const bgUrl = activeSection ? floorBackgroundUrl(activeSection) : floorBackgroundUrl({});

  return (
    <div className={cn("flex flex-1 flex-col min-h-0", immersive && "relative")}>
      {sections.length > 0 && !hideSectionTabs && (
        <div className={cn("mb-3 flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin", immersive && "rounded-xl bg-black/20 backdrop-blur-sm px-2 py-2 border border-amber-200/20")}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionChange(section.id)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border",
                activeSectionId === section.id
                  ? immersive
                    ? "bg-amber-100 text-amber-950 border-amber-300 shadow-sm"
                    : "bg-primary text-primary-foreground border-primary shadow-sm"
                  : immersive
                    ? "bg-black/25 text-amber-50 border-amber-200/30 hover:bg-black/35 backdrop-blur-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {section.name}
            </button>
          ))}
        </div>
      )}

      {mode !== "edit" && (
      <div className={cn(
        "flex flex-wrap items-center gap-4 mb-3 text-xs",
        immersive ? "text-amber-100/90 rounded-lg bg-black/20 backdrop-blur-sm px-3 py-2 border border-amber-200/15" : "text-muted-foreground"
      )}>
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
      )}

      <div
        data-floor-canvas
        className={cn(
          "relative flex-1 min-h-[280px] sm:min-h-[380px] overflow-hidden",
          immersive ? "rounded-lg shadow-inner" : "rounded-xl border border-amber-900/20 shadow-inner"
        )}
        style={{
          backgroundImage: immersive ? undefined : `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ aspectRatio: "10 / 7" }}>
          {displayTables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-600 bg-black/5">
              Nicio masă în această secțiune
            </div>
          )}
          {displayTables.map((table) => (
            <TableShape
              key={table.id}
              table={table}
              mode={mode}
              currency={currency}
              disabled={pending}
              selected={selectedTableId === table.id}
              style={layoutToStyle(table)}
              onSelect={() => onSelectTable?.(table)}
              onPointerDown={(e) => {
                const applyDraft = onLayoutDraftChange;
                if (mode !== "edit" || !applyDraft) return;
                e.preventDefault();
                onSelectTableEdit?.(table.id);
                const startX = e.clientX;
                const startY = e.clientY;
                const origX = table.layout_x ?? 40;
                const origY = table.layout_y ?? 40;
                const canvas = (e.currentTarget as HTMLElement).closest("[data-floor-canvas]") as HTMLElement | null;
                if (!canvas) return;
                const draftFn = applyDraft;

                function onMove(ev: PointerEvent) {
                  const rect = canvas!.getBoundingClientRect();
                  const dx = ((ev.clientX - startX) / rect.width) * 1000;
                  const dy = ((ev.clientY - startY) / rect.height) * 700;
                  const next = (layoutDraft ?? tables).map((t) =>
                    t.id === table.id
                      ? {
                          ...t,
                          layout_x: Math.max(0, Math.min(920, origX + dx)),
                          layout_y: Math.max(0, Math.min(620, origY + dy)),
                        }
                      : t
                  );
                  draftFn(next);
                }

                function onUp() {
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                }

                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
              onResizePointerDown={(e) => {
                const applyDraft = onLayoutDraftChange;
                if (mode !== "edit" || !applyDraft) return;
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const origW = table.layout_w ?? 80;
                const origH = table.layout_h ?? 80;
                const canvas = (e.currentTarget as HTMLElement).closest("[data-floor-canvas]") as HTMLElement | null;
                if (!canvas) return;
                const draftFn = applyDraft;

                function onMove(ev: PointerEvent) {
                  const rect = canvas!.getBoundingClientRect();
                  const dw = ((ev.clientX - startX) / rect.width) * 1000;
                  const dh = ((ev.clientY - startY) / rect.height) * 700;
                  const next = (layoutDraft ?? tables).map((t) =>
                    t.id === table.id
                      ? {
                          ...t,
                          layout_w: Math.max(60, Math.min(360, origW + dw)),
                          layout_h: Math.max(60, Math.min(280, origH + dh)),
                        }
                      : t
                  );
                  draftFn(next);
                }

                function onUp() {
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                }

                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
