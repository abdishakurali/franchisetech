"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppI18n } from "@/lib/app-i18n-context";

const EXPORT_KEYS = ["transactions", "items", "vat_summary", "void_log", "food_safety", "actions"] as const;

const EXPORT_COLORS: Record<(typeof EXPORT_KEYS)[number], string> = {
  transactions: "bg-blue-600 hover:bg-blue-700",
  items: "bg-blue-600 hover:bg-blue-700",
  vat_summary: "bg-green-600 hover:bg-green-700",
  void_log: "bg-red-600 hover:bg-red-700",
  food_safety: "bg-amber-600 hover:bg-amber-700",
  actions: "bg-amber-600 hover:bg-amber-700",
};

export function AuditExportButtons({ orgId, fromDate, toDate }: { orgId: string; fromDate: string; toDate: string }) {
  const { t } = useAppI18n();
  const ae = t.reportPages.auditExport;
  const [loading, setLoading] = useState<string | null>(null);

  const download = async (key: string) => {
    setLoading(key);
    try {
      const resp = await fetch(`/api/audit-export?type=${key}&from=${fromDate}&to=${toDate}&org=${orgId}`);
      if (!resp.ok) throw new Error("Export failed");
      const csv = await resp.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-${fromDate}-${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(ae.exportFailed);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{ae.downloadExports}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORT_KEYS.map((key) => {
            const exp = ae.exports[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => download(key)}
                disabled={loading === key}
                className={`rounded-lg p-4 text-left text-white transition-opacity ${EXPORT_COLORS[key]} disabled:opacity-60`}
              >
                <p className="font-semibold">{loading === key ? ae.exporting : exp.label}</p>
                <p className="mt-0.5 text-sm opacity-80">{exp.desc}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-slate-400">{ae.exportsFooter(fromDate, toDate)}</p>
      </CardContent>
    </Card>
  );
}
