import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import Link from "next/link";

type LedgerEntry = {
  date: string;
  docNo: string;
  description: string;
  cashIn: number;
  cashOut: number;
};

export default async function RegistruDeCasaReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  if (!await hasEntitlement(orgId, "reports.gestiune")) redirect("/app/billing?reason=gestiune_requires_pro");
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const labels = t.reportPages.registruDeCasa;
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  // Opening balance: the first session opened in range (same source as the
  // single-day Z-report), generalized to the whole period.
  const { data: sessions } = await supabase
    .from("pos_sessions")
    .select("opening_cash")
    .eq("organisation_id", orgId)
    .gte("opened_at", periodStart)
    .lte("opened_at", periodEnd)
    .order("opened_at", { ascending: true })
    .limit(1);
  const openingCash = Number(sessions?.[0]?.opening_cash ?? 0);

  const { data: cashMovements } = await supabase
    .from("pos_cash_movements")
    .select("id,movement_type,amount,reason,performed_at")
    .eq("organisation_id", orgId)
    .gte("performed_at", periodStart)
    .lte("performed_at", periodEnd)
    .order("performed_at");

  // Filtered on pos_transactions.sold_at (real sale date), not created_at --
  // same fix applied throughout this session's other reports.
  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("sold_at,status,total,payment_methods(type)")
    .eq("organisation_id", orgId)
    .gte("sold_at", periodStart)
    .lte("sold_at", periodEnd);

  const cashByDay = new Map<string, number>();
  for (const tx of (transactions ?? []) as Array<{ sold_at: string; status: string; total: number | null; payment_methods: { type?: string } | { type?: string }[] | null }>) {
    if (tx.status === "voided") continue;
    const method = Array.isArray(tx.payment_methods) ? tx.payment_methods[0] : tx.payment_methods;
    if ((method?.type ?? "").toLowerCase() !== "cash") continue;
    const day = tx.sold_at.slice(0, 10);
    cashByDay.set(day, (cashByDay.get(day) ?? 0) + Number(tx.total ?? 0));
  }

  // Merge manual movements + daily cash-sales into one chronological ledger.
  let chiCount = 0;
  let choCount = 0;
  const entries: Array<{ sortKey: string; entry: LedgerEntry }> = [];

  for (const m of (cashMovements ?? [])) {
    const amount = Number(m.amount ?? 0);
    if (amount > 0) {
      chiCount++;
      entries.push({
        sortKey: m.performed_at,
        entry: {
          date: new Date(m.performed_at).toLocaleDateString("ro-RO"),
          docNo: `CHI${String(chiCount).padStart(4, "0")}`,
          description: m.reason ?? "Încasare",
          cashIn: amount,
          cashOut: 0,
        },
      });
    } else if (amount < 0) {
      choCount++;
      entries.push({
        sortKey: m.performed_at,
        entry: {
          date: new Date(m.performed_at).toLocaleDateString("ro-RO"),
          docNo: `CHO${String(choCount).padStart(4, "0")}`,
          description: m.reason ?? "Plată",
          cashIn: 0,
          cashOut: Math.abs(amount),
        },
      });
    }
  }

  for (const [day, total] of Array.from(cashByDay.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (total <= 0) continue;
    chiCount++;
    entries.push({
      sortKey: `${day}T23:59:58`,
      entry: {
        date: new Date(day).toLocaleDateString("ro-RO"),
        docNo: `CHI${String(chiCount).padStart(4, "0")}`,
        description: "Vânzări POS (numerar)",
        cashIn: total,
        cashOut: 0,
      },
    });
  }

  entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let runningBalance = openingCash;
  const ledger = entries.map(({ entry }) => {
    runningBalance += entry.cashIn - entry.cashOut;
    return { ...entry, balance: runningBalance };
  });

  const totalIn = ledger.reduce((s, e) => s + e.cashIn, 0);
  const totalOut = ledger.reduce((s, e) => s + e.cashOut, 0);
  const closingBalance = openingCash + totalIn - totalOut;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.title}</h1>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <ReportDateRangeFilter basePath="/app/reports/registru-de-casa" from={fromDate} to={toDate} />
          <Link
            href={`/api/reports/registru-de-casa/pdf?from=${fromDate}&to=${toDate}`}
            className="h-9 inline-flex items-center rounded-md bg-slate-900 text-white px-3 text-sm font-medium hover:bg-slate-800"
          >
            {labels.download}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-slate-500">Unitate</p>
            <p className="font-semibold text-slate-900">{org?.name ?? "franchisetech"}</p>
          </div>
          <div>
            <p className="text-slate-500">Perioadă</p>
            <p className="font-semibold text-slate-900">{fromDate} — {toDate}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.openingBalance}</CardTitle></CardHeader><CardContent className="text-xl font-bold">{formatMoney(openingCash, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.totalIn}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-green-700">{formatMoney(totalIn, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.totalOut}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-red-700">{formatMoney(totalOut, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{labels.closingBalance}</CardTitle></CardHeader><CardContent className="text-xl font-bold text-blue-700">{formatMoney(closingBalance, currency)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{labels.title}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {ledger.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{labels.noData}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{labels.nrCrt}</TableHead>
                  <TableHead>{labels.date}</TableHead>
                  <TableHead>{labels.docNo}</TableHead>
                  <TableHead>{labels.description}</TableHead>
                  <TableHead className="text-right">{labels.cashIn}</TableHead>
                  <TableHead className="text-right">{labels.cashOut}</TableHead>
                  <TableHead className="text-right">{labels.balance}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-blue-50">
                  <TableCell />
                  <TableCell className="tabular-nums">{new Date(fromDate).toLocaleDateString("ro-RO")}</TableCell>
                  <TableCell>SOLD INI</TableCell>
                  <TableCell>Sold la începutul perioadei</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(openingCash, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">—</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatMoney(openingCash, currency)}</TableCell>
                </TableRow>
                {ledger.map((e, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-right tabular-nums text-slate-500">{idx + 1}</TableCell>
                    <TableCell className="tabular-nums">{e.date}</TableCell>
                    <TableCell>{e.docNo}</TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.cashIn > 0 ? formatMoney(e.cashIn, currency) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.cashOut > 0 ? formatMoney(e.cashOut, currency) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatMoney(e.balance, currency)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={4} className="text-right">{labels.total}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totalIn, currency)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(totalOut, currency)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow className="bg-blue-100 font-bold">
                  <TableCell colSpan={6} className="text-right">{labels.closingBalance}:</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(closingBalance, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 sm:grid-cols-2 pt-8">
        <div>
          <p className="text-xs text-slate-500 mb-8">{labels.preparedBy}</p>
          <div className="border-t border-slate-300 pt-1 text-xs text-slate-400">{labels.nameDate}</div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-8">{labels.accountantSignature}</p>
          <div className="border-t border-slate-300 pt-1 text-xs text-slate-400">{labels.nameDate}</div>
        </div>
      </div>
    </div>
  );
}
