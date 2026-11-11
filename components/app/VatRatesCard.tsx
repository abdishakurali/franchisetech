"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { VatActionResult } from "@/app/actions/kitchenops";

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
  addAction: (fd: FormData) => Promise<VatActionResult>;
  updateAction: (fd: FormData) => Promise<VatActionResult>;
  deleteAction: (fd: FormData) => Promise<VatActionResult>;
  locale?: string | null;
}

const UI_STRINGS = {
  en: {
    title: "VAT / Tax Rates",
    descFiscalnet: "FiscalNet enabled — assign a VAT group (1–5) to each rate.",
    desc: "Manage your tax rates. Set one as default for new products.",
    filter: "Filter by name or rate",
    filterPlaceholder: "e.g. 19 or TVA Standard",
    name: "Name",
    namePlaceholder: "e.g. TVA 21%",
    rate: "Rate %",
    fiscalnetGroup: "FiscalNet group",
    none: "— none —",
    defaultOn: "★ Default",
    setDefault: "Set default",
    save: "Save",
    cancel: "Cancel",
    groupLine: (g: number | null | undefined) => `FiscalNet group: ${g != null ? g : "not set"}`,
    defaultBadge: "Default",
    deleteConfirm: "Delete?",
    yes: "Yes",
    no: "No",
    edit: "Edit",
    add: "Add",
    addRate: "+ Add tax rate",
    groups: ["1 — Standard (21%)", "2 — Reduced (11%)", "3 — Super-reduced (5%)", "4 — Zero (0%)", "5 — Exempt"],
    errNotVatRegistered: "Your company is not VAT-registered (ANAF), so only the 0% rate can be active. If it became VAT-registered, re-check the CUI with ANAF in Settings → Business.",
    errFailed: "The change was not saved. Try again; if it repeats, write to us on WhatsApp.",
  },
  ro: {
    title: "Cote TVA",
    descFiscalnet: "FiscalNet este activat — atribuiți fiecărei cote o grupă TVA (1–5).",
    desc: "Gestionați cotele de TVA. Setați una ca implicită pentru produsele noi.",
    filter: "Filtrați după nume sau cotă",
    filterPlaceholder: "ex. 21 sau TVA Standard",
    name: "Nume",
    namePlaceholder: "ex. TVA 21%",
    rate: "Cotă %",
    fiscalnetGroup: "Grupă TVA FiscalNet",
    none: "— niciuna —",
    defaultOn: "★ Implicită",
    setDefault: "Setați ca implicită",
    save: "Salvați",
    cancel: "Anulați",
    groupLine: (g: number | null | undefined) => `Grupă TVA FiscalNet: ${g != null ? g : "nesetată"}`,
    defaultBadge: "Implicită",
    deleteConfirm: "Ștergeți?",
    yes: "Da",
    no: "Nu",
    edit: "Editați",
    add: "Adăugați",
    addRate: "+ Adăugați cotă TVA",
    groups: ["1 — Standard (21%)", "2 — Redusă (11%)", "3 — Redusă (5%)", "4 — Zero (0%)", "5 — Scutit"],
    errNotVatRegistered: "Firma nu este plătitoare de TVA (conform ANAF), deci doar cota 0% poate fi activă. Dacă firma a devenit plătitoare, verificați din nou CUI-ul la ANAF în Setări → Business.",
    errFailed: "Modificarea nu s-a salvat. Încercați din nou; dacă se repetă, scrieți-ne pe WhatsApp.",
  },
} as const;

const FISCALNET_GROUP_VALUES = ["1", "2", "3", "4", "5"] as const;

export function VatRatesCard({ rates, fiscalnetEnabled, canEdit, addAction, updateAction, deleteAction, locale }: Props) {
  const ui = UI_STRINGS[locale === "ro" ? "ro" : "en"];
  const FISCALNET_GROUPS = FISCALNET_GROUP_VALUES.map((value, i) => ({ value, label: ui.groups[i] }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [filter, setFilter] = useState("");
  const [editState, setEditState] = useState<Partial<VatRate>>({});
  const [newState, setNewState] = useState<{ name: string; rate: string; is_default: boolean; fiscalnet_vat_group: string }>({
    name: "", rate: "", is_default: false, fiscalnet_vat_group: "",
  });
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showResult(res: VatActionResult | void): boolean {
    if (!res || res.ok) { setError(null); return true; }
    setError(res.error === "not_vat_registered" ? ui.errNotVatRegistered : ui.errFailed);
    return false;
  }

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
      if (showResult(await updateAction(fd))) setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      showResult(await deleteAction(fd));
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
      if (!showResult(await addAction(fd))) return;
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
        <CardTitle>{ui.title}</CardTitle>
        <CardDescription>
          {fiscalnetEnabled
            ? ui.descFiscalnet
            : ui.desc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p role="alert" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {error}
          </p>
        )}
        {rates.length > 3 && (
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground">{ui.filter}</Label>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={ui.filterPlaceholder}
              className="mt-1 h-9"
            />
          </div>
        )}
        <div className="divide-y divide-border">
          {displayRates.map((v) =>
            editingId === v.id ? (
              /* ── EDIT ROW ── */
              <div key={v.id} className="py-3 flex flex-wrap items-end gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">{ui.name}</Label>
                  <Input
                    value={editState.name ?? ""}
                    onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                    className="h-8 w-28 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{ui.rate}</Label>
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
                    <Label className="text-xs text-muted-foreground">{ui.fiscalnetGroup}</Label>
                    <select
                      value={editState.fiscalnet_vat_group != null ? String(editState.fiscalnet_vat_group) : ""}
                      onChange={(e) => setEditState((s) => ({ ...s, fiscalnet_vat_group: e.target.value ? Number(e.target.value) : undefined }))}
                      className="h-8 rounded border border-border px-2 text-sm"
                    >
                      <option value="">{ui.none}</option>
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
                        ? "bg-accent border-brass/40 text-brass"
                        : "bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {editState.is_default ? ui.defaultOn : ui.setDefault}
                  </button>
                </div>
                <div className="flex items-end gap-1">
                  <Button size="sm" className="h-8" onClick={() => handleSave(v.id)} disabled={isPending}>
                    {ui.save}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit} disabled={isPending}>
                    {ui.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              /* ── VIEW ROW ── */
              <div key={v.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {v.name}
                    <span className="ml-2 text-muted-foreground font-normal">{v.rate}%</span>
                  </p>
                  {fiscalnetEnabled && (
                    <p className="text-xs text-muted-foreground">
                      {ui.groupLine(v.fiscalnet_vat_group)}
                    </p>
                  )}
                </div>
                {!!v.is_default && <Badge variant="secondary" className="shrink-0">{ui.defaultBadge}</Badge>}
                {canEdit && deleteConfirm === v.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-attention">{ui.deleteConfirm}</span>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleDelete(v.id)} disabled={isPending}>{ui.yes}</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setDeleteConfirm(null)}>{ui.no}</Button>
                  </div>
                ) : canEdit ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => startEdit(v)}>
                      {ui.edit}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-attention" onClick={() => setDeleteConfirm(v.id)}>
                      ✕
                    </Button>
                  </div>
                ) : null}
              </div>
            )
          )}

          {/* ── ADD NEW ROW ── */}
          {canEdit && addingNew && (
            <div className="py-3 flex flex-wrap items-end gap-2 bg-secondary -mx-6 px-6 rounded-b">
              <div>
                <Label className="text-xs text-muted-foreground">{ui.name}</Label>
                <Input
                  placeholder={ui.namePlaceholder}
                  value={newState.name}
                  onChange={(e) => setNewState((s) => ({ ...s, name: e.target.value }))}
                  className="h-8 w-28 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{ui.rate}</Label>
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
                  <Label className="text-xs text-muted-foreground">{ui.fiscalnetGroup}</Label>
                  <select
                    value={newState.fiscalnet_vat_group}
                    onChange={(e) => setNewState((s) => ({ ...s, fiscalnet_vat_group: e.target.value }))}
                    className="h-8 rounded border border-border px-2 text-sm"
                  >
                    <option value="">{ui.none}</option>
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
                      ? "bg-accent border-brass/40 text-brass"
                      : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {newState.is_default ? ui.defaultOn : ui.setDefault}
                </button>
              </div>
              <div className="flex items-end gap-1">
                <Button size="sm" className="h-8" onClick={handleAdd} disabled={isPending || !newState.name.trim() || newState.rate === ""}>
                  {ui.add}
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingNew(false); setNewState({ name: "", rate: "", is_default: false, fiscalnet_vat_group: "" }); }}>
                  {ui.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>

        {canEdit && !addingNew && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => { setAddingNew(true); cancelEdit(); }}>
              {ui.addRate}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
