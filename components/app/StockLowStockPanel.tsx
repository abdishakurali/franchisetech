"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkUpdateProductStock } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppI18n } from "@/lib/app-i18n-context";
import { toast } from "sonner";

export type LowStockRow = {
  id: string;
  name: string;
  current_stock_qty: number;
  reorder_level: number;
  unit_of_measure: string | null;
};

export function StockLowStockPanel({ items }: { items: LowStockRow[] }) {
  const { t } = useAppI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const initial = useMemo(
    () =>
      Object.fromEntries(
        items.map((item) => [item.id, String(Math.max(item.reorder_level, item.current_stock_qty))])
      ),
    [items]
  );
  const [quantities, setQuantities] = useState<Record<string, string>>(initial);

  if (!items.length) return null;

  function setQty(id: string, value: string) {
    setQuantities((prev) => ({ ...prev, [id]: value }));
  }

  function fillReorder(id: string, reorder: number) {
    setQty(id, String(reorder));
  }

  function fillAllToReorder() {
    setQuantities(
      Object.fromEntries(items.map((item) => [item.id, String(Math.max(item.reorder_level, 0))]))
    );
  }

  function saveAll() {
    const payload = items
      .map((item) => ({
        product_id: item.id,
        quantity: Number(quantities[item.id] ?? item.current_stock_qty),
      }))
      .filter((row) => Number.isFinite(row.quantity) && row.quantity >= 0);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("items_json", JSON.stringify(payload));
      const result = await bulkUpdateProductStock(fd);
      if (!result.ok) {
        toast.error(result.error ?? t.stock.savingStock);
        return;
      }
      toast.success(t.stock.stockUpdated(result.updated ?? payload.length));
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-amber-950">
            ⚠ {t.stock.lowStockSummary(items.length)}
          </p>
          <p className="mt-1 text-sm text-amber-900/80">{t.stock.bulkReplenishHint}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="bg-white" onClick={() => setOpen((v) => !v)}>
            {open ? t.stock.collapseLowStock : t.stock.expandLowStock}
          </Button>
          <Link
            href="/app/stock?filter=low"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-amber-700 px-3 text-sm font-medium text-white hover:bg-amber-800"
          >
            {t.stock.showLowStockOnly}
          </Link>
        </div>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-amber-950">{t.stock.bulkReplenishTitle}</p>
            <Button type="button" variant="outline" size="sm" className="bg-white" onClick={fillAllToReorder}>
              {t.stock.setAllToReorder}
            </Button>
          </div>

          <div className="max-h-72 overflow-auto rounded-lg border border-amber-200 bg-white">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">{t.tables.product}</th>
                  <th className="px-3 py-2 font-medium text-right">{t.stock.onHand}</th>
                  <th className="px-3 py-2 font-medium text-right">{t.stock.reorderAt}</th>
                  <th className="px-3 py-2 font-medium text-right">{t.stock.newQty}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{item.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-600">
                      {item.current_stock_qty} {item.unit_of_measure ?? ""}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-500">{item.reorder_level}</td>
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={quantities[item.id] ?? ""}
                        onChange={(e) => setQty(item.id, e.target.value)}
                        className="ml-auto h-8 w-24 text-right tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => fillReorder(item.id, item.reorder_level)}
                      >
                        {t.stock.toReorder}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={saveAll} disabled={pending}>
              {pending ? t.stock.savingStock : t.stock.saveStock}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 line-clamp-2 text-sm text-amber-900/70 sm:line-clamp-1">
          {items.slice(0, 4).map((item) => item.name).join(" · ")}
          {items.length > 4 ? ` · +${items.length - 4}` : ""}
        </p>
      )}
    </div>
  );
}
