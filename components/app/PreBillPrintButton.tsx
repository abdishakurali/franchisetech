"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getPreBillData, requestBill } from "@/app/actions/table-service";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  tabId: string;
  currency: string;
  disabled?: boolean;
  /** When false, skip requestBill (e.g. nota already requested). */
  requestBillFirst?: boolean;
  /** Compact row button for POS checkout area */
  compact?: boolean;
  className?: string;
};

function money(v: number, currency: string) {
  if (currency === "RON") return `${v.toFixed(2)} lei`;
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency: currency || "EUR" }).format(v);
}

export function PreBillPrintButton({
  tabId,
  currency,
  disabled,
  requestBillFirst = true,
  compact = false,
  className,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function printPreBill() {
    setError(null);
    startTransition(async () => {
      if (requestBillFirst) {
        await requestBill(tabId);
      }
      const data = await getPreBillData(tabId);
      if (!data) {
        setError("Nu s-au putut încărca datele pentru notă.");
        return;
      }

      const tipRows = data.tipOptions
        .map((t) => `<tr><td>Bacșiș ${t.pct}%</td><td style="text-align:right">${money(t.amount, currency)}</td></tr>`)
        .join("");

      const lineRows = data.lines.length
        ? data.lines.map((l) =>
            `<tr><td>${l.quantity}× ${l.name}</td><td style="text-align:right">${money(l.lineTotal, currency)}</td></tr>`
          ).join("")
        : `<tr><td colspan="2"><em>Fără articole încasate încă — notă informativă</em></td></tr>`;

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Notă de plată — ${data.tableName}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:320px;margin:24px auto;font-size:14px;color:#111}
h1{font-size:18px;margin:0 0 4px} .muted{color:#666;font-size:12px}
table{width:100%;border-collapse:collapse;margin:12px 0} td{padding:4px 0;border-bottom:1px solid #eee}
.total{font-weight:700;font-size:16px;border-top:2px solid #111}
.tips{margin-top:16px;font-size:12px}
@media print{body{margin:0}}
</style></head><body>
<h1>NOTĂ DE PLATĂ</h1>
<p class="muted">${data.tableName}${data.coverCount ? ` · ${data.coverCount} pers.` : ""}</p>
<p class="muted">${new Date(data.openedAt).toLocaleString("ro-RO")}</p>
<table>${lineRows}</table>
<table>
<tr class="total"><td>Total de plată</td><td style="text-align:right">${money(data.subtotal, currency)}</td></tr>
</table>
<div class="tips"><strong>Bacșiș (opțional):</strong><table>${tipRows}</table></div>
<p class="muted" style="margin-top:20px">Document nefiscal — solicită bonul fiscal la încasare.</p>
<script>window.onload=function(){window.print();}</script>
</body></html>`;

      const w = window.open("", "_blank", "width=400,height=600");
      if (!w) {
        setError("Permite ferestrele pop-up pentru tipărire.");
        return;
      }
      w.document.write(html);
      w.document.close();
    });
  }

  if (compact) {
    return (
      <div className={cn("min-w-0", className)}>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl border-slate-300 text-sm font-semibold gap-1.5 sm:h-14"
          disabled={disabled || pending}
          onClick={printPreBill}
        >
          <Printer className="h-4 w-4 shrink-0" />
          <span className="truncate">Notă de plată</span>
        </Button>
        {error && <p className="text-xs text-red-600 mt-1 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        disabled={disabled || pending}
        onClick={printPreBill}
      >
        <Printer className="h-4 w-4" />
        Tipărește notă de plată
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
