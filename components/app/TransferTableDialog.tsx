"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloorPlanCanvas } from "@/components/app/FloorPlanCanvas";
import {
  getFloorSections,
  getTables,
  transferTab,
  type FloorSection,
  type TableWithStatus,
} from "@/app/actions/table-service";

type Props = {
  open: boolean;
  tabId: string;
  currentTableId: string;
  siteId?: string | null;
  currency?: string;
  onOpenChange: (open: boolean) => void;
};

export function TransferTableDialog({
  open,
  tabId,
  currentTableId,
  siteId = null,
  currency = "RON",
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableWithStatus[]>([]);
  const [sections, setSections] = useState<FloorSection[]>([]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void (async () => {
      const [t, s] = await Promise.all([getTables(siteId), getFloorSections(siteId)]);
      setTables(t);
      setSections(s);
    })();
  }, [open, siteId, currentTableId]);

  function handleSelect(table: TableWithStatus) {
    if (table.id === currentTableId) {
      onOpenChange(false);
      return;
    }
    if (table.active_tab) {
      setError("Masa este ocupată.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await transferTab(tabId, table.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  const freeTables = tables.filter((t) => !t.active_tab && t.is_active);

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mută masa</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Alege o masă liberă. Comenzile și totalul se mută împreună cu bonul.
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex-1 min-h-[320px] flex flex-col">
          <FloorPlanCanvas
            sections={sections}
            tables={freeTables.length ? freeTables : tables}
            mode="view"
            currency={currency}
            pending={pending}
            onSelectTable={handleSelect}
            immersive
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
