"use client";

import { useState, useRef } from "react";
import { voidTransaction } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

export function VoidTransactionButton({ transactionId, status }: { transactionId: string; status: string }) {
  const { t } = useAppI18n();
  const v = t.transactions.void;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (status === "voided") {
    return <span className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700">{v.voided}</span>;
  }

  if (!open) {
    return (
      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>
        {v.button}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3 max-w-sm">
      <p className="font-medium text-red-800">{v.confirmTitle}</p>
      <p className="text-sm text-red-600">{v.confirmDesc}</p>
      <form
        ref={formRef}
        action={async (fd) => {
          setSubmitting(true);
          await voidTransaction(fd);
        }}
        className="space-y-3"
      >
        <input type="hidden" name="transaction_id" value={transactionId} />
        <textarea
          name="reason"
          required
          placeholder={v.reasonPlaceholder}
          className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm placeholder-slate-400"
          rows={2}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
            {submitting ? v.voiding : v.confirm}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {v.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
