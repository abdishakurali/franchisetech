import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { startOfMonth } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

type Props = { searchParams: Promise<{ from?: string; to?: string }> };

export default async function StaffReportPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText();

  const now = new Date();
  const defaultFrom = startOfMonth(now).toISOString().slice(0, 10);
  const from = params.from ?? defaultFrom;
  const to = params.to ?? now.toISOString().slice(0, 10);

  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("sold_by,total,tip_amount,discount_total,status,payment_methods(type,name)")
    .eq("organisation_id", orgId)
    .gte("sold_at", from)
    .lte("sold_at", `${to}T23:59:59.999`);

  const tx = transactions ?? [];

  // Gather all sold_by user IDs
  const userIds = [...new Set(tx.map((t) => t.sold_by).filter(Boolean))] as string[];
  const profileMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p.full_name || p.email || p.id.slice(0, 8));
    }
  }

  // Aggregate by cashier
  type CashierRow = {
    name: string;
    count: number;
    totalRevenue: number;
    totalDiscounts: number;
    totalTips: number;
    voids: number;
    avgTicket: number;
  };
  const byUser = new Map<string, CashierRow>();
  for (const row of tx) {
    const userId = row.sold_by ?? "unknown";
    const name = profileMap.get(userId) ?? t.common.unknown;
    const entry = byUser.get(userId) ?? { name, count: 0, totalRevenue: 0, totalDiscounts: 0, totalTips: 0, voids: 0, avgTicket: 0 };
    if (row.status === "voided") {
      entry.voids++;
    } else {
      entry.count++;
      entry.totalRevenue += Number(row.total ?? 0);
      entry.totalDiscounts += Number(row.discount_total ?? 0);
      entry.totalTips += Number(row.tip_amount ?? 0);
    }
    byUser.set(userId, entry);
  }
  const rows = [...byUser.values()].map((r) => ({
    ...r,
    avgTicket: r.count > 0 ? r.totalRevenue / r.count : 0,
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Tips by payment method
  const tipsByPayment = new Map<string, number>();
  for (const row of tx) {
    if (row.status === "voided") continue;
    const tips = Number(row.tip_amount ?? 0);
    if (tips <= 0) continue;
    const method = (row.payment_methods as { type?: string; name?: string } | null)?.name ?? t.common.unknown;
    tipsByPayment.set(method, (tipsByPayment.get(method) ?? 0) + tips);
  }
  const tipRows = [...tipsByPayment.entries()].map(([method, total]) => ({ method, total })).sort((a, b) => b.total - a.total);

  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalDiscounts = rows.reduce((s, r) => s + r.totalDiscounts, 0);
  const totalTips = rows.reduce((s, r) => s + r.totalTips, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/reports" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{t.reports.staff?.title ?? "Staff performance"}</h1>
          <p className="text-sm text-slate-500">{t.reports.staff?.desc ?? "Transactions, discounts, and tips by cashier."}</p>
        </div>
      </div>

      {/* Date range form */}
      <form method="GET" className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">{t.reports.staff?.from ?? "From"}</label>
          <input type="date" name="from" defaultValue={from} className="rounded-md border border-slate-200 px-2 py-1 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">{t.reports.staff?.to ?? "To"}</label>
          <input type="date" name="to" defaultValue={to} className="rounded-md border border-slate-200 px-2 py-1 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          {t.common.apply ?? "Apply"}
        </button>
      </form>

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.dashboard.sales}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{money(totalRevenue, currency)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.reports.staff?.totalDiscounts ?? "Total discounts"}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-700">{money(totalDiscounts, currency)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.reports.staff?.totalTips ?? "Total tips"}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-700">{money(totalTips, currency)}</p></CardContent>
        </Card>
      </div>

      {/* Per-cashier table */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t.reports.staff?.byCashier ?? "By cashier"}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">{t.common.noData ?? "No data for this period."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.reports.staff?.cashier ?? "Cashier"}</TableHead>
                  <TableHead className="text-right">{t.tables.total}</TableHead>
                  <TableHead className="text-right">{t.reports.staff?.transactions ?? "Txns"}</TableHead>
                  <TableHead className="text-right">{t.dashboard.avgTicket ?? "Avg ticket"}</TableHead>
                  <TableHead className="text-right">{t.reports.staff?.discounts ?? "Discounts"}</TableHead>
                  <TableHead className="text-right">{t.common.tips}</TableHead>
                  <TableHead className="text-right">{t.reports.staff?.voids ?? "Voids"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">{money(row.totalRevenue, currency)}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{money(row.avgTicket, currency)}</TableCell>
                    <TableCell className="text-right">
                      {row.totalDiscounts > 0 ? (
                        <span className="text-amber-700">{money(row.totalDiscounts, currency)}</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.totalTips > 0 ? (
                        <span className="text-green-700">{money(row.totalTips, currency)}</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.voids > 0 ? <span className="text-red-600">{row.voids}</span> : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tips by payment method */}
      {tipRows.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t.reports.staff?.tipsByPayment ?? "Tips by payment method"}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.tables.payment}</TableHead>
                  <TableHead className="text-right">{t.common.tips}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipRows.map((row) => (
                  <TableRow key={row.method}>
                    <TableCell className="font-medium capitalize">{row.method}</TableCell>
                    <TableCell className="text-right text-green-700">{money(row.total, currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
