"use client";

import { Check, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PosT } from "@/lib/pos-i18n-context";
import type { PosLocale } from "@/lib/pos-i18n";
import type { PosConnectionState } from "@/lib/pos-connection-status";

type Props = {
  t: PosT;
  locale: PosLocale;
  state: PosConnectionState;
  queuedCount: number;
  lastSyncedAt: string | null;
};

const STATE_STYLES: Record<PosConnectionState, string> = {
  synced: "border-slate-200 bg-white text-slate-600",
  syncing: "border-blue-200 bg-blue-50 text-blue-800",
  offline: "border-amber-300 bg-amber-50 text-amber-900",
};

function formatLastSync(iso: string | null, locale: PosLocale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(locale === "ro" ? "ro-RO" : "en-IE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Gate B: one connection indicator, fixed position, exactly three states
 * (see lib/pos-connection-status.ts). Never a toast, never a modal — this
 * renders in every checkout step, including the full-screen payment/
 * complete overlay, so the cashier always has it in view without it ever
 * interrupting what they're doing.
 *
 * A stuck offline sync queue is still visible/actionable the same way it
 * always has been, via PosOfflineBar's inline banner (shown when not in
 * the focused-checkout overlay) — this indicator is the always-there status
 * summary, not a replacement for that detail view.
 */
export function PosConnectionIndicator({ t, locale, state, queuedCount, lastSyncedAt }: Props) {
  const label =
    state === "offline" ? t.connOffline : state === "syncing" ? t.connSyncing : t.connSynced;
  const lastSyncLabel = lastSyncedAt
    ? t.connLastSync(formatLastSync(lastSyncedAt, locale))
    : t.connLastSyncNever;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-3 right-3 z-[70] flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm sm:bottom-4 sm:right-4",
        STATE_STYLES[state],
      )}
      role="status"
      aria-live="polite"
      title={lastSyncLabel}
    >
      {state === "offline" ? (
        <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : state === "syncing" ? (
        <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      <span>{label}</span>
      {queuedCount > 0 && <span className="tabular-nums">· {t.connQueued(queuedCount)}</span>}
    </div>
  );
}
