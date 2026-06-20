"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addProductFromPos } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosI18n } from "@/lib/pos-i18n-context";

type Category = { id: string; name: string };

export function PosQuickAddProduct({
  open,
  onOpenChange,
  categories,
  defaultVatRate,
  currency = "EUR",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  defaultVatRate: number;
  currency?: string;
}) {
  const { t } = usePosI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const currencyLabel = currency === "RON" ? "lei" : currency;

  function handleClose(next: boolean) {
    if (pending) return;
    if (!next) setStatus(null);
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addProductFromPos(fd);
      if (!res.ok) {
        setStatus({ ok: false, msg: res.error ?? t.somethingWrong });
        return;
      }
      setStatus({ ok: true, msg: t.productAdded });
      router.refresh();
      setTimeout(() => {
        setStatus(null);
        onOpenChange(false);
      }, 600);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.addProductTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="vat_rate" value={defaultVatRate} />
          <div>
            <Label>{t.productName}</Label>
            <Input name="name" required autoFocus placeholder={t.productNamePlaceholder} className="mt-1" />
          </div>
          <div>
            <Label>{t.salePrice} ({currencyLabel})</Label>
            <Input name="sale_price" type="number" step="0.01" min="0" required placeholder="0.00" className="mt-1" />
          </div>
          <div>
            <Label>{t.category}</Label>
            <select
              name="category_id"
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">{t.noCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {status && (
            <p className={`text-sm font-medium ${status.ok ? "text-green-700" : "text-red-600"}`}>{status.msg}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={pending}>
              {t.cancel}
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={pending}>
              {pending ? t.processing : t.addProduct}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
