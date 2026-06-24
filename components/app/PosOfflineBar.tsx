"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { dismissPendingFiscal } from "@/lib/pos-offline-queue";
import type { QueuedSale } from "@/lib/pos-offline-queue";
import type { PosT } from "@/lib/pos-i18n-context";
import { Button } from "@/components/ui/button";

type Props = {
  t: PosT;
  browserOffline: boolean;
  pendingSync: QueuedSale[];
  pendingFiscal: QueuedSale[];
  syncing?: boolean;
  onQueueChange: () => void;
  onSyncAll?: () => void;
  onResend?: (id: string) => void;
  onDismiss?: (id: string) => void;
};

export function PosOfflineBar({
  t,
  browserOffline,
  pendingSync,
  pendingFiscal,
  syncing = false,
  onQueueChange,
  onSyncAll,
  onResend,
  onDismiss,
}: Props) {
  const hasQueue = pendingSync.length > 0 || pendingFiscal.length > 0;
  if (!browserOffline && !hasQueue) return null;

  return (
    <div className="shrink-0 space-y-1.5 border-b border-slate-100 bg-white px-3 py-2 sm:px-4">
      {browserOffline && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800 sm:text-sm">
          <WifiOff className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
          {t.offlineModeBanner}
        </div>
      )}
      {pendingSync.length > 0 && onSyncAll && !browserOffline && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-50"
            disabled={syncing}
            onClick={onSyncAll}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {t.offlineSyncNow}
          </Button>
        </div>
      )}
      {pendingSync.map((entry) => (
        <div
          key={entry.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:text-sm"
        >
          <div className="min-w-0">
            <span className="font-semibold">{t.offlinePendingSyncRow}</span>
            <span className="text-amber-800"> — {entry.label}</span>
            {entry.lastError && (
              <p className="mt-0.5 text-[11px] text-amber-700">{t.offlineSyncFailed}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onResend && (
              <button
                type="button"
                disabled={syncing}
                onClick={() => onResend(entry.id)}
                className="shrink-0 rounded-md border border-amber-400 bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                {t.offlineResend}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                disabled={syncing}
                onClick={() => { onDismiss(entry.id); onQueueChange(); }}
                className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                title="Elimină din coadă"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      {pendingFiscal.map((entry) => (
        <div
          key={entry.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-900 sm:text-sm"
        >
          <div className="min-w-0">
            <span className="font-semibold">{t.offlinePendingFiscalRow}</span>
            <span className="text-orange-800"> — {entry.label}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {entry.transactionId && (
              <a
                href={`/app/transactions/${entry.transactionId}`}
                className="font-medium text-orange-700 underline hover:text-orange-900"
              >
                {t.offlineViewReceipt}
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                dismissPendingFiscal(entry.id);
                onQueueChange();
              }}
              className="rounded-md border border-orange-300 bg-white px-2 py-0.5 font-medium text-orange-800 hover:bg-orange-100"
            >
              {t.offlineFiscalDismiss}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
