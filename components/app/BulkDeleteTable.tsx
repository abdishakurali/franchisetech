"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2 } from "lucide-react";
import { useAppI18n } from "@/lib/app-i18n-context";

function fmt(v: number, currency = "EUR") {
  const n = Number(v ?? 0);
  if (currency === "RON") return `${n.toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: currency || "EUR" }).format(n);
}

type Product = {
  id: string; name: string; sale_price: number | null; cost_price: number | null;
  vat_rate: number | null; available_in_pos: boolean | null; is_ingredient: boolean | null;
  is_stock_tracked: boolean | null; current_stock_qty: number | null;
  image_url?: string | null;
  product_categories: { name: string } | null;
};

function StockCell({ product, updateStock, clickHint }: { product: Product; updateStock?: (fd: FormData) => Promise<void>; clickHint: string }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [val, setVal] = useState(String(product.current_stock_qty ?? 0));

  if (!product.is_stock_tracked) return <span className="text-slate-300">—</span>;
  if (!updateStock) return <span className="tabular-nums text-sm">{product.current_stock_qty ?? 0}</span>;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="tabular-nums text-sm rounded px-1 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        title={clickHint}
      >
        {product.current_stock_qty ?? 0}
      </button>
    );
  }

  async function save() {
    if (!updateStock) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("product_id", product.id);
      fd.set("quantity", val);
      await updateStock(fd);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="w-16 h-6 text-sm border rounded px-1 tabular-nums"
        autoFocus
      />
      <button type="button" onClick={save} disabled={saving} className="text-xs text-green-600 hover:text-green-800 font-medium">
        {saving ? "…" : "✓"}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
    </span>
  );
}

export function ProductsBulkTable({
  products,
  deleteAction,
  updateStockAction,
  inventoryVisible = true,
  recipeVisible = true,
  currency = "EUR",
}: {
  products: Product[];
  deleteAction: (ids: string[]) => Promise<void>;
  updateStockAction?: (fd: FormData) => Promise<void>;
  inventoryVisible?: boolean;
  recipeVisible?: boolean;
  currency?: string;
}) {
  const { t } = useAppI18n();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!selected.size) return;
    if (!confirm(t.tables.deleteConfirm(selected.size))) return;
    setDeleting(true);
    try {
      await deleteAction([...selected]);
      setSelected(new Set());
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-medium text-slate-700">{t.common.selected(selected.size)}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:bg-red-50 h-8"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
            {t.tables.deleteSelected}
          </Button>
          <button className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSelected(new Set())}>
            {t.common.clearSelection}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-blue-600 cursor-pointer"
                  title={t.common.selectAll}
                />
              </TableHead>
              <TableHead>{t.tables.name}</TableHead>
              <TableHead>{t.tables.category}</TableHead>
              <TableHead className="text-right">{t.tables.price}</TableHead>
              <TableHead className="text-right">{t.tables.cost}</TableHead>
              <TableHead>{t.tables.vat}</TableHead>
              <TableHead>{t.tables.type}</TableHead>
              {inventoryVisible ? <TableHead className="text-right">{t.tables.stock}</TableHead> : null}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                onClick={() => { window.location.href = `/app/products/${p.id}`; }}
                className={`cursor-pointer hover:bg-slate-50 ${selected.has(p.id) ? "bg-blue-50/50" : ""}`}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 accent-blue-600 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover shrink-0 border border-slate-100" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-slate-100 shrink-0" />
                    )}
                    <div>
                      <Link href={`/app/products/${p.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-blue-600 hover:underline">
                        {p.name || t.common.untitled}
                      </Link>
                      {p.available_in_pos === false && (
                        <span className="ml-2 text-xs text-slate-400">{t.common.notInPos}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{p.product_categories?.name ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt(Number(p.sale_price ?? 0), currency)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.cost_price ? fmt(Number(p.cost_price), currency) : "—"}
                </TableCell>
                <TableCell className="text-sm">{p.vat_rate ?? 0}%</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.available_in_pos !== false && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">{t.badges.pos}</Badge>
                    )}
                    {recipeVisible && p.is_ingredient && (
                      <Badge variant="outline" className="text-xs">{t.badges.ingredient}</Badge>
                    )}
                    {inventoryVisible && p.is_stock_tracked && (
                      <Badge variant="outline" className="text-xs">{t.badges.stock}</Badge>
                    )}
                  </div>
                </TableCell>
                {inventoryVisible ? (
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <StockCell product={p} updateStock={updateStockAction} clickHint={t.tables.clickUpdateStock} />
                  </TableCell>
                ) : null}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Link href={`/app/products/${p.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">{t.common.edit}</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
