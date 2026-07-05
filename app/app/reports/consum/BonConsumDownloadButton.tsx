"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { bonConsumTxt, type ConsumptionItem } from "@/lib/ro-accounting/bon-consum";
import { downloadSlipAsTxt } from "@/lib/pos-print";

type Props = {
  orgName: string;
  orgCui?: string;
  documentNumber: string;
  date: string;
  items: ConsumptionItem[];
  userName?: string;
  primitor?: string;
  label?: string;
};

export function BonConsumDownloadButton({
  orgName,
  orgCui,
  documentNumber,
  date,
  items,
  userName,
  primitor,
  label = "Descarcă Bon de Consum",
}: Props) {
  const handleDownload = () => {
    const { text, filename } = bonConsumTxt({
      orgName,
      orgCui,
      documentNumber,
      date,
      items,
      predator: userName,
      primitor,
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
