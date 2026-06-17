"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
function fmt(v: number) { return new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR"}).format(v); }

import { Trash2, Loader2, ChevronRight } from "lucide-react";

type SupplierRef = { name: string } | null;
type PurchaseRow = {
  id: string; purchase_date: string | null; purchased_at: string | null; reference: string | null;
  total_amount: number | null; status: string | null; suppliers: SupplierRef; purchase_items: { id: string }[];
};

export function PurchasesBulkTable({
  purchases,
  deleteAction,
}: {
  purchases: PurchaseRow[];
  deleteAction: (ids: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = purchases.length > 0 && selected.size === purchases.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(purchases.map((p) => p.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!selected.size) return;
    if (!confirm(`Cancel ${selected.size} purchase${selected.size !== 1 ? "s" : ""}?`)) return;
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
          <span className="text-sm font-medium text-slate-700">{selected.size} selected</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:bg-red-50 h-8"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
            Cancel selected
          </Button>
          <button className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="h-4 w-4 accent-blue-600 cursor-pointer" title="Select all" />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((p) => {
              const dateStr = String(p.purchase_date ?? p.purchased_at ?? "").slice(0, 10);
              const supplierName = (p.suppliers as SupplierRef)?.name ?? "—";
              const isCancelled = p.status === "cancelled";
              return (
                <TableRow key={p.id} onClick={() => { window.location.href = `/app/purchases/${p.id}`; }} className={`cursor-pointer hover:bg-slate-50 ${selected.has(p.id) ? "bg-blue-50/50" : ""} ${isCancelled ? "opacity-50" : ""}`}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)}
                      className="h-4 w-4 accent-blue-600 cursor-pointer" />
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/purchases/${p.id}`} className="block hover:text-blue-600">{dateStr}</Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/purchases/${p.id}`} className="block font-medium hover:text-blue-600">{supplierName}</Link>
                  </TableCell>
                  <TableCell className="text-slate-500">{p.reference ?? "—"}</TableCell>
                  <TableCell>{(p.purchase_items ?? []).length}</TableCell>
                  <TableCell>
                    {isCancelled
                      ? <Badge variant="secondary" className="text-red-600 bg-red-50 text-xs">Cancelled</Badge>
                      : <Badge variant="secondary" className="text-green-700 bg-green-50 text-xs">Received</Badge>}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {fmt(Number(p.total_amount ?? 0))}
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
