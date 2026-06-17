"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExportConfig = {
  key: string;
  label: string;
  description: string;
  color: string;
};

const EXPORTS: ExportConfig[] = [
  { key: "transactions", label: "Transactions", description: "All POS transactions", color: "bg-blue-600 hover:bg-blue-700" },
  { key: "items", label: "Line Items", description: "Item-level detail with VAT", color: "bg-blue-600 hover:bg-blue-700" },
  { key: "vat_summary", label: "VAT Summary", description: "VAT by rate for Revenue", color: "bg-green-600 hover:bg-green-700" },
  { key: "void_log", label: "Void Log", description: "Voided & refunded transactions", color: "bg-red-600 hover:bg-red-700" },
  { key: "food_safety", label: "Food Safety Checks", description: "Temperature & safety records", color: "bg-amber-600 hover:bg-amber-700" },
  { key: "actions", label: "Corrective Actions", description: "Actions after failed checks", color: "bg-amber-600 hover:bg-amber-700" },
];

export function AuditExportButtons({ orgId, fromDate, toDate }: { orgId: string; fromDate: string; toDate: string }) {
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
    } catch (e) {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Download exports</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORTS.map((exp) => (
            <button
              key={exp.key}
              onClick={() => download(exp.key)}
              disabled={loading === exp.key}
              className={`rounded-lg p-4 text-left text-white transition-opacity ${exp.color} disabled:opacity-60`}
            >
              <p className="font-semibold">{loading === exp.key ? "Exporting…" : exp.label}</p>
              <p className="mt-0.5 text-sm opacity-80">{exp.description}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          All exports include data from {fromDate} to {toDate} for your organisation only.
        </p>
      </CardContent>
    </Card>
  );
}
