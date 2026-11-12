"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { importProductsCsv } from "@/app/actions/kitchenops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useAppI18n } from "@/lib/app-i18n-context";
import { recipeCurrencyLabel } from "@/lib/recipe-costing";
import { parseCsvRecords } from "@/lib/format/csv";
import { parseLocaleNumber } from "@/lib/format/ro-number";

const HEADERS = ["name","category","sku","barcode","unit","sale_price_gross","cost_price","vat_rate","available_in_pos","is_ingredient","is_stock_tracked","current_stock_qty","reorder_level","image_url"];
const TEMPLATE = [
  HEADERS.join(","),
  "Americano,Drinks,COF-AME,,each,3.50,0.65,13.5,true,false,false,0,0,",
].join("\n");

function parseRows(text: string) {
  // Auto-detects ";" (Romanian Excel) vs "," from the header line.
  return parseCsvRecords(text);
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

function ProductsImportContent({ currency }: { currency: string }) {
  const { t: appT } = useAppI18n();
  const t = appT.productsImport;
  const searchParams = useSearchParams();
  const [csv, setCsv] = useState(TEMPLATE);
  const rows = useMemo(() => parseRows(csv), [csv]);
  const errors = rows.flatMap((r, i) =>
    !r.name ? [t.rowNameRequired(i + 1)] :
    parseLocaleNumber(r.sale_price_gross || "0") === null ? [t.rowPriceNumber(i + 1)] : []
  );
  const imported = searchParams.get("imported");
  const skipped = searchParams.get("skipped") ?? "0";
  const summary = imported ? t.importedSummary(imported, skipped) : null;
  const noneImported = imported === "0";
  const serverEmpty = searchParams.get("empty") === "1";
  const pastedButEmpty = csv.trim().length > 0 && rows.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/app/products" className="text-sm text-muted-foreground hover:text-foreground">{t.backToProducts}</Link>
          <h1 className="text-2xl font-semibold text-foreground mt-1">{t.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={() => downloadCsv(TEMPLATE, "franchisetech-products-template.csv")}
        >
          <Download className="h-4 w-4 mr-2" />{t.downloadTemplate}
        </Button>
      </div>

      {summary && !noneImported && (
        <div className="rounded-lg border border-reconciled/25 bg-reconciled/10 p-3 text-sm text-reconciled">{summary}</div>
      )}
      {(serverEmpty || noneImported) && (
        <div className="rounded-lg border border-attention/25 bg-attention/10 p-3 text-sm text-attention">
          {noneImported && summary ? `${summary}. ${t.noneImportedHint}` : t.noRowsRead}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>{t.uploadCsv}</CardTitle></CardHeader>
        <CardContent>
          <form action={importProductsCsv as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <Input name="csv_file" type="file" accept=".csv,text/csv" />
            <p className="text-xs text-muted-foreground">{t.orPasteCsvBelow}</p>
            <textarea
              name="csv_text"
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              className="min-h-44 w-full rounded-md border border-border p-3 font-mono text-xs"
            />
            {pastedButEmpty && (
              <div className="rounded-lg border border-attention/25 bg-attention/10 p-3 text-sm text-attention">{t.noRowsRead}</div>
            )}
            {errors.length > 0 && (
              <div className="rounded-lg border border-attention/25 bg-attention/10 p-3 text-sm text-attention">
                {errors.slice(0, 5).join(" · ")}
              </div>
            )}
            <Button type="submit" disabled={!rows.length || errors.length > 0}>
              {t.importRows(rows.length)}
            </Button>
          </form>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t.preview(rows.length)}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3">{t.name}</th>
                    <th className="py-2 pr-3">{t.category}</th>
                    <th className="py-2 pr-3">{t.price(recipeCurrencyLabel(currency))}</th>
                    <th className="py-2">{t.pos}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{r.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{r.category}</td>
                      <td className="py-2 pr-3">{r.sale_price_gross}</td>
                      <td className="py-2">{r.available_in_pos}</td>
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

function ImportLoading() {
  const { t } = useAppI18n();
  return <div className="p-6 text-sm text-muted-foreground">{t.productsImport.loading}</div>;
}

export function ProductsImportClient({ currency = "EUR" }: { currency?: string }) {
  return (
    <Suspense fallback={<ImportLoading />}>
      <ProductsImportContent currency={currency} />
    </Suspense>
  );
}
