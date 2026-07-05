"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CashDenomStepper } from "@/components/app/CashDenomStepper";
import { RON_CASH_DENOMINATIONS, denomTotal } from "@/lib/pos-cash-denominations";

function money(v: number) {
  return `${v.toFixed(2)} lei`;
}

export function CashCountModal({
  open,
  onOpenChange,
  initialBreakdown,
  onConfirm,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBreakdown?: Record<number, number> | null;
  onConfirm: (total: number, breakdown: Record<number, number>) => void;
  labels: {
    title: string;
    total: string;
    confirm: string;
    cancel: string;
  };
}) {
  const [qty, setQty] = useState<Record<number, number>>(() => initialBreakdown ?? {});

  const total = useMemo(() => denomTotal(qty), [qty]);

  const setDenomQty = (value: number, next: number) => {
    setQty((prev) => ({ ...prev, [value]: next }));
  };

  const handleConfirm = () => {
    onConfirm(total, qty);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 py-1 sm:grid-cols-2">
          {RON_CASH_DENOMINATIONS.map((d) => (
            <CashDenomStepper
              key={d.value}
              label={d.label}
              value={qty[d.value] || 0}
              onChange={(next) => setDenomQty(d.value, next)}
            />
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="text-sm font-semibold text-slate-700">{labels.total}</span>
          <span className="text-lg font-bold tabular-nums text-blue-700">{money(total)}</span>
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>{labels.cancel}</DialogClose>
          <Button type="button" onClick={handleConfirm} className="bg-blue-600 text-white hover:bg-blue-700">
            {labels.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
