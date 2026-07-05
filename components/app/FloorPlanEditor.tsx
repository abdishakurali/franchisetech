"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloorPlanCanvas } from "@/components/app/FloorPlanCanvas";
import {
  batchSaveFloorLayout,
  createFloorSection,
  createTable,
  deleteFloorSection,
  updateFloorSection,
  uploadFloorBackground,
  type FloorSection,
  type RestaurantTable,
  type TableLayoutPatch,
  type TableWithStatus,
} from "@/app/actions/table-service";
import { FLOOR_CANVAS_HEIGHT, FLOOR_CANVAS_WIDTH } from "@/lib/floor-plan/constants";
import { Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  sections: FloorSection[];
  tables: RestaurantTable[];
  siteId: string | null;
  multiSite: boolean;
};

export function FloorPlanEditor({ sections: initialSections, tables: initialTables, siteId, multiSite }: Props) {
  const router = useRouter();
  const sections = initialSections;
  const [layoutDraft, setLayoutDraft] = useState<TableWithStatus[]>(
    initialTables.filter((t) => t.is_active).map((t) => ({ ...t, active_tab: null }))
  );
  const [baseline, setBaseline] = useState(layoutDraft);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState(initialSections[0]?.id ?? "");
  const [newSectionName, setNewSectionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(
    () => JSON.stringify(layoutDraft) !== JSON.stringify(baseline),
    [layoutDraft, baseline]
  );

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];

  function runSaveLayout() {
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
      router.refresh();
    });
  }

  function discard() {
    setLayoutDraft(baseline);
    setSelectedTableId(null);
  }

  function addTableToCanvas() {
    if (!activeSection) return;
    const sectionTables = layoutDraft.filter((t) => t.section_id === activeSection.id);
    const nextIndex = sectionTables.length;
    const fd = new FormData();
    fd.set("name", `${sectionTables.length + 1}`);
    fd.set("section_id", activeSection.id);
    fd.set("shape", "square");
    fd.set("layout_x", String(40 + (nextIndex % 6) * 120));
    fd.set("layout_y", String(40 + Math.floor(nextIndex / 6) * 120));
    fd.set("layout_w", "80");
    fd.set("layout_h", "80");
    if (multiSite && siteId) fd.set("site_id", siteId);

    startTransition(async () => {
      const result = await createTable(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function addSection() {
    const name = newSectionName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createFloorSection(name, siteId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNewSectionName("");
      router.refresh();
    });
  }

  function removeSection(sectionId: string) {
    if (!confirm("Ștergi această secțiune?")) return;
    startTransition(async () => {
      const result = await deleteFloorSection(sectionId);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function resetBackground() {
    if (!activeSection) return;
    startTransition(async () => {
      const result = await updateFloorSection(activeSection.id, {
        background_url: null,
        background_preset: "wood",
      });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function uploadBackground(file: File) {
    if (!activeSection) return;
    const fd = new FormData();
    fd.set("section_id", activeSection.id);
    fd.set("background_file", file);
    startTransition(async () => {
      const result = await uploadFloorBackground(fd);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const selectedTable = layoutDraft.find((t) => t.id === selectedTableId) ?? null;

  return (
    <div className="space-y-4 border rounded-xl p-4 bg-muted/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Editor plan sală
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trage mesele pe plan. Salvează când ești gata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!dirty || pending} onClick={discard}>
            <Undo2 className="h-4 w-4 mr-1" />
            Renunță
          </Button>
          <Button type="button" size="sm" disabled={!dirty || pending} onClick={runSaveLayout}>
            Salvează plan
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <FloorPlanCanvas
          sections={sections}
          tables={initialTables.filter((t) => t.is_active).map((t) => ({ ...t, active_tab: null }))}
          mode="edit"
          layoutDraft={layoutDraft}
          activeSectionId={activeSectionId}
          selectedTableId={selectedTableId}
          onSectionChange={setActiveSectionId}
          onLayoutDraftChange={setLayoutDraft}
          onSelectTableEdit={setSelectedTableId}
          pending={pending}
        />

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Secțiuni</p>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Nume secțiune nouă"
                className="h-9"
              />
              <Button type="button" size="sm" variant="outline" onClick={addSection} disabled={pending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
                  <button
                    type="button"
                    className={`text-left flex-1 truncate ${s.id === activeSectionId ? "font-semibold text-primary" : ""}`}
                    onClick={() => setActiveSectionId(s.id)}
                  >
                    {s.name}
                  </button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-600"
                    disabled={pending}
                    onClick={() => removeSection(s.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {activeSection && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Fundal secțiune</p>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" size="sm" onClick={resetBackground} disabled={pending}>
                  Lemn (implicit)
                </Button>
                <label className="text-xs">
                  <span className="block mb-1">Imagine personalizată</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="text-xs w-full"
                    disabled={pending}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadBackground(file);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          <div>
            <Button type="button" className="w-full" size="sm" variant="secondary" onClick={addTableToCanvas} disabled={pending || !activeSection}>
              <Plus className="h-4 w-4 mr-1" />
              Adaugă masă pe plan
            </Button>
          </div>

          {selectedTable && (
            <div className="rounded-lg border p-3 space-y-2 bg-white">
              <p className="font-medium">{selectedTable.name}</p>
              <label className="text-xs block">
                Formă
                <select
                  className="mt-1 w-full h-9 rounded-md border px-2"
                  value={selectedTable.shape}
                  onChange={(e) => {
                    const shape = e.target.value as "square" | "rectangle" | "round";
                    setLayoutDraft((prev) =>
                      prev.map((t) =>
                        t.id === selectedTable.id
                          ? {
                              ...t,
                              shape,
                              layout_w: shape === "rectangle" ? 120 : 80,
                              layout_h: 80,
                            }
                          : t
                      )
                    );
                  }}
                >
                  <option value="square">Pătrat</option>
                  <option value="rectangle">Dreptunghi</option>
                  <option value="round">Rotund</option>
                </select>
              </label>
              <p className="text-[10px] text-muted-foreground">
                Canvas: {FLOOR_CANVAS_WIDTH}×{FLOOR_CANVAS_HEIGHT}px logic
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
