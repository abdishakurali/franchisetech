"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/app/SearchableSelect";
import { FloorPlanEditor } from "@/components/app/FloorPlanEditor";
import {
  createTable,
  updateTable,
  deactivateTable,
  type FloorSection,
  type RestaurantTable,
} from "@/app/actions/table-service";
import { Pencil, Trash2, Plus } from "lucide-react";

type Site = { id: string; name: string };

type Props = {
  tables: RestaurantTable[];
  sections: FloorSection[];
  sites: Site[];
  multiSite: boolean;
  activeSiteId: string | null;
};

const SHAPE_OPTIONS = [
  { value: "square", label: "Pătrat" },
  { value: "rectangle", label: "Dreptunghi" },
  { value: "round", label: "Rotund" },
];

export function TablesSettingsClient({ tables, sections, sites, multiSite, activeSiteId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"plan" | "list">("plan");

  const defaultSiteId = multiSite ? (activeSiteId ?? sites[0]?.id ?? "") : "";
  const sectionOptions = sections.map((s) => ({ value: s.id, label: s.name }));

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTable(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShowAdd(false);
    });
  }

  function handleUpdate(tableId: string, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateTable(tableId, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditingId(null);
    });
  }

  function handleDeactivate(tableId: string) {
    if (!confirm("Dezactivezi această masă?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deactivateTable(tableId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setTab("plan")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "plan" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          Plan sală
        </button>
        <button
          type="button"
          onClick={() => setTab("list")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          Listă mese
        </button>
      </div>

      {tab === "plan" && (
        <FloorPlanEditor
          key={`${tables.length}-${sections.length}`}
          sections={sections}
          tables={tables}
          siteId={activeSiteId}
          multiSite={multiSite}
        />
      )}

      {tab === "list" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tables.length} {tables.length === 1 ? "masă configurată" : "mese configurate"}
            </p>
            <Button size="sm" onClick={() => setShowAdd((v) => !v)} disabled={pending}>
              <Plus className="h-4 w-4 mr-1" />
              Adaugă masă
            </Button>
          </div>

          {showAdd && (
            <form action={handleCreate} className="border rounded-xl p-4 space-y-3 bg-muted/20">
              <h3 className="font-medium text-sm">Masă nouă</h3>
              <TableFormFields
                sections={sectionOptions}
                sites={sites}
                multiSite={multiSite}
                defaultSiteId={defaultSiteId}
                defaultSectionId={sections[0]?.id ?? ""}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={pending}>Salvează</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowAdd(false)}>Anulează</Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {tables.length === 0 && !showAdd && (
              <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl">
                Nu există mese. Adaugă prima masă sau folosește editorul de plan.
              </p>
            )}
            {tables.map((table) => (
              <div
                key={table.id}
                className={`border rounded-xl p-4 ${!table.is_active ? "opacity-50" : ""}`}
              >
                {editingId === table.id ? (
                  <form action={(fd) => handleUpdate(table.id, fd)} className="space-y-3">
                    <TableFormFields
                      table={table}
                      sections={sectionOptions}
                      sites={sites}
                      multiSite={multiSite}
                      defaultSiteId={table.site_id ?? defaultSiteId}
                      defaultSectionId={table.section_id ?? sections[0]?.id ?? ""}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={pending}>Salvează</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>Anulează</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{table.name}</p>
                        {!table.is_active && <Badge variant="outline">Inactivă</Badge>}
                        {(table.section || sections.find((s) => s.id === table.section_id)?.name) && (
                          <Badge variant="secondary" className="text-xs">
                            {sections.find((s) => s.id === table.section_id)?.name ?? table.section}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {table.capacity ? `${table.capacity} locuri` : "—"}
                        {multiSite && table.site_id && (
                          <> · {sites.find((s) => s.id === table.site_id)?.name ?? "Sediu"}</>
                        )}
                      </p>
                    </div>
                    {table.is_active && (
                      <div className="flex gap-1 shrink-0">
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(table.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeactivate(table.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TableFormFields({
  table,
  sections,
  sites,
  multiSite,
  defaultSiteId,
  defaultSectionId,
}: {
  table?: RestaurantTable;
  sections: { value: string; label: string }[];
  sites: Site[];
  multiSite: boolean;
  defaultSiteId: string;
  defaultSectionId: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Nume masă</label>
        <Input name="name" defaultValue={table?.name ?? ""} placeholder="Masa 1" required className="h-9" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Secțiune / etaj</label>
        <SearchableSelect
          name="section_id"
          options={sections}
          defaultValue={table?.section_id ?? defaultSectionId}
          searchPlaceholder="Caută secțiune…"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Locuri</label>
        <Input name="capacity" type="number" min={1} defaultValue={table?.capacity ?? ""} placeholder="4" className="h-9" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Formă</label>
        <select
          name="shape"
          defaultValue={table?.shape ?? "square"}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {SHAPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Ordine afișare</label>
        <Input name="sort_order" type="number" defaultValue={table?.sort_order ?? 0} className="h-9" />
      </div>
      {multiSite && sites.length > 0 && (
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Sediu</label>
          <select
            name="site_id"
            defaultValue={table?.site_id ?? defaultSiteId}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
      {!multiSite && <input type="hidden" name="site_id" value="" />}
    </div>
  );
}
