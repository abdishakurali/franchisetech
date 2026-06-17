"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { importSuppliersCsv } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

const HEADERS = ["name", "contact_name", "phone", "email", "address", "notes"];
const TEMPLATE = [
  HEADERS.join(","),
  "Fresh Foods,Jane Murphy,+353 1 000 0000,orders@example.ie,Dublin,Weekly delivery",
].join("\n");

function parseRows(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
  });
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SuppliersImportContent() {
  const searchParams = useSearchParams();
  const [csv, setCsv] = useState(TEMPLATE);
  const rows = useMemo(() => parseRows(csv), [csv]);
  const errors = rows.flatMap((r, i) => !r.name ? [`Row ${i + 1}: name is required`] : []);
  const imported = searchParams.get("imported");
  const summary = imported ? `✓ ${imported} imported, ${searchParams.get("skipped") ?? "0"} skipped` : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/app/suppliers" className="text-sm text-slate-500 hover:text-slate-700">← Back to suppliers</Link>
          <h1 className="text-2xl font-semibold text-slate-950 mt-1">Import suppliers</h1>
        </div>
        <Button variant="outline" type="button" onClick={() => downloadCsv(TEMPLATE, "franchisetech-suppliers-template.csv")}>
          <Download className="h-4 w-4 mr-2" />Download template
        </Button>
      </div>
      {summary && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{summary}</div>}
      <Card>
        <CardHeader><CardTitle>Upload or paste CSV</CardTitle></CardHeader>
        <CardContent>
          <form action={importSuppliersCsv as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <Input name="csv_file" type="file" accept=".csv,text/csv" />
            <p className="text-xs text-slate-400">Or paste CSV below:</p>
            <textarea name="csv_text" value={csv} onChange={(e) => setCsv(e.target.value)} className="min-h-44 w-full rounded-md border border-slate-200 p-3 font-mono text-xs" />
            {errors.length > 0 && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.slice(0, 5).join(" · ")}</div>}
            <Button type="submit" disabled={!rows.length || errors.length > 0}>Import {rows.length} row{rows.length !== 1 ? "s" : ""}</Button>
          </form>
        </CardContent>
      </Card>
      {rows.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Preview ({rows.length} rows)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead><tr className="border-b text-left text-xs text-slate-400"><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Contact</th><th className="py-2 pr-3">Phone</th><th className="py-2">Email</th></tr></thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{r.name}</td>
                      <td className="py-2 pr-3 text-slate-500">{r.contact_name}</td>
                      <td className="py-2 pr-3">{r.phone}</td>
                      <td className="py-2">{r.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SuppliersImportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading…</div>}>
      <SuppliersImportContent />
    </Suspense>
  );
}
