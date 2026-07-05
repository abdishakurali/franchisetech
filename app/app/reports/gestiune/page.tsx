import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/app/PrintButton";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { requireBusinessModule } from "@/lib/module-guard";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementProduct,
  stockMovementUnitCost,
} from "@/lib/ro-accounting/stock-movements";
import type { GestiuneMovement } from "@/lib/ro-accounting/gestiune";

type PurchaseRow = {
  id: string;
  purchase_date: string;
  supplier: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  tax_total: number | null;
  purchase_items: Array<{
    tax_rate: number | null;
    total_cost: number | null;
  }>;
};

type TransactionRow = {
  sold_at: string;
  status: string;
  pos_transaction_items: Array<{
    vat_rate: number | null;
    gross_amount: number | null;
    line_total: number | null;
  }>;
};

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  stoc_initial: "bg-blue-100 text-blue-800",
  nir: "bg-green-100 text-green-800",
  consum: "bg-red-100 text-red-800",
  vanzare: "bg-purple-100 text-purple-800",
  stoc_final: "bg-blue-100 text-blue-800",
  ajustare: "bg-amber-100 text-amber-800",
};

export default async function GestiuneReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  if (!await hasEntitlement(orgId, "reports.gestiune")) redirect("/app/billing?reason=gestiune_requires_pro");
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;

  const labels = t.reportPages.gestiune;

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const movements: GestiuneMovement[] = [];

  const movementsBeforePeriod = await fetchStockMovements(supabase, orgId, {
    before: periodStart,
  });

  // Opening stock is a NET running balance: purchases/opening entries add
  // (positive quantity_change), consumption subtracts (negative
  // quantity_change). Using Math.abs() here would treat consumption as if
  // it were inbound stock and wildly overstate the balance -- every
  // movement type before the period must keep its real sign.
  const openingStock = { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };
  for (const m of movementsBeforePeriod) {
    const qty = stockMovementQty(m);
    const value = qty * stockMovementUnitCost(m);
    const prod = stockMovementProduct(m);
    const vatRate = Number(prod?.vat_rate ?? 21);

    if (vatRate === 21) openingStock.tva19 += value;
    else if (vatRate === 11) openingStock.tva9 += value;
    else if (vatRate === 5) openingStock.tva5 += value;
    else openingStock.tva0 += value;
    openingStock.total += value;
  }

  if (openingStock.total > 0) {
    movements.push({
      date: fromDate,
      documentType: "stoc_initial",
      description: labels.openingBalance,
      ...openingStock,
    });
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      id,
      purchase_date,
      supplier,
      invoice_number,
      total_amount,
      tax_total,
      purchase_items(tax_rate, total_cost)
    `)
    .eq("organisation_id", orgId)
    .in("status", ["posted", "received"])
    .gte("purchase_date", periodStart)
    .lte("purchase_date", periodEnd)
    .order("purchase_date");

  for (const p of (purchases ?? []) as PurchaseRow[]) {
    const nirByVat = { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };
    for (const item of p.purchase_items ?? []) {
      const value = Number(item.total_cost ?? 0);
      const vatRate = Number(item.tax_rate ?? 21);
      if (vatRate === 21) nirByVat.tva19 += value;
      else if (vatRate === 11) nirByVat.tva9 += value;
      else if (vatRate === 5) nirByVat.tva5 += value;
      else nirByVat.tva0 += value;
      nirByVat.total += value;
    }

    if (nirByVat.total > 0) {
      movements.push({
        date: p.purchase_date,
        documentType: "nir",
        documentNumber: p.invoice_number ?? undefined,
        description: p.supplier ?? labels.unknownSupplier,
        ...nirByVat,
      });
    }
  }

  const consumMovements = await fetchStockMovements(supabase, orgId, {
    movementType: "sale_used",
    from: periodStart,
    to: periodEnd,
  });

  const consumByDate = new Map<string, { tva19: number; tva9: number; tva5: number; tva0: number; total: number }>();
  for (const m of consumMovements) {
    const dateKey = m.performed_at.slice(0, 10);
    const existing = consumByDate.get(dateKey) ?? { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };

    const qty = Math.abs(stockMovementQty(m));
    const value = qty * stockMovementUnitCost(m);
    const prodConsum = stockMovementProduct(m);
    const vatRate = Number(prodConsum?.vat_rate ?? 21);

    if (vatRate === 21) existing.tva19 += value;
    else if (vatRate === 11) existing.tva9 += value;
    else if (vatRate === 5) existing.tva5 += value;
    else existing.tva0 += value;
    existing.total += value;

    consumByDate.set(dateKey, existing);
  }

  for (const [dateKey, values] of Array.from(consumByDate.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (values.total > 0) {
      movements.push({
        date: dateKey,
        documentType: "consum",
        description: labels.rawConsumption,
        ...values,
      });
    }
  }

  // Filtered on pos_transactions.sold_at (the real business date), not
  // pos_transaction_items.created_at (row-insert time). For migrated
  // historical sales, created_at is the bulk-import timestamp -- identical
  // for all ~2,147 rows -- which silently pulled in every historical
  // transaction regardless of the selected date range while still
  // displaying its true (often out-of-range) sold_at date.
  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select(`
      sold_at,
      status,
      pos_transaction_items(vat_rate, gross_amount, line_total)
    `)
    .eq("organisation_id", orgId)
    .gte("sold_at", periodStart)
    .lte("sold_at", periodEnd);

  const salesByDate = new Map<string, { tva19: number; tva9: number; tva5: number; tva0: number; total: number; count: number }>();
  for (const tx of (transactions ?? []) as TransactionRow[]) {
    if (tx.status === "voided") continue;
    const dateKey = tx.sold_at.slice(0, 10);
    const existing = salesByDate.get(dateKey) ?? { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0, count: 0 };

    for (const item of tx.pos_transaction_items ?? []) {
      const value = Number(item.gross_amount ?? item.line_total ?? 0);
      const vatRate = Number(item.vat_rate ?? 21);

      if (vatRate === 21) existing.tva19 += value;
      else if (vatRate === 11) existing.tva9 += value;
      else if (vatRate === 5) existing.tva5 += value;
      else existing.tva0 += value;
      existing.total += value;
      existing.count += 1;
    }

    salesByDate.set(dateKey, existing);
  }

  for (const [dateKey, values] of Array.from(salesByDate.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (values.total > 0) {
      movements.push({
        date: dateKey,
        documentType: "vanzare",
        description: labels.zReportItems(values.count),
        tva19: values.tva19,
        tva9: values.tva9,
        tva5: values.tva5,
        tva0: values.tva0,
        total: values.total,
      });
    }
  }

  // intrari* accumulates ONLY period NIR (goods actually received in this
  // date range) -- opening stock is a separate starting balance, not a
  // period inflow, and must not be double-counted as "Total intrari".
  const totals = movements.reduce(
    (acc, m) => {
      if (m.documentType === "nir") {
        acc.intrari19 += m.tva19;
        acc.intrari9 += m.tva9;
        acc.intrari5 += m.tva5;
        acc.intrari0 += m.tva0;
        acc.intrariTotal += m.total;
      } else if (m.documentType === "consum" || m.documentType === "vanzare") {
        acc.iesiri19 += m.tva19;
        acc.iesiri9 += m.tva9;
        acc.iesiri5 += m.tva5;
        acc.iesiri0 += m.tva0;
        acc.iesiriTotal += m.total;
      }
      return acc;
    },
    { intrari19: 0, intrari9: 0, intrari5: 0, intrari0: 0, intrariTotal: 0, iesiri19: 0, iesiri9: 0, iesiri5: 0, iesiri0: 0, iesiriTotal: 0 }
  );

  const closingStock = {
    tva19: openingStock.tva19 + totals.intrari19 - totals.iesiri19,
    tva9: openingStock.tva9 + totals.intrari9 - totals.iesiri9,
    tva5: openingStock.tva5 + totals.intrari5 - totals.iesiri5,
    tva0: openingStock.tva0 + totals.intrari0 - totals.iesiri0,
    total: openingStock.total + totals.intrariTotal - totals.iesiriTotal,
  };

  movements.sort((a, b) => {
    if (a.documentType === "stoc_initial") return -1;
    if (b.documentType === "stoc_initial") return 1;
    return a.date.localeCompare(b.date);
  });

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
            <p className="text-slate-500">{labels.period}</p>
            <p className="font-semibold text-slate-900">{fromDate} — {toDate}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">{labels.openingStock}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMoney(openingStock.total, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-green-700">{labels.totalEntries}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-green-700">{formatMoney(totals.intrariTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-red-700">{labels.totalExits}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-red-700">{formatMoney(totals.iesiriTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-blue-700">{labels.closingStock}</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-blue-700">{formatMoney(closingStock.total, currency)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {movements.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">{labels.noData}</p>
              <p className="text-xs text-slate-300 mt-2">{labels.noDataHint}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.date}</TableHead>
                  <TableHead>{labels.docType}</TableHead>
                  <TableHead>{labels.docNo}</TableHead>
                  <TableHead>{labels.description}</TableHead>
                  <TableHead className="text-right">{labels.tva19}</TableHead>
                  <TableHead className="text-right">{labels.tva9}</TableHead>
                  <TableHead className="text-right">{labels.tva5}</TableHead>
                  <TableHead className="text-right">{labels.tva0}</TableHead>
                  <TableHead className="text-right">{labels.total}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m, idx) => (
                  <TableRow key={`${m.documentType}-${idx}`} className={m.documentType === "stoc_initial" ? "bg-blue-50" : ""}>
                    <TableCell className="tabular-nums">{new Date(m.date).toLocaleDateString("ro-RO")}</TableCell>
                    <TableCell>
                      <Badge className={DOCUMENT_TYPE_COLORS[m.documentType] ?? "bg-slate-100 text-slate-800"}>
                        {labels.docTypes[m.documentType as keyof typeof labels.docTypes] ?? m.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{m.documentNumber ?? "—"}</TableCell>
                    <TableCell>{m.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva19, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva9, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva5, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(m.tva0, currency)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatMoney(m.total, currency)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-green-50 font-semibold">
                  <TableCell colSpan={4} className="text-right">{labels.totalEntries}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari19, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari9, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari5, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrari0, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.intrariTotal, currency)}</TableCell>
                </TableRow>
                <TableRow className="bg-red-50 font-semibold">
                  <TableCell colSpan={4} className="text-right">{labels.totalExits}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri19, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri9, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri5, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiri0, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totals.iesiriTotal, currency)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-100 font-bold">
                  <TableCell colSpan={4} className="text-right">{labels.closingStock}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva19, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva9, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva5, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.tva0, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingStock.total, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">{labels.stock}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.openingStock}:</span>
              <span className="font-semibold">{formatMoney(openingStock.total, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.closingStock}:</span>
              <span className="font-bold text-blue-700">{formatMoney(closingStock.total, currency)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-green-700">{labels.entriesShort}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.purchases}:</span>
              <span className="font-semibold">{formatMoney(movements.filter((m) => m.documentType === "nir").reduce((s, m) => s + m.total, 0), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.totalEntries}:</span>
              <span className="font-bold text-green-700">{formatMoney(totals.intrariTotal, currency)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-red-700">{labels.exitsShort}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.consumption}:</span>
              <span className="font-semibold">{formatMoney(movements.filter((m) => m.documentType === "consum").reduce((s, m) => s + m.total, 0), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.sales}:</span>
              <span className="font-semibold">{formatMoney(movements.filter((m) => m.documentType === "vanzare").reduce((s, m) => s + m.total, 0), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{labels.totalExits}:</span>
              <span className="font-bold text-red-700">{formatMoney(totals.iesiriTotal, currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 print:hidden space-y-2">
        <p className="text-xs text-amber-800">
          <strong>{labels.important}</strong> {labels.dataSource}
        </p>
        {closingStock.total < 0 && (
          <p className="text-xs text-amber-800">
            {labels.negativeStockWarning}
          </p>
        )}
      </div>
    </div>
  );
}
