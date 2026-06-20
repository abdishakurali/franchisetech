"use client";

import Link from "next/link";
import { PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePosI18n } from "@/lib/pos-i18n-context";

type Props = {
  amountLabel: string;
  onClose: () => void;
};

/** Non-blocking first-sale banner — stays on POS. */
export function FirstSaleCelebration({ amountLabel, onClose }: Props) {
  const { t } = usePosI18n();

  return (
    <div className="mx-4 mb-3 shrink-0 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
          <PartyPopper className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-green-900">{t.firstSaleComplete(amountLabel)}</p>
          <p className="mt-1 text-sm text-green-800">Your till and dashboard are live.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onClose}
            >
              {t.keepSelling}
            </Button>
            <Link href="/app?celebrate=1" className="text-xs font-medium text-blue-700 hover:underline">
              Dashboard
            </Link>
            <Link href="/app/products/new" className="text-xs font-medium text-blue-700 hover:underline">
              {t.replaceDemoProducts}
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-green-700 hover:bg-green-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
