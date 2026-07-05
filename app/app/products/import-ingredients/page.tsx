"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { importProductsCsv } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

// Simplified ingredients template — name, unit, cost, stock, reorder_level
const HEADERS = ["name","unit","cost_price","current_stock_qty","reorder_level"];
const TEMPLATE = [
  HEADERS.join(","),
  "Pui,g,0.012,2400,500",
  "Bacon,g,0.018,1200,200",
  "Salată,cap,1.20,10,2",
  "Sos Caesar,ml,0.010,900,200",
  "Parmezan,g,0.025,600,100",
].join("\n");

// Maps simplified headers to the full product CSV expected by importProductsCsv
function mapToProductCsv(rows: Record<string, string>[]) {
  const fullHeaders = ["name","category","sku","barcode","unit","sale_price_gross","cost_price","vat_rate","available_in_pos","is_ingredient","is_stock_tracked","current_stock_qty","reorder_level","image_url"];
  const mapped = rows.map(r => [
    r.name ?? "",
    "Ingredients",  // default category
    "",             // sku
    "",             // barcode
    r.unit ?? "each",
    "0",            // sale_price_gross (ingredients don't have sale price)
    r.cost_price ?? "0",
    "0",            // vat_rate
    "false",        // available_in_pos
    "true",         // is_ingredient
    "true",         // is_stock_tracked
    r.current_stock_qty ?? "0",
    r.reorder_level ?? "0",
    "",             // image_url
  ].join(","));
  return [fullHeaders.join(","), ...mapped].join("\n");
}

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
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function IngredientsImportContent() {
  const searchParams = useSearchParams();
  const [csv, setCsv] = useState(TEMPLATE);
  const rows = useMemo(() => parseRows(csv), [csv]);
  const errors = rows.flatMap((r, i) =>
    !r.name ? [`Rândul ${i + 1}: numele este obligatoriu`] :
    r.cost_price && isNaN(Number(r.cost_price)) ? [`Rândul ${i + 1}: cost_price trebuie să fie un număr`] : []
  );
  const imported = searchParams.get("imported");
  const summary = imported ? `✓ ${imported} importate, ${searchParams.get("skipped") ?? "0"} omise` : null;

  // When submitting, transform to full product CSV format
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fullCsv = mapToProductCsv(rows);
    const fd = new FormData();
    fd.set("csv_text", fullCsv);
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "csv_text"; input.value = fullCsv;
    form.appendChild(input);
    const hiddenForm = document.querySelector("#ingredients-hidden-form") as HTMLFormElement | null;
    if (hiddenForm) {
      const csvInput = hiddenForm.querySelector("textarea[name='csv_text']") as HTMLTextAreaElement | null;
      if (csvInput) { csvInput.value = fullCsv; hiddenForm.requestSubmit(); }
    }
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/app/products" className="text-sm text-slate-500 hover:text-slate-700">← Înapoi la produse</Link>
          <h1 className="text-2xl font-semibold text-slate-950 mt-1">Importă ingrediente</h1>
          <p className="text-sm text-slate-500 mt-0.5">Folosește asta pentru a adăuga articole de stoc pe care le cumperi și le folosești în rețete.</p>
        </div>
        <Button variant="outline" type="button" onClick={() => downloadCsv(TEMPLATE, "franchisetech-ingredients-template.csv")}>
          <Download className="h-4 w-4 mr-2" />Descarcă șablon
        </Button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Sfat cost ingrediente</p>
        <p>Setează cost_price la costul <strong>per unitate</strong>. Exemple:</p>
        <p className="mt-1 font-mono text-xs bg-blue-100 rounded p-2">
          Pui, g, 0,012, 2400, 500 → 0,012€ per gram, 2400g în stoc, reaprovizionare la 500g<br/>
          Salată, cap, 1,20, 10, 2 → 1,20€ per cap, 10 capete în stoc
        </p>
      </div>

      {summary && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{summary}</div>}

      <Card>
        <CardHeader><CardTitle>Încarcă CSV</CardTitle></CardHeader>
        <CardContent>
          {/* Hidden form that uses the full product import action */}
          <form
            id="ingredients-hidden-form"
            action={importProductsCsv as unknown as (fd: FormData) => Promise<void>}
            className="space-y-4"
          >
            <Input name="csv_file" type="file" accept=".csv,text/csv" className="hidden" />
            <p className="text-xs text-slate-400 font-medium">Lipește lista de ingrediente mai jos (name, unit, cost_price, stock_qty, reorder_level):</p>
            <textarea
              name="csv_text"
              value={mapToProductCsv(rows)}
              readOnly
              className="hidden"
            />
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              className="min-h-44 w-full rounded-md border border-slate-200 p-3 font-mono text-xs"
              placeholder={TEMPLATE}
            />
            {errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errors.slice(0, 5).join(" · ")}
              </div>
            )}
            {/* Submit button triggers the hidden form with mapped CSV */}
            <Button
              type="submit"
              disabled={!rows.length || errors.length > 0}
              onClick={(e) => {
                e.preventDefault();
                const form = document.getElementById("ingredients-hidden-form") as HTMLFormElement;
                const ta = form.querySelector("textarea[name='csv_text']") as HTMLTextAreaElement;
                if (ta) { ta.value = mapToProductCsv(rows); form.requestSubmit(); }
              }}
            >
              Importă {rows.length} {rows.length === 1 ? "ingredient" : "ingrediente"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Previzualizare ({rows.length} rânduri)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-slate-400">
                    <th className="py-2 pr-4">Nume</th>
                    <th className="py-2 pr-4">Unitate</th>
                    <th className="py-2 pr-4">Cost/unitate</th>
                    <th className="py-2 pr-4">Stoc</th>
                    <th className="py-2">Reaprovizionare la</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 12).map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 pr-4 text-slate-500">{r.unit}</td>
                      <td className="py-2 pr-4">€{r.cost_price}</td>
                      <td className="py-2 pr-4">{r.current_stock_qty || "0"}</td>
                      <td className="py-2 text-slate-500">{r.reorder_level || "—"}</td>
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

export default function IngredientsImportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Se încarcă…</div>}>
      <IngredientsImportContent />
    </Suspense>
  );
}
