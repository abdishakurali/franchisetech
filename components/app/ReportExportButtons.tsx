"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv } from "@/lib/export";

export function ReportExportButtons({ filename, rows }: { filename: string; rows: Array<Record<string, unknown>> }) {
  const exportExcel = () => {
    const blob = new Blob([`<pre>${toCsv(rows)}</pre>`], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button onClick={() => window.print()} variant="outline" className="gap-2"><Printer className="h-4 w-4" />Print</Button>
      <Button onClick={() => downloadCsv(`${filename}.csv`, rows)} variant="outline" className="gap-2"><Download className="h-4 w-4" />Export CSV</Button>
      <Button onClick={exportExcel} variant="outline" className="gap-2"><Download className="h-4 w-4" />Export Excel</Button>
      <Button onClick={() => window.print()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Printer className="h-4 w-4" />Export PDF</Button>
    </div>
  );
}
