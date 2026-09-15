"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InventoryCountCell({
  countId,
  productId,
  expectedQty,
  countedQty,
  unit,
  recordItem,
}: {
  countId: string;
  productId: string;
  expectedQty: number;
  countedQty: number | null;
  unit: string;
  recordItem: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(countedQty == null);
  const [val, setVal] = useState(countedQty != null ? String(countedQty) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (val.trim() === "") return;
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("inventory_count_id", countId);
      fd.set("product_id", productId);
      fd.set("counted_qty", val);
      const result = await recordItem(fd);
      if (!result.ok) {
        setError(result.error ?? "Failed");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    const counted = countedQty ?? 0;
    const hasVariance = countedQty != null && Math.abs(counted - expectedQty) > 0.001;
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`tabular-nums font-semibold rounded px-1.5 py-0.5 transition-colors ${
          hasVariance ? "text-amber-700 hover:bg-amber-50" : "text-green-700 hover:bg-green-50"
        }`}
      >
        {countedQty} {unit}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          step="any"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape" && countedQty != null) {
              setVal(String(countedQty));
              setEditing(false);
            }
          }}
          placeholder={String(expectedQty)}
          className="w-20 h-7 text-sm border border-blue-300 rounded px-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-200"
          autoFocus
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || val.trim() === ""}
          className="text-xs font-bold text-green-600 hover:text-green-800 px-1 disabled:opacity-40"
        >
          {saving ? "…" : "✓"}
        </button>
        {countedQty != null ? (
          <button
            type="button"
            onClick={() => {
              setVal(String(countedQty));
              setEditing(false);
            }}
            className="text-xs text-slate-400 hover:text-slate-600 px-1"
          >
            ✕
          </button>
        ) : null}
      </span>
      {error ? <span className="text-[10px] text-red-600">{error}</span> : null}
    </span>
  );
}
