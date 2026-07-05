"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestBill } from "@/app/actions/table-service";
import { formatSeatsLabel, formatTabDuration } from "@/lib/floor-plan/constants";
import { TransferTableDialog } from "@/components/app/TransferTableDialog";
import { ArrowLeft, ArrowRightLeft, FileText } from "lucide-react";

export type PosActiveTable = {
  id: string;
  tableId: string;
  siteId?: string | null;
  tableName: string;
  status: "open" | "bill_requested";
  coverCount?: number | null;
  openedAt?: string;
  capacity?: number | null;
};

function money(v: number, currency: string) {
  if (currency === "RON") return `${v.toFixed(2)} lei`;
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(v);
}

export function PosTableContextBar({
  activeTab,
  canManage = false,
  pendingSubtotal = 0,
  currency = "RON",
}: {
  activeTab: PosActiveTable;
  canManage?: boolean;
  pendingSubtotal?: number;
  currency?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [transferOpen, setTransferOpen] = useState(false);

  const statusLabel =
    activeTab.status === "bill_requested" ? "Notă solicitată" : "Comandă deschisă";

  const seatsLabel = formatSeatsLabel(
    activeTab.capacity,
    activeTab.coverCount,
    true
  );

  return (
    <>
      <div className="shrink-0 border-b border-amber-900/20 bg-amber-950/75 backdrop-blur-sm px-3 py-2.5 sm:px-4 text-amber-50">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/app/pos"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Sală
          </Link>
          <span className="hidden sm:inline text-amber-700">|</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400 shrink-0" />
            <span className="font-semibold text-white">Masa {activeTab.tableName}</span>
          </div>
          {seatsLabel && (
            <span className="text-xs font-medium text-amber-950 bg-amber-100/90 border border-amber-200/50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {seatsLabel}
            </span>
          )}
          {pendingSubtotal > 0 && (
            <span className="text-xs font-semibold text-amber-950 bg-white/90 px-2 py-0.5 rounded-full tabular-nums">
              {money(pendingSubtotal, currency)} pe masă
            </span>
          )}
          <span className="text-xs text-amber-100 bg-amber-900/50 px-2 py-0.5 rounded-full">
            {statusLabel}
          </span>
          {activeTab.openedAt && (
            <span className="text-xs text-amber-200/90 tabular-nums">
              {formatTabDuration(activeTab.openedAt)}
            </span>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs border-amber-300/40 bg-amber-900/30 text-amber-50 hover:bg-amber-900/50"
            disabled={pending}
            onClick={() => setTransferOpen(true)}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
            Mută masa
          </Button>
          {activeTab.status === "open" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-amber-300/40 bg-amber-900/30 text-amber-50 hover:bg-amber-900/50"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await requestBill(activeTab.id);
                  router.refresh();
                });
              }}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Blochează comandă
            </Button>
          )}
          {activeTab.status === "bill_requested" && (
            <span className="text-xs text-amber-200 font-medium">Blocată — încasează total</span>
          )}
        </div>
      </div>
      <TransferTableDialog
        open={transferOpen}
        tabId={activeTab.id}
        currentTableId={activeTab.tableId}
        siteId={activeTab.siteId}
        currency={currency}
        onOpenChange={setTransferOpen}
      />
    </>
  );
}
