import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PrintButton } from "@/components/app/PrintButton";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { requireBusinessModule } from "@/lib/module-guard";
import { BonConsumDownloadButton } from "./BonConsumDownloadButton";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementProduct,
  stockMovementUnitCost,
  stockMovementUnit,
} from "@/lib/ro-accounting/stock-movements";

export default async function ConsumReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency, user } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;
  const dayStart = `${fromDate}T00:00:00.000Z`;
  const dayEnd = `${toDate}T23:59:59.999Z`;

  const labels = t.reportPages.consum;

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const movements = await fetchStockMovements(supabase, orgId, {
    movementType: "sale_used",
    from: dayStart,
    to: dayEnd,
  });

  const aggregated = new Map<string, { name: string; unit: string; quantity: number; unitCost: number; totalCost: number }>();

  for (const m of movements) {
    const prod = stockMovementProduct(m);
    const productName = prod?.name ?? t.common.unknown;
    const unit = stockMovementUnit(m);
    const qty = Math.abs(stockMovementQty(m));
    const unitCost = stockMovementUnitCost(m);

    const existing = aggregated.get(productName);
    if (existing) {
      existing.quantity += qty;
      existing.totalCost += qty * unitCost;
      if (unitCost > 0) existing.unitCost = unitCost;
    } else {
      aggregated.set(productName, {
        name: productName,
        unit,
        quantity: qty,
        unitCost,
        totalCost: qty * unitCost,
      });
    }
  }

  const items = Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
  const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0);
  const documentNumber = `BC-${fromDate.replace(/-/g, "")}`;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.title}</h1>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center">
          <form className="flex gap-2 items-center">
            <label className="text-sm text-slate-600">{labels.from}</label>
            <input type="date" name="from" defaultValue={fromDate} max={today} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <label className="text-sm text-slate-600">{labels.to}</label>
            <input type="date" name="to" defaultValue={toDate} max={today} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50">
              {labels.load}
            </button>
          </form>
          {items.length > 0 && (
            <BonConsumDownloadButton
              orgName={org?.name ?? "franchisetech"}
              orgCui={org?.fiscalnet_cif ?? undefined}
              documentNumber={documentNumber}
              date={fromDate}
              items={items.map((item) => ({
                productName: item.name,
                unit: item.unit,
                quantity: item.quantity,
                unitCost: item.unitCost,
                totalCost: item.totalCost,
              }))}
              userName={profile?.full_name ?? user.email ?? t.common.unknown}
              label={labels.download}
            />
          )}
          <PrintButton />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 print:border-0">
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-slate-500">{labels.unitLabel}</p>
            <p className="font-semibold text-slate-900">{org?.name ?? "franchisetech"}</p>
          </div>
          <div>
            <p className="text-slate-500">{labels.docNo}</p>
            <p className="font-semibold text-slate-900">{documentNumber}</p>
          </div>
          <div>
            <p className="text-slate-500">{labels.period}</p>
            <p className="font-semibold text-slate-900">{fromDate} — {toDate}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{labels.totalItems}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{items.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{labels.totalValue}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-blue-600">
            {formatMoney(totalValue, currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">{labels.noData}</p>
              <p className="text-xs text-slate-300 mt-2">{labels.noDataHint}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">{labels.rowNo}</TableHead>
                  <TableHead>{labels.product}</TableHead>
                  <TableHead>{labels.unit}</TableHead>
                  <TableHead className="text-right">{labels.quantity}</TableHead>
                  <TableHead className="text-right">{labels.unitCost}</TableHead>
                  <TableHead className="text-right">{labels.totalCost}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.name}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(item.unitCost, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatMoney(item.totalCost, currency)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={5} className="text-right">{labels.total}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totalValue, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="print:block">
        <CardHeader>
          <CardTitle>{labels.signatures}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8 mt-4 text-sm">
            <div>
              <p className="text-slate-500 mb-8">{labels.stockIssuer}</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-slate-400 mt-2">{labels.signature}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-8">{labels.stockReceiver}</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-slate-400 mt-2">{labels.signature}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 print:hidden">
        <p className="text-xs text-slate-500">
          <strong>{labels.dataSourceLabel}</strong> {labels.dataSource}
        </p>
      </div>
    </div>
  );
}
