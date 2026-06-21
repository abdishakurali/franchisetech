"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, ChevronRight } from "lucide-react";
import { canCancelPurchase, purchaseStatusBadge } from "@/lib/nir/purchase";
import type { PurchaseStatus } from "@/lib/nir/purchase";
import { useAppI18n } from "@/lib/app-i18n-context";

type SupplierRef = { name: string } | null;
type PurchaseRow = {
  id: string;
  purchase_date: string | null;
  purchased_at: string | null;
  reference: string | null;
  invoice_number: string | null;
  nir_number: string | null;
  total_amount: number | null;
  tax_total: number | null;
  status: string | null;
  suppliers: SupplierRef;
  purchase_items: { id: string }[];
};

function fmt(v: number, currency: string) {
  if (currency === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: currency || "EUR" }).format(v);
}

export function PurchasesBulkTable({
  purchases,
  deleteAction,
  currency = "EUR",
}: {
  purchases: PurchaseRow[];
  deleteAction: (ids: string[]) => Promise<void>;
  currency?: string;
}) {
  const { t } = useAppI18n();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const cancellableIds = new Set(purchases.filter((p) => canCancelPurchase(p.status)).map((p) => p.id));
  const allCancellableSelected = cancellableIds.size > 0 && [...cancellableIds].every((id) => selected.has(id));

  function toggleAll() {
    if (allCancellableSelected) setSelected(new Set());
    else setSelected(new Set(cancellableIds));
  }

  function toggle(id: string) {
    if (!cancellableIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    const draftSelected = [...selected].filter((id) => cancellableIds.has(id));
    if (!draftSelected.length) return;
    if (!confirm(t.purchases.cancelDraftConfirm(draftSelected.length))) return;
    setDeleting(true);
    try {
      await deleteAction(draftSelected);
      setSelected(new Set());
    } finally {
      setDeleting(false);
    }
  }

  const selectedDraftCount = [...selected].filter((id) => cancellableIds.has(id)).length;

  return (
    <div>
      {selectedDraftCount > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-medium text-slate-700">{t.common.selected(selectedDraftCount)}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:bg-red-50 h-8"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
            {t.purchases.cancelDrafts}
          </Button>
          <button type="button" className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSelected(new Set())}>
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
                  checked={allCancellableSelected && cancellableIds.size > 0}
                  onChange={toggleAll}
                  disabled={cancellableIds.size === 0}
                  className="h-4 w-4 accent-blue-600 cursor-pointer disabled:opacity-40"
                  title={t.purchases.selectDrafts}
                />
              </TableHead>
              <TableHead>{t.tables.date}</TableHead>
              <TableHead>{t.tables.nirNo}</TableHead>
              <TableHead>{t.tables.supplier}</TableHead>
              <TableHead>{t.tables.invoice}</TableHead>
              <TableHead>{t.tables.items}</TableHead>
              <TableHead>{t.tables.status}</TableHead>
              <TableHead className="text-right">{t.purchases.gross}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((p) => {
              const dateStr = String(p.purchase_date ?? p.purchased_at ?? "").slice(0, 10);
              const supplierName = (p.suppliers as SupplierRef)?.name ?? "—";
              const invoiceRef = p.invoice_number ?? p.reference ?? "—";
              const badge = purchaseStatusBadge(t, p.status as PurchaseStatus, p.nir_number);
              const isCancelled = p.status === "cancelled";
              const canSelect = canCancelPurchase(p.status);
              return (
                <TableRow
                  key={p.id}
                  onClick={() => { window.location.href = `/app/purchases/${p.id}`; }}
                  className={`cursor-pointer hover:bg-slate-50 ${selected.has(p.id) ? "bg-blue-50/50" : ""} ${isCancelled ? "opacity-50" : ""}`}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      disabled={!canSelect}
                      className="h-4 w-4 accent-blue-600 cursor-pointer disabled:opacity-30"
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/purchases/${p.id}`} className="block hover:text-blue-600">{dateStr}</Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{p.nir_number ?? "—"}</TableCell>
                  <TableCell>
                    <Link href={`/app/purchases/${p.id}`} className="block font-medium hover:text-blue-600">{supplierName}</Link>
                  </TableCell>
                  <TableCell className="text-slate-500">{invoiceRef}</TableCell>
                  <TableCell>{(p.purchase_items ?? []).length}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs border ${badge.className}`}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {fmt(Number(p.total_amount ?? 0), currency)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/purchases/${p.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-end text-slate-400 hover:text-blue-600">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
