import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// removed bad import
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/app/PrintButton";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";

export default async function VatReportPage({ searchParams }: { searchParams?: Promise<{from?:string;to?:string}> }) {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const params = await searchParams;
  const today = new Date().toISOString().slice(0,10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  const from = params?.from ?? monthStart;
  const to = params?.to ?? today;

  const { data: items } = await supabase
    .from("pos_transaction_items")
    .select("vat_rate,net_amount,vat_amount,gross_amount,line_total,transaction_id")
    .eq("organisation_id", orgId)
    .gte("created_at", `${from}T00:00:00Z`)
    .lte("created_at", `${to}T23:59:59Z`);

  const byRate = new Map<number, { net: number; vat: number; gross: number; count: number }>();
  for (const item of (items ?? [])) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = byRate.get(rate) ?? { net: 0, vat: 0, gross: 0, count: 0 };
    entry.net += net; entry.vat += vat; entry.gross += gross; entry.count++;
    byRate.set(rate, entry);
  }
  const totNet = Array.from(byRate.values()).reduce((s,v) => s + v.net, 0);
  const totVat = Array.from(byRate.values()).reduce((s,v) => s + v.vat, 0);
  const totGross = Array.from(byRate.values()).reduce((s,v) => s + v.gross, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">VAT Report</h1>
          <p className="text-sm text-slate-500">VAT collected by rate for Revenue return preparation.</p>
        </div>
        <div className="flex gap-3">
          <form className="flex gap-2 items-end">
            <div><label className="text-xs text-slate-500 block">From</label><input type="date" name="from" defaultValue={from} className="h-9 rounded-md border px-3 text-sm" /></div>
            <div><label className="text-xs text-slate-500 block">To</label><input type="date" name="to" defaultValue={to} className="h-9 rounded-md border px-3 text-sm" /></div>
            <button type="submit" className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50">Apply</button>
          </form>
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Net sales</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(totNet, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">VAT collected</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-blue-600">{formatMoney(totVat, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Gross sales</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-green-600">{formatMoney(totGross, currency)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>VAT breakdown by rate</CardTitle><p className="text-xs text-slate-500">{from} → {to}</p></CardHeader>
        <CardContent>
          {byRate.size === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No VAT data for this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-slate-500"><th className="text-left py-2">Rate</th><th className="text-right py-2">Net</th><th className="text-right py-2">VAT</th><th className="text-right py-2">Gross</th><th className="text-right py-2">Transactions</th></tr></thead>
              <tbody>
                {Array.from(byRate.entries()).sort(([a],[b])=>a-b).map(([rate, v]) => (
                  <tr key={rate} className="border-b last:border-0">
                    <td className="py-2"><Badge variant="outline">{rate}%</Badge></td>
                    <td className="text-right py-2">{formatMoney(v.net, currency)}</td>
                    <td className="text-right py-2 font-medium">{formatMoney(v.vat, currency)}</td>
                    <td className="text-right py-2">{formatMoney(v.gross, currency)}</td>
                    <td className="text-right py-2 text-slate-500">{v.count}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t-2">
                  <td className="py-2">Total</td>
                  <td className="text-right py-2">{formatMoney(totNet, currency)}</td>
                  <td className="text-right py-2">{formatMoney(totVat, currency)}</td>
                  <td className="text-right py-2">{formatMoney(totGross, currency)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
