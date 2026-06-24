"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { balantaPdf, type BalantaItem, type BalantaIntegrityStatus } from "@/lib/ro-accounting/balanta";
import { openReportForPdf } from "@/lib/ro-accounting/print-report";

type Props = {
  orgName: string;
  orgCui?: string;
  gestiune?: string;
  dateFrom: string;
  dateTo: string;
  currency: string;
  items: BalantaItem[];
  integrityLabels?: Partial<Record<BalantaIntegrityStatus, string>>;
  label?: string;
};

export function BalantaDownloadButton({
  orgName,
  orgCui,
  gestiune,
  dateFrom,
  dateTo,
  currency,
  items,
  integrityLabels,
  label = "Exportă PDF",
}: Props) {
  const handleExport = () => {
    const { html } = balantaPdf({
      orgName,
      orgCui,
      gestiune,
      dateFrom,
      dateTo,
      currency,
      items,
      integrityLabels,
    });
    openReportForPdf(html);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <FileDown className="h-4 w-4" />
      {label}
    </Button>
  );
}
