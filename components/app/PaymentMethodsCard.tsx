"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  active: boolean;
  fiscalnet_code?: number | null;
}

interface Props {
  methods: PaymentMethod[];
  fiscalnetEnabled: boolean;
  canEdit: boolean;
  addAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}

const FISCALNET_CODES = [
  { value: "1", label: "1 – Cash" },
  { value: "2", label: "2 – Card" },
  { value: "3", label: "3 – Credit" },
  { value: "4", label: "4 – Tichete masă" },
  { value: "5", label: "5 – Tichete valorice" },
  { value: "6", label: "6 – Voucher" },
  { value: "7", label: "7 – Plată modernă" },
  { value: "8", label: "8 – Altele" },
];

const METHOD_TYPES = ["cash", "card", "online", "other"];

export function PaymentMethodsCard({ methods, fiscalnetEnabled, canEdit, addAction, updateAction, deleteAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editState, setEditState] = useState<Partial<PaymentMethod>>({});
  const [newState, setNewState] = useState<{ name: string; type: string; fiscalnet_code: string; active: boolean }>({
    name: "", type: "cash", fiscalnet_code: "", active: true,
  });
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function startEdit(m: PaymentMethod) {
    setEditingId(m.id);
    setEditState({
      name: m.name,
      type: m.type,
      active: m.active,
      fiscalnet_code: m.fiscalnet_code ?? undefined,
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
    fd.set("type", String(editState.type ?? "other"));
    fd.set("active", String(editState.active ?? true));
    fd.set("fiscalnet_code", String(editState.fiscalnet_code ?? ""));
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
    if (!newState.name.trim()) return;
    const fd = new FormData();
    fd.set("name", newState.name);
    fd.set("type", newState.type);
    fd.set("fiscalnet_code", newState.fiscalnet_code);
    fd.set("active", "true");
    startTransition(async () => {
      await addAction(fd);
      setNewState({ name: "", type: "cash", fiscalnet_code: "", active: true });
      setAddingNew(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment methods</CardTitle>
        {fiscalnetEnabled && (
          <CardDescription>FiscalNet enabled — assign a payment code (1–8) to each method.</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100">
          {methods.map((m) =>
            editingId === m.id ? (
              /* ── EDIT ROW ── */
              <div key={m.id} className="py-3 flex flex-wrap items-end gap-2">
                <div>
                  <Label className="text-xs text-slate-500">Name</Label>
                  <Input
                    value={editState.name ?? ""}
                    onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                    className="h-8 w-36 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Type</Label>
                  <select
                    value={editState.type ?? "other"}
                    onChange={(e) => setEditState((s) => ({ ...s, type: e.target.value }))}
                    className="h-8 rounded border border-slate-200 px-2 text-sm"
                  >
                    {METHOD_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {fiscalnetEnabled && (
                  <div>
                    <Label className="text-xs text-slate-500">FiscalNet code</Label>
                    <select
                      value={editState.fiscalnet_code != null ? String(editState.fiscalnet_code) : ""}
                      onChange={(e) => setEditState((s) => ({ ...s, fiscalnet_code: e.target.value ? Number(e.target.value) : undefined }))}
                      className="h-8 rounded border border-slate-200 px-2 text-sm"
                    >
                      <option value="">— none —</option>
                      {FISCALNET_CODES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-end gap-1">
                  <Label className="text-xs text-slate-500 block mb-1">Active</Label>
                  <button
                    type="button"
                    onClick={() => setEditState((s) => ({ ...s, active: !s.active }))}
                    className={`h-8 px-3 rounded border text-sm font-medium transition-colors ${
                      editState.active
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {editState.active ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="flex items-end gap-1">
                  <Button size="sm" className="h-8" onClick={() => handleSave(m.id)} disabled={isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit} disabled={isPending}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ── VIEW ROW ── */
              <div key={m.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-slate-400">
                    {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                    {fiscalnetEnabled && m.fiscalnet_code != null && (
                      <span className="ml-2 text-slate-500">· FN code {m.fiscalnet_code}</span>
                    )}
                  </p>
                </div>
                <Badge variant={m.active ? "secondary" : "outline"} className="shrink-0">
                  {m.active ? "Active" : "Inactive"}
                </Badge>
                {canEdit && deleteConfirm === m.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-red-600">Delete?</span>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleDelete(m.id)} disabled={isPending}>Yes</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDeleteConfirm(null)}>No</Button>
                  </div>
                ) : canEdit ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => startEdit(m)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-600" onClick={() => setDeleteConfirm(m.id)}>
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
                  placeholder="e.g. Tichete masă"
                  value={newState.name}
                  onChange={(e) => setNewState((s) => ({ ...s, name: e.target.value }))}
                  className="h-8 w-36 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Type</Label>
                <select
                  value={newState.type}
                  onChange={(e) => setNewState((s) => ({ ...s, type: e.target.value }))}
                  className="h-8 rounded border border-slate-200 px-2 text-sm"
                >
                  {METHOD_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              {fiscalnetEnabled && (
                <div>
                  <Label className="text-xs text-slate-500">FiscalNet code</Label>
                  <select
                    value={newState.fiscalnet_code}
                    onChange={(e) => setNewState((s) => ({ ...s, fiscalnet_code: e.target.value }))}
                    className="h-8 rounded border border-slate-200 px-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {FISCALNET_CODES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-end gap-1">
                <Button size="sm" className="h-8" onClick={handleAdd} disabled={isPending || !newState.name.trim()}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingNew(false); setNewState({ name: "", type: "cash", fiscalnet_code: "", active: true }); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {canEdit && !addingNew && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => { setAddingNew(true); cancelEdit(); }}>
              + Add payment method
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
