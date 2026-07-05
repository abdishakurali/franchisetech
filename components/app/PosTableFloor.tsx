"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FloorPlanCanvas } from "@/components/app/FloorPlanCanvas";
import {
  batchSaveFloorLayout,
  createFloorSection,
  createTable,
  openTab,
  type FloorSection,
  type TableLayoutPatch,
  type TableWithStatus,
} from "@/app/actions/table-service";
import { floorBackgroundUrl, type TableShapeKind } from "@/lib/floor-plan/constants";
import { canonicalSectionName, dedupeFloorSections } from "@/lib/floor-plan/sections";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Undo2 } from "lucide-react";

type Props = {
  tables: TableWithStatus[];
  sections: FloorSection[];
  canManage: boolean;
  currency?: string;
  siteId?: string | null;
};

const SHAPES: { id: TableShapeKind; label: string }[] = [
  { id: "square", label: "Pătrat" },
  { id: "rectangle", label: "Dreptunghi" },
  { id: "round", label: "Rotund" },
];

export function PosTableFloor({ tables, sections: initialSections, canManage, currency = "RON", siteId = null }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const sections = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tables) {
      if (t.section_id) counts.set(t.section_id, (counts.get(t.section_id) ?? 0) + 1);
    }
    return dedupeFloorSections(initialSections, counts);
  }, [initialSections, tables]);

  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length && !sections.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0]?.id ?? "");
    }
  }, [sections, activeSectionId]);

  const staticTables = useMemo(
    () => tables.map((t) => ({ ...t, active_tab: editMode ? null : t.active_tab })),
    [tables, editMode]
  );

  const [layoutDraft, setLayoutDraft] = useState<TableWithStatus[]>([]);
  const [baseline, setBaseline] = useState<TableWithStatus[]>([]);

  const dirty = useMemo(
    () => JSON.stringify(layoutDraft) !== JSON.stringify(baseline),
    [layoutDraft, baseline]
  );

  const selectedTable = layoutDraft.find((t) => t.id === selectedTableId) ?? null;
  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];
  const bgUrl = floorBackgroundUrl(activeSection ?? {});

  function tableInActiveSection(t: TableWithStatus, sectionId: string, sectionName: string): boolean {
    if (t.section_id === sectionId) return true;
    const tableCanonical = canonicalSectionName(
      (initialSections.find((s) => s.id === t.section_id)?.name ?? t.section?.trim()) || "Sală"
    );
    return tableCanonical === canonicalSectionName(sectionName);
  }

  function enterEditMode() {
    const draft = tables.map((t) => ({ ...t, active_tab: null }));
    setLayoutDraft(draft);
    setBaseline(draft);
    setEditMode(true);
    setSelectedTableId(null);
  }

  function discardEdit() {
    setLayoutDraft(baseline);
    setSelectedTableId(null);
    setEditMode(false);
  }

  function saveLayout() {
    setError(null);
    const patches: TableLayoutPatch[] = layoutDraft.map((t) => ({
      id: t.id,
      layout_x: t.layout_x ?? 40,
      layout_y: t.layout_y ?? 40,
      layout_w: t.layout_w ?? 80,
      layout_h: t.layout_h ?? 80,
      shape: t.shape,
    }));
    startTransition(async () => {
      const result = await batchSaveFloorLayout(patches);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBaseline(layoutDraft);
      setEditMode(false);
      setSelectedTableId(null);
      router.refresh();
    });
  }

  function selectTable(table: TableWithStatus) {
    if (editMode) {
      setSelectedTableId(table.id);
      return;
    }
    setError(null);
    startTransition(async () => {
      if (table.active_tab) {
        router.push(`/app/pos?tabId=${table.active_tab.id}`);
        return;
      }
      const result = await openTab(table.id, { siteId: table.site_id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/app/pos?tabId=${result.tabId}`);
    });
  }

  function addTable() {
    setError(null);
    startTransition(async () => {
      let sectionId = activeSection?.id;
      if (!sectionId && initialSections.length === 0) {
        const sec = await createFloorSection("Sală", siteId);
        if (!sec.ok) {
          setError(sec.error);
          return;
        }
        sectionId = sec.sectionId;
      }
      if (!sectionId) {
        setError("Alege o secțiune mai întâi.");
        return;
      }

      const source = editMode ? layoutDraft : tables;
      const sectionTables = source.filter((t) =>
        tableInActiveSection(t, sectionId, activeSection?.name ?? "Sală")
      );
      const nextIndex = sectionTables.length;
      const fd = new FormData();
      fd.set("name", `${nextIndex + 1}`);
      fd.set("section_id", sectionId);
      fd.set("shape", "square");
      fd.set("capacity", "4");
      fd.set("layout_x", String(40 + (nextIndex % 6) * 120));
      fd.set("layout_y", String(40 + Math.floor(nextIndex / 6) * 120));
      fd.set("layout_w", "80");
      fd.set("layout_h", "80");
      if (siteId) fd.set("site_id", siteId);
      else fd.set("site_id", "");

      const result = await createTable(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function setSelectedShape(shape: TableShapeKind) {
    if (!selectedTableId) return;
    setLayoutDraft((prev) =>
      prev.map((t) =>
        t.id === selectedTableId
          ? {
              ...t,
              shape,
              layout_w: shape === "rectangle" ? Math.max(t.layout_w ?? 80, 110) : t.layout_w ?? 80,
              layout_h: shape === "round" ? (t.layout_w ?? 80) : t.layout_h ?? 80,
            }
          : t
      )
    );
  }

  const showCanvas = tables.length > 0 || editMode || canManage;

  return (
    <div
      className={cn("flex flex-1 flex-col min-h-0 relative", editMode && "pb-[5.5rem] sm:pb-24")}
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "local",
      }}
    >
      <div className="flex flex-1 flex-col min-h-0 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl bg-black/30 backdrop-blur-md border border-amber-200/20 px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold text-amber-50">
              {editMode ? "Editează planul sălii" : "Alege masa"}
            </h1>
            <p className="text-sm text-amber-100/85 mt-0.5">
              {editMode
                ? "Trage mesele, mărește din colț, alege forma. Salvează când e gata."
                : "Apasă o masă pentru comandă. Încasarea e în același POS."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!editMode && (
              <Link href="/app/pos?quick=1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  className="border-amber-200/40 bg-black/20 text-amber-50 hover:bg-black/35"
                >
                  Vânzare fără masă
                </Button>
              </Link>
            )}
            {canManage && !editMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-amber-200/40 bg-black/20 text-amber-50 hover:bg-black/35"
                  disabled={pending}
                  onClick={addTable}
                >
                  <Plus className="h-4 w-4" />
                  Masă nouă
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-violet-600 text-white hover:bg-violet-500 border border-violet-400/80 shadow-md shadow-violet-950/40 ring-2 ring-violet-400/30"
                  onClick={enterEditMode}
                >
                  <Pencil className="h-4 w-4" />
                  Editează plan
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-100 bg-red-950/60 border border-red-300/30 rounded-lg px-3 py-2 backdrop-blur-sm">
            {error}
          </p>
        )}

        {!showCanvas ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center rounded-xl bg-black/25 backdrop-blur-sm border border-amber-200/20 py-16 px-6">
            <p className="text-amber-100 mb-4">Nu există mese configurate.</p>
            {canManage && (
              <Button onClick={addTable} disabled={pending}>
                <Plus className="h-4 w-4 mr-1" />
                Adaugă prima masă
              </Button>
            )}
          </div>
        ) : (
          <FloorPlanCanvas
            sections={sections}
            allSections={initialSections}
            tables={staticTables}
            mode={editMode ? "edit" : "view"}
            currency={currency}
            pending={pending && !editMode}
            layoutDraft={editMode ? layoutDraft : undefined}
            activeSectionId={activeSectionId}
            selectedTableId={selectedTableId}
            onSectionChange={setActiveSectionId}
            onLayoutDraftChange={editMode ? setLayoutDraft : undefined}
            onSelectTableEdit={editMode ? setSelectedTableId : undefined}
            onSelectTable={selectTable}
            immersive
          />
        )}
      </div>

      {canManage && editMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-violet-300/25 bg-violet-950/95 backdrop-blur-md shadow-[0_-8px_32px_rgba(0,0,0,0.35)] px-4 py-3 safe-area-pb">
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 min-h-[2rem]">
              {selectedTable ? (
                <>
                  <span className="text-sm font-semibold text-violet-100 shrink-0">{selectedTable.name}</span>
                  <span className="text-xs text-violet-300 hidden sm:inline">· Formă</span>
                  {SHAPES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedShape(s.id)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                        selectedTable.shape === s.id
                          ? "bg-violet-500 text-white border-violet-400"
                          : "bg-violet-900/60 text-violet-100 border-violet-400/40 hover:border-violet-300"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                  <span className="text-[11px] text-violet-300/90 ml-auto hidden sm:inline">
                    Trage colțul ↘ pentru mărime
                  </span>
                </>
              ) : (
                <span className="text-xs text-violet-200/90">
                  Apasă o masă pentru a o muta sau schimba forma
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={discardEdit}
                className="border-violet-400/40 bg-violet-900/50 text-violet-50 hover:bg-violet-800/60"
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Renunță
              </Button>
              <Button
                size="sm"
                disabled={!dirty || pending}
                onClick={saveLayout}
                className="bg-violet-600 hover:bg-violet-500 text-white min-w-[5.5rem]"
              >
                Salvează
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1 ml-auto bg-white/95 text-violet-950 hover:bg-white"
                disabled={pending}
                onClick={addTable}
              >
                <Plus className="h-4 w-4" />
                Masă nouă
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
