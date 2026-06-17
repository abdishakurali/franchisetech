"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const HEADERS = ["supplier_name","purchased_at","invoice_number","product_name","quantity","unit","unit_cost"];
const TEMPLATE = [
  HEADERS.join(","),
  "Fresh Foods,2026-06-01,INV-001,Chicken,2400,g,0.012",
  "Fresh Foods,2026-06-01,INV-001,Bacon,1200,g,0.018",
  "Fresh Foods,2026-06-01,INV-001,Cos Lettuce,10,head,1.20",
  "Fresh Foods,2026-06-01,INV-001,Caesar Dressing,900,ml,0.010",
].join("\n");

function parseRows(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
  });
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function clientValidate(rows: ReturnType<typeof parseRows>) {
  return rows.flatMap((r, i) => {
    const errs: string[] = [];
    if (!r.product_name) errs.push(`Row ${i + 2}: product_name required`);
    if (!r.quantity || isNaN(Number(r.quantity)) || Number(r.quantity) <= 0)
      errs.push(`Row ${i + 2}: quantity must be > 0`);
    if (!r.unit_cost || isNaN(Number(r.unit_cost)) || Number(r.unit_cost) < 0)
      errs.push(`Row ${i + 2}: unit_cost must be ≥ 0`);
    return errs;
  });
}

type ImportResult = {
  ok?: boolean;
  error?: string;
  purchases_created?: number;
  items_imported?: number;
  suppliers_created?: number;
  products_created?: number;
  errors?: string[];
  skipped?: number;
  imported?: number;
};

function PurchasesImportContent() {
  const searchParams = useSearchParams();
  const [csv, setCsv] = useState(TEMPLATE);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const rows = useMemo(() => parseRows(csv), [csv]);
  const clientErrors = useMemo(() => clientValidate(rows), [rows]);

  // Handle file upload — replace textarea content
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) setCsv(text.trim());
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.set("csv_text", csv);

      const res = await fetch("/api/import/purchases", {
        method: "POST",
        body: fd,
      });

      const data: ImportResult = await res.json().catch(() => ({ error: "Invalid server response" }));
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  const totalCost = rows.reduce(
    (s, r) => s + (Number(r.quantity) || 0) * (Number(r.unit_cost) || 0),
    0
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/app/purchases" className="text-sm text-slate-500 hover:text-slate-700">← Back to purchases</Link>
          <h1 className="text-2xl font-semibold text-slate-950 mt-1">Import purchases</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Use this to add stock purchases. Purchases increase stock.
          </p>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={() => downloadCsv(TEMPLATE, "franchisetech-purchases-template.csv")}
        >
          <Download className="h-4 w-4 mr-2" />Download template
        </Button>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-xl border p-4 ${result.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          {result.ok ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="font-semibold text-green-800">Import complete!</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[
                  { label: "Items imported",   value: result.items_imported ?? 0,   color: "text-green-700" },
                  { label: "Purchases created", value: result.purchases_created ?? 0, color: "text-green-700" },
                  { label: "Suppliers created", value: result.suppliers_created ?? 0, color: "text-blue-700" },
                  { label: "Products created",  value: result.products_created ?? 0,  color: "text-blue-700" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-white border border-green-200 p-3 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              {(result.errors?.length ?? 0) > 0 && (
                <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p className="font-medium mb-1">Warnings ({result.errors!.length})</p>
                  {result.errors!.slice(0, 5).map((e, i) => <p key={i} className="text-xs">• {e}</p>)}
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <Link href="/app/purchases" className="text-sm text-blue-600 hover:underline">View purchases →</Link>
                <Link href="/app/stock" className="text-sm text-blue-600 hover:underline">View stock →</Link>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">{result.error ?? "Import failed"}</p>
                {result.errors?.map((e, i) => <p key={i} className="text-xs text-red-600 mt-0.5">• {e}</p>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Upload a CSV file:</p>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Or paste CSV directly:</p>
              <textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                className="min-h-48 w-full rounded-md border border-slate-200 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>

            {clientErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium mb-1">Fix these before importing:</p>
                {clientErrors.slice(0, 5).map((e, i) => <p key={i} className="text-xs">• {e}</p>)}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !rows.length || clientErrors.length > 0}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing…</>
              ) : (
                `Import ${rows.length} row${rows.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview ({rows.length} rows)</CardTitle>
              {totalCost > 0 && (
                <span className="text-sm font-semibold text-slate-700">
                  Total: €{totalCost.toFixed(2)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-slate-400">
                    <th className="py-2 pr-4">Supplier</th>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Unit cost</th>
                    <th className="py-2">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 15).map((r, i) => {
                    const lineTotal = (Number(r.quantity) || 0) * (Number(r.unit_cost) || 0);
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="py-2 pr-4 text-slate-500">{r.supplier_name || "—"}</td>
                        <td className="py-2 pr-4 font-medium">{r.product_name}</td>
                        <td className="py-2 pr-4 tabular-nums">{r.quantity} {r.unit}</td>
                        <td className="py-2 pr-4 tabular-nums">€{r.unit_cost}</td>
                        <td className="py-2 tabular-nums text-slate-600">€{lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {rows.length > 15 && (
                    <tr>
                      <td colSpan={5} className="py-2 text-xs text-slate-400 text-center">
                        + {rows.length - 15} more rows not shown
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">What happens when you import</p>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• Suppliers are created automatically if they don&apos;t exist</li>
          <li>• Products are created as ingredients if they don&apos;t exist yet</li>
          <li>• Stock levels are increased by the quantity purchased</li>
          <li>• Product cost price is updated to the unit_cost value</li>
          <li>• Every row is recorded as a stock movement for audit trail</li>
          <li>• Rows with the same supplier + date + invoice are grouped into one purchase</li>
        </ul>
      </div>
    </div>
  );
}

export default function PurchasesImportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading…</div>}>
      <PurchasesImportContent />
    </Suspense>
  );
}
