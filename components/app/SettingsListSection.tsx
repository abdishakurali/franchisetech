"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type FieldType = "text" | "select" | "color" | "number" | "toggle";

export interface ListFieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

type FieldValue = string | number | boolean;
type FieldValues = Record<string, FieldValue>;

export interface ListRow {
  id: string;
  primary: string;
  secondary?: string | null;
  badge?: { label: string; active?: boolean } | null;
  editValues: FieldValues;
}

interface Props {
  title: string;
  description?: string;
  rows: ListRow[];
  canEdit: boolean;
  addFields: ListFieldDef[];
  editFields: ListFieldDef[];
  hiddenAddValues?: Record<string, string>;
  addDefaults: FieldValues;
  addAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
  addLabel: string;
  emptyLabel: string;
}

/**
 * The one shared list pattern for a settings section that's actually a list
 * you add/rename/retire from — payment methods, categories. Not every
 * settings section is this shape: units are a fixed read-only set, location
 * is a single record. Those stay outside this component rather than being
 * forced into it.
 *
 * Rows are passed as plain view-model data (not getter functions) because
 * this is a client component: a Server Component caller can't pass closures
 * across that boundary, only serializable data and actual Server Actions.
 */
export function SettingsListSection({
  title,
  description,
  rows,
  canEdit,
  addFields,
  editFields,
  hiddenAddValues,
  addDefaults,
  addAction,
  updateAction,
  deleteAction,
  addLabel,
  emptyLabel,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<FieldValues>({});
  const [addingNew, setAddingNew] = useState(false);
  const [addValues, setAddValues] = useState<FieldValues>(addDefaults);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit(row: ListRow) {
    setEditingId(row.id);
    setEditValues(row.editValues);
    setAddingNew(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  function handleSave(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    for (const f of editFields) fd.set(f.key, String(editValues[f.key] ?? ""));
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
    const fd = new FormData();
    for (const [k, v] of Object.entries(hiddenAddValues ?? {})) fd.set(k, v);
    for (const f of addFields) fd.set(f.key, String(addValues[f.key] ?? ""));
    startTransition(async () => {
      await addAction(fd);
      setAddValues(addDefaults);
      setAddingNew(false);
    });
  }

  function renderField(
    field: ListFieldDef,
    values: FieldValues,
    setValues: (updater: (s: FieldValues) => FieldValues) => void
  ) {
    const value = values[field.key];
    if (field.type === "toggle") {
      const on = Boolean(value);
      return (
        <div className={field.className ?? ""}>
          <Label className="text-xs text-slate-500 block mb-1">{field.label}</Label>
          <button
            type="button"
            onClick={() => setValues((s) => ({ ...s, [field.key]: !on }))}
            className={`h-8 px-3 rounded border text-sm font-medium transition-colors ${
              on
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            {on ? "Active" : "Inactive"}
          </button>
        </div>
      );
    }
    if (field.type === "select") {
      return (
        <div className={field.className ?? ""}>
          <Label className="text-xs text-slate-500">{field.label}</Label>
          <select
            value={value != null ? String(value) : ""}
            onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
            className="h-8 rounded border border-slate-200 px-2 text-sm w-full"
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    }
    if (field.type === "color") {
      return (
        <div className={field.className ?? ""}>
          <Label className="text-xs text-slate-500">{field.label}</Label>
          <Input
            type="color"
            value={value != null ? String(value) : "#64748b"}
            onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
            className="h-8 w-14 p-1"
          />
        </div>
      );
    }
    return (
      <div className={field.className ?? ""}>
        <Label className="text-xs text-slate-500">{field.label}</Label>
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          value={value != null ? String(value) : ""}
          onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
          className="h-8 text-sm"
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100">
          {rows.length === 0 && !addingNew ? (
            <p className="py-3 text-sm text-slate-400">{emptyLabel}</p>
          ) : null}
          {rows.map((row) =>
            editingId === row.id ? (
              <div key={row.id} className="py-3 flex flex-wrap items-end gap-2">
                {editFields.map((f) => (
                  <div key={f.key}>{renderField(f, editValues, setEditValues)}</div>
                ))}
                <div className="flex items-end gap-1">
                  <Button size="sm" className="h-8" onClick={() => handleSave(row.id)} disabled={isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit} disabled={isPending}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div key={row.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{row.primary}</p>
                  {row.secondary ? (
                    <p className="text-xs text-slate-400">{row.secondary}</p>
                  ) : null}
                </div>
                {row.badge ? (
                  <Badge variant={row.badge.active === false ? "outline" : "secondary"} className="shrink-0">
                    {row.badge.label}
                  </Badge>
                ) : null}
                {canEdit && deleteConfirm === row.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-red-600">Delete?</span>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleDelete(row.id)} disabled={isPending}>Yes</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDeleteConfirm(null)}>No</Button>
                  </div>
                ) : canEdit ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => startEdit(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-600" onClick={() => setDeleteConfirm(row.id)}>
                      ✕
                    </Button>
                  </div>
                ) : null}
              </div>
            )
          )}

          {canEdit && addingNew && (
            <div className="py-3 flex flex-wrap items-end gap-2 bg-slate-50 -mx-6 px-6 rounded-b">
              {addFields.map((f) => (
                <div key={f.key}>{renderField(f, addValues, setAddValues)}</div>
              ))}
              <div className="flex items-end gap-1">
                <Button size="sm" className="h-8" onClick={handleAdd} disabled={isPending}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingNew(false); setAddValues(addDefaults); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {canEdit && !addingNew && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => { setAddingNew(true); cancelEdit(); }}>
              {addLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
