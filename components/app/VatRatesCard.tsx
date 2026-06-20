"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface VatRate {
  id: string;
  name: string;
  rate: number;
  is_default?: boolean | null;
  active?: boolean | null;
  fiscalnet_vat_group?: number | null;
}

interface Props {
  rates: VatRate[];
  fiscalnetEnabled: boolean;
  canEdit: boolean;
  addAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}

const FISCALNET_GROUPS = [
  { value: "1", label: "1 — Standard (19%)" },
  { value: "2", label: "2 — Reduced (9%)" },
  { value: "3", label: "3 — Super-reduced (5%)" },
  { value: "4", label: "4 — Zero (0%)" },
  { value: "5", label: "5 — Exempt" },
];

export function VatRatesCard({ rates, fiscalnetEnabled, canEdit, addAction, updateAction, deleteAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [filter, setFilter] = useState("");
  const [editState, setEditState] = useState<Partial<VatRate>>({});
  const [newState, setNewState] = useState<{ name: string; rate: string; is_default: boolean; fiscalnet_vat_group: string }>({
    name: "", rate: "", is_default: false, fiscalnet_vat_group: "",
  });
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function startEdit(v: VatRate) {
    setEditingId(v.id);
    setEditState({
      name: v.name,
      rate: v.rate,
      is_default: !!v.is_default,
      fiscalnet_vat_group: v.fiscalnet_vat_group ?? undefined,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState({});
  }

  function handleSave(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", String(editState.name ?? ""));
    fd.set("rate", String(editState.rate ?? "0"));
    fd.set("is_default", String(!!editState.is_default));
    fd.set("active", "true");
    fd.set("fiscalnet_vat_group", String(editState.fiscalnet_vat_group ?? ""));
    startTransition(async () => {
      await updateAction(fd);
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteAction(fd);
      setDeleteConfirm(null);
    });
  }

  function handleAdd() {
    if (!newState.name.trim() || newState.rate === "") return;
    const fd = new FormData();
    fd.set("name", newState.name);
    fd.set("rate", newState.rate);
    fd.set("is_default", String(newState.is_default));
    fd.set("fiscalnet_vat_group", newState.fiscalnet_vat_group);
    startTransition(async () => {
      await addAction(fd);
      setNewState({ name: "", rate: "", is_default: false, fiscalnet_vat_group: "" });
      setAddingNew(false);
    });
  }

  const filteredRates = rates.filter((v) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return v.name.toLowerCase().includes(q) || String(v.rate).includes(q);
  });
  const displayRates = filter.trim() ? filteredRates : rates;

  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT / Tax Rates</CardTitle>
        <CardDescription>
          {fiscalnetEnabled
            ? "FiscalNet enabled — assign a VAT group (1–5) to each rate."
            : "Manage your tax rates. Set one as default for new products."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rates.length > 3 && (
          <div className="mb-4">
            <Label className="text-xs text-slate-500">Filter by name or rate</Label>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="e.g. 19 or TVA Standard"
              className="mt-1 h-9"
            />
          </div>
        )}
        <div className="divide-y divide-slate-100">
          {displayRates.map((v) =>
            editingId === v.id ? (
              /* ── EDIT ROW ── */
              <div key={v.id} className="py-3 flex flex-wrap items-end gap-2">
                <div>
                  <Label className="text-xs text-slate-500">Name</Label>
                  <Input
                    value={editState.name ?? ""}
                    onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                    className="h-8 w-28 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Rate %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editState.rate ?? ""}
                    onChange={(e) => setEditState((s) => ({ ...s, rate: Number(e.target.value) }))}
                    className="h-8 w-20 text-sm"
                  />
                </div>
                {fiscalnetEnabled && (
                  <div>
                    <Label className="text-xs text-slate-500">FiscalNet group</Label>
                    <select
                      value={editState.fiscalnet_vat_group != null ? String(editState.fiscalnet_vat_group) : ""}
                      onChange={(e) => setEditState((s) => ({ ...s, fiscalnet_vat_group: e.target.value ? Number(e.target.value) : undefined }))}
                      className="h-8 rounded border border-slate-200 px-2 text-sm"
                    >
                      <option value="">— none —</option>
                      {FISCALNET_GROUPS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditState((s) => ({ ...s, is_default: !s.is_default }))}
                    className={`h-8 px-3 rounded border text-xs font-medium transition-colors ${
                      editState.is_default
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {editState.is_default ? "★ Default" : "Set default"}
                  </button>
                </div>
                <div className="flex items-end gap-1">
                  <Button size="sm" className="h-8" onClick={() => handleSave(v.id)} disabled={isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit} disabled={isPending}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ── VIEW ROW ── */
              <div key={v.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {v.name}
                    <span className="ml-2 text-slate-400 font-normal">{v.rate}%</span>
                  </p>
                  {fiscalnetEnabled && (
                    <p className="text-xs text-slate-400">
                      FiscalNet group: {v.fiscalnet_vat_group != null ? v.fiscalnet_vat_group : "not set"}
                    </p>
                  )}
                </div>
                {!!v.is_default && <Badge variant="secondary" className="shrink-0">Default</Badge>}
                {canEdit && deleteConfirm === v.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-red-600">Delete?</span>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleDelete(v.id)} disabled={isPending}>Yes</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDeleteConfirm(null)}>No</Button>
                  </div>
                ) : canEdit ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => startEdit(v)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-600" onClick={() => setDeleteConfirm(v.id)}>
                      ✕
                    </Button>
                  </div>
                ) : null}
              </div>
            )
          )}

          {/* ── ADD NEW ROW ── */}
          {canEdit && addingNew && (
            <div className="py-3 flex flex-wrap items-end gap-2 bg-slate-50 -mx-6 px-6 rounded-b">
              <div>
                <Label className="text-xs text-slate-500">Name</Label>
                <Input
                  placeholder="e.g. TVA 19%"
                  value={newState.name}
                  onChange={(e) => setNewState((s) => ({ ...s, name: e.target.value }))}
                  className="h-8 w-28 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Rate %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="19"
                  value={newState.rate}
                  onChange={(e) => setNewState((s) => ({ ...s, rate: e.target.value }))}
                  className="h-8 w-20 text-sm"
                />
              </div>
              {fiscalnetEnabled && (
                <div>
                  <Label className="text-xs text-slate-500">FiscalNet group</Label>
                  <select
                    value={newState.fiscalnet_vat_group}
                    onChange={(e) => setNewState((s) => ({ ...s, fiscalnet_vat_group: e.target.value }))}
                    className="h-8 rounded border border-slate-200 px-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {FISCALNET_GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-end gap-1">
                <button
                  type="button"
                  onClick={() => setNewState((s) => ({ ...s, is_default: !s.is_default }))}
                  className={`h-8 px-3 rounded border text-xs font-medium transition-colors ${
                    newState.is_default
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  {newState.is_default ? "★ Default" : "Set default"}
                </button>
              </div>
              <div className="flex items-end gap-1">
                <Button size="sm" className="h-8" onClick={handleAdd} disabled={isPending || !newState.name.trim() || newState.rate === ""}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingNew(false); setNewState({ name: "", rate: "", is_default: false, fiscalnet_vat_group: "" }); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {canEdit && !addingNew && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => { setAddingNew(true); cancelEdit(); }}>
              + Add tax rate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
