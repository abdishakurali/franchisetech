"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function TemplateDownloadButton({
  content,
  filename,
  label = "Descarcă",
}: {
  content: string;
  filename: string;
  label?: string;
}) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="shrink-0 gap-1.5 h-8 text-xs">
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
