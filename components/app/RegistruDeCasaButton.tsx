"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { registruDeCasaTxt, downloadSlipAsTxt, type CashMovementRow } from "@/lib/pos-print";

type Props = {
  orgName: string;
  sessionName?: string;
  currency: string;
  openingCash: number;
  movements: Array<{
    movement_type: string;
    amount: number | string | null;
    reason: string | null;
    performed_at: string | null;
  }>;
  cashSales: number;
  countedCash?: number;
  expectedCash: number;
  notes?: string;
  userName: string;
  dateStart: string;
  dateEnd: string;
  label?: string;
};

export function RegistruDeCasaButton({
  orgName,
  sessionName = "Casa 1",
  currency,
  openingCash,
  movements,
  cashSales,
  countedCash,
  expectedCash,
  notes = "",
  userName,
  dateStart,
  dateEnd,
  label = "Registru de casă",
}: Props) {
  const handleDownload = () => {
    const mappedMovements: CashMovementRow[] = movements.map((m) => ({
      movement_type: m.movement_type as "opening" | "cash_in" | "cash_out",
      amount: Number(m.amount ?? 0),
      reason: m.reason,
      created_at: m.performed_at ?? new Date().toISOString(),
    }));

    const { text, filename } = registruDeCasaTxt({
      orgName,
      sessionName,
      currency,
      openingCash,
      movements: mappedMovements,
      cashSales,
      countedCash: countedCash ?? expectedCash,
      expectedCash,
      notes,
      userName,
      dateStart,
      dateEnd,
    });

    downloadSlipAsTxt(text, filename);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}
