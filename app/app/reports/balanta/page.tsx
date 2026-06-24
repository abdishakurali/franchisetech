import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { requireBusinessModule } from "@/lib/module-guard";
import { assertEntitlement } from "@/lib/billing/entitlement-resolver";
import { BalantaDownloadButton } from "./BalantaDownloadButton";
import type { BalantaItem, BalantaIntegrityStatus } from "@/lib/ro-accounting/balanta";
import {
  resolveBalantaIntegrity,
  sumMovementQty,
  type BalantaProductMeta,
} from "@/lib/ro-accounting/balanta-integrity";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementUnitCost,
} from "@/lib/ro-accounting/stock-movements";

type ProductRow = BalantaProductMeta & {
  vat_rate: number | null;
};

function integrityBadgeClass(status: BalantaIntegrityStatus): string {
  switch (status) {
    case "archived":
      return "bg-slate-100 text-slate-600";
    case "missing":
      return "bg-red-50 text-red-700";
    case "not_tracked":
      return "bg-amber-50 text-amber-800";
    case "qty_mismatch":
      return "bg-orange-50 text-orange-800";
    default:
      return "";
  }
}

export default async function BalantaReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { countryCode, profileLocale, supabase, orgId, currency, membership } =
    await getKitchenOpsContext();
  await assertEntitlement(orgId, "reports.accountant_pack", { write: false });
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;
  const canManage = ["owner", "manager"].includes(membership.role ?? "");

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;

  const labels = t.reportPages.balanta;
  const integrityLabels: Partial<Record<BalantaIntegrityStatus, string>> = {
    archived: labels.integrityArchived,
    missing: labels.integrityMissing,
    not_tracked: labels.integrityNotTracked,
    qty_mismatch: labels.integrityQtyMismatch,
  };

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("id,name,unit_of_measure,current_stock_qty,vat_rate,active,is_stock_tracked,is_ingredient")
    .eq("organisation_id", orgId);

  const [movementsDuringPeriod, movementsBeforePeriod, allMovements] = await Promise.all([
    fetchStockMovements(supabase, orgId, { from: periodStart, to: periodEnd }),
    fetchStockMovements(supabase, orgId, { before: periodStart }),
    fetchStockMovements(supabase, orgId, {}),
  ]);

  const productMap = new Map<string, ProductRow>();
  for (const p of (products ?? []) as ProductRow[]) {
    productMap.set(p.id, p);
  }

  const calcOpeningStock = new Map<string, { qty: number; value: number }>();
  for (const m of movementsBeforePeriod) {
    if (!m.product_id) continue;
    const existing = calcOpeningStock.get(m.product_id) ?? { qty: 0, value: 0 };
    const qty = stockMovementQty(m);
    const cost = stockMovementUnitCost(m);
    existing.qty += qty;
    existing.value += Math.abs(qty) * cost;
    calcOpeningStock.set(m.product_id, existing);
  }

  const periodEntries = new Map<string, { qty: number; value: number }>();
  const periodExits = new Map<string, { qty: number; value: number }>();

  for (const m of movementsDuringPeriod) {
    if (!m.product_id) continue;
    const qty = stockMovementQty(m);
    const cost = stockMovementUnitCost(m);

    const isEntry =
      m.movement_type === "purchase_received" ||
      m.movement_type === "return" ||
      m.movement_type === "opening" ||
      (m.movement_type === "manual_adjustment" && qty > 0);
    const isExit =
      m.movement_type === "sale_used" ||
      m.movement_type === "wastage" ||
      (m.movement_type === "manual_adjustment" && qty < 0);

    if (isEntry) {
      const existing = periodEntries.get(m.product_id) ?? { qty: 0, value: 0 };
      existing.qty += Math.abs(qty);
      existing.value += Math.abs(qty) * cost;
      periodEntries.set(m.product_id, existing);
    }

    if (isExit) {
      const existing = periodExits.get(m.product_id) ?? { qty: 0, value: 0 };
      existing.qty += Math.abs(qty);
      existing.value += Math.abs(qty) * cost;
      periodExits.set(m.product_id, existing);
    }
  }

  const allProductIds = new Set<string>([
    ...calcOpeningStock.keys(),
    ...periodEntries.keys(),
    ...periodExits.keys(),
  ]);

  const items: BalantaItem[] = Array.from(allProductIds)
    .map((productId) => {
      const product = productMap.get(productId);
      const opening = calcOpeningStock.get(productId) ?? { qty: 0, value: 0 };
      const entries = periodEntries.get(productId) ?? { qty: 0, value: 0 };
      const exits = periodExits.get(productId) ?? { qty: 0, value: 0 };

      const closingQty = opening.qty + entries.qty - exits.qty;
      const avgCost =
        opening.value + entries.value > 0
          ? (opening.value + entries.value) / (opening.qty + entries.qty || 1)
          : 0;
      const closingValue = closingQty * avgCost;

      const ledgerQty = sumMovementQty(allMovements, productId);
      const catalogQty = Number(product?.current_stock_qty ?? 0);
      const integrityStatus = resolveBalantaIntegrity(product, { ledgerQty, catalogQty });

      return {
        productId,
        productName: product?.name ?? t.common.unknown,
        unit: product?.unit_of_measure ?? "buc",
        openingQty: opening.qty,
        openingValue: opening.value,
        entryQty: entries.qty,
        entryValue: entries.value,
        exitQty: exits.qty,
        exitValue: exits.value,
        closingQty,
        closingValue: closingValue > 0 ? closingValue : 0,
        integrityStatus,
        catalogQty: product ? catalogQty : undefined,
        ledgerQty,
      };
    })
    .filter((item) => item.openingQty !== 0 || item.entryQty !== 0 || item.exitQty !== 0)
    .sort((a, b) => a.productName.localeCompare(b.productName));

  const integrityIssues = items.filter((i) => i.integrityStatus && i.integrityStatus !== "ok");
  const hasArchived = integrityIssues.some((i) => i.integrityStatus === "archived");

  const reconcileRows = canManage
    ? (products ?? [])
        .filter((p) => p.is_stock_tracked || p.is_ingredient)
        .map((p) => {
          const ledgerQty = sumMovementQty(allMovements, p.id);
          const catalogQty = Number(p.current_stock_qty ?? 0);
          return {
            id: p.id,
            name: p.name ?? t.common.unknown,
            unit: p.unit_of_measure ?? "buc",
            catalogQty,
            ledgerQty,
            delta: catalogQty - ledgerQty,
          };
        })
        .filter((r) => Math.abs(r.delta) > 0.001)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    : [];

  const totals = items.reduce(
    (acc, item) => ({
      openingValue: acc.openingValue + item.openingValue,
      entryValue: acc.entryValue + item.entryValue,
      exitValue: acc.exitValue + item.exitValue,
      closingValue: acc.closingValue + item.closingValue,
    }),
    { openingValue: 0, entryValue: 0, exitValue: 0, closingValue: 0 },
  );

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
            <input
              type="date"
              name="from"
              defaultValue={fromDate}
              max={today}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            />
            <label className="text-sm text-slate-600">{labels.to}</label>
            <input
              type="date"
              name="to"
              defaultValue={toDate}
              max={today}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            />
            <button
              type="submit"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
            >
              {labels.load}
            </button>
          </form>
          {items.length > 0 && (
            <BalantaDownloadButton
              orgName={org?.name ?? "franchisetech"}
              orgCui={org?.fiscalnet_cif ?? undefined}
              dateFrom={fromDate}
              dateTo={toDate}
              currency={currency}
              items={items}
              integrityLabels={integrityLabels}
              label={labels.download}
            />
          )}
        </div>
      </div>

      {integrityIssues.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
          <p className="font-medium">{labels.integrityBanner(integrityIssues.length)}</p>
          <p className="mt-1 text-xs text-amber-800">{labels.integrityBannerHint}</p>
          {hasArchived ? (
            <Link
              href="/app/products?archived=1"
              className="mt-2 inline-block text-xs font-medium text-amber-900 underline hover:text-amber-950"
            >
              {labels.viewArchivedProducts}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 print:border-0">
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-slate-500">{labels.unitLabel}</p>
            <p className="font-semibold text-slate-900">{org?.name ?? "franchisetech"}</p>
          </div>
          <div>
            <p className="text-slate-500">{labels.period}</p>
            <p className="font-semibold text-slate-900">
              {fromDate} — {toDate}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{labels.totalItems}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{items.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{labels.openingStock}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatMoney(totals.openingValue, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-700">{labels.entries}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-700">
            {formatMoney(totals.entryValue, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-blue-700">{labels.closingStock}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-blue-700">
            {formatMoney(totals.closingValue, currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">{labels.noData}</p>
              <p className="text-xs text-slate-300 mt-2">{labels.noDataHint}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2}>{labels.product}</TableHead>
                  <TableHead rowSpan={2}>{labels.unit}</TableHead>
                  <TableHead colSpan={2} className="text-center border-l">
                    {labels.openingStock}
                  </TableHead>
                  <TableHead colSpan={2} className="text-center border-l">
                    {labels.entries}
                  </TableHead>
                  <TableHead colSpan={2} className="text-center border-l">
                    {labels.exits}
                  </TableHead>
                  <TableHead colSpan={2} className="text-center border-l">
                    {labels.closingStock}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="text-right border-l">{labels.qty}</TableHead>
                  <TableHead className="text-right">{labels.value}</TableHead>
                  <TableHead className="text-right border-l">{labels.qty}</TableHead>
                  <TableHead className="text-right">{labels.value}</TableHead>
                  <TableHead className="text-right border-l">{labels.qty}</TableHead>
                  <TableHead className="text-right">{labels.value}</TableHead>
                  <TableHead className="text-right border-l">{labels.qty}</TableHead>
                  <TableHead className="text-right">{labels.value}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId ?? item.productName}>
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{item.productName}</span>
                        {item.integrityStatus && item.integrityStatus !== "ok" ? (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${integrityBadgeClass(item.integrityStatus)}`}
                          >
                            {integrityLabels[item.integrityStatus]}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums border-l">
                      {item.openingQty.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(item.openingValue, currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums border-l text-green-700">
                      {item.entryQty.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-green-700">
                      {formatMoney(item.entryValue, currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums border-l text-red-600">
                      {item.exitQty.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-600">
                      {formatMoney(item.exitValue, currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums border-l font-medium">
                      {item.closingQty.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatMoney(item.closingValue, currency)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={2} className="text-right">
                    {labels.total}:
                  </TableCell>
                  <TableCell className="text-right border-l">—</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(totals.openingValue, currency)}
                  </TableCell>
                  <TableCell className="text-right border-l">—</TableCell>
                  <TableCell className="text-right tabular-nums text-green-700">
                    {formatMoney(totals.entryValue, currency)}
                  </TableCell>
                  <TableCell className="text-right border-l">—</TableCell>
                  <TableCell className="text-right tabular-nums text-red-600">
                    {formatMoney(totals.exitValue, currency)}
                  </TableCell>
                  <TableCell className="text-right border-l">—</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(totals.closingValue, currency)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-base">{labels.reconcileTitle}</CardTitle>
            <p className="text-sm text-slate-500 font-normal">{labels.reconcileSubtitle}</p>
          </CardHeader>
          <CardContent>
            {reconcileRows.length === 0 ? (
              <p className="text-sm text-slate-500">{labels.reconcileNoIssues}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{labels.product}</TableHead>
                    <TableHead>{labels.unit}</TableHead>
                    <TableHead className="text-right">{labels.reconcileCatalogQty}</TableHead>
                    <TableHead className="text-right">{labels.reconcileLedgerQty}</TableHead>
                    <TableHead className="text-right">{labels.reconcileDelta}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconcileRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        <Link href={`/app/products/${row.id}`} className="hover:text-blue-600 hover:underline">
                          {row.name}
                        </Link>
                      </TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.catalogQty.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.ledgerQty.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums text-orange-700 font-medium">
                        {row.delta > 0 ? "+" : ""}
                        {row.delta.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 print:hidden">
        <p className="text-xs text-slate-500">
          <strong>{labels.dataSourceLabel}</strong> {labels.dataSource}
        </p>
      </div>
    </div>
  );
}
