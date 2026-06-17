import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { AuditExportButtons } from "@/components/app/AuditExportButtons";

export default async function AuditExportPage({ searchParams }: { searchParams?: Promise<{ from?: string; to?: string }> }) {
  const { orgId } = await getKitchenOpsContext();
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const fromDate = params?.from ?? monthStart;
  const toDate = params?.to ?? today;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Audit Export</h1>
        <p className="text-sm text-slate-500">
          Export records for accountant review, Revenue audit, or internal compliance. All data is real Revenue audit, or internal compliance. All data is real — no placeholders.mdash; no placeholders.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Date range</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">From</label>
              <input type="date" name="from" defaultValue={fromDate} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">To</label>
              <input type="date" name="to" defaultValue={toDate} max={today} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            </div>
            <button type="submit" className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50">
              Apply range
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-400">Showing: {fromDate} → {toDate}</p>
        </CardContent>
      </Card>

      <AuditExportButtons orgId={orgId} fromDate={fromDate} toDate={toDate} />

      <Card>
        <CardHeader><CardTitle>Exports included</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="flex gap-3 items-start">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 mt-0.5">transactions.csv</span>
            <span>All POS transactions with status, amounts, payment method, VAT totals. Includes voided transactions.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 mt-0.5">items.csv</span>
            <span>Line-item detail for all transactions — product name, quantity, unit price, VAT rate, net/vat/gross amounts.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 mt-0.5">vat_summary.csv</span>
            <span>VAT totals grouped by rate for the period. Use for Revenue VAT return preparation.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 mt-0.5">void_log.csv</span>
            <span>All voided and refunded transactions with reason and who performed the void.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 mt-0.5">food_safety.csv</span>
            <span>Temperature checks and food safety records for the period.</span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 mt-0.5">actions.csv</span>
            <span>Corrective actions taken in response to failed food safety checks.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
