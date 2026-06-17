"use client";

import { useState } from "react";

export function StockAdjustCell({
  productId,
  currentQty,
  updateStock,
}: {
  productId: string;
  currentQty: number;
  updateStock: (fd: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(currentQty));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("product_id", productId);
      fd.set("quantity", val);
      await updateStock(fd);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Click to update on-hand quantity"
        className="tabular-nums font-semibold hover:bg-blue-50 hover:text-blue-700 rounded px-1.5 py-0.5 transition-colors"
      >
        {currentQty}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setVal(String(currentQty)); setEditing(false); }
        }}
        className="w-16 h-7 text-sm border border-blue-300 rounded px-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-200"
        autoFocus
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="text-xs font-bold text-green-600 hover:text-green-800 px-1"
      >
        {saving ? "…" : "✓"}
      </button>
      <button
        type="button"
        onClick={() => { setVal(String(currentQty)); setEditing(false); }}
        className="text-xs text-slate-400 hover:text-slate-600 px-1"
      >
        ✕
      </button>
    </span>
  );
}
