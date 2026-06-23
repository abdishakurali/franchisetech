import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

function safeDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IE", { dateStyle: "medium" }).format(d);
  } catch {
    return "—";
  }
}

function firstJoined<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

export default async function RefundsPage() {
  let voided: Array<{
    id: string;
    transaction_number: string | null;
    sold_at: string | null;
    total: number | null;
    payment_methods: { name?: string | null } | { name?: string | null }[] | null;
  }> | null = null;

  let auditRows: Array<{
    transaction_id: string | null;
    reason: string | null;
    performed_at: string | null;
  }> | null = null;

  let t: Awaited<ReturnType<typeof getAppLocaleAndText>>["t"];
  let currency = "EUR";

  try {
    const ctx = await getKitchenOpsContext();
    const { locale, t: localeText } = getAppLocaleAndText(ctx.countryCode, ctx.profileLocale);
    t = localeText;
    currency = ctx.currency;
    const { supabase, orgId } = ctx;

    const [txResult, auditResult] = await Promise.all([
      supabase
        .from("pos_transactions")
        .select("id,transaction_number,sold_at,total,payment_methods(name)")
        .eq("organisation_id", orgId)
        .eq("status", "voided")
        .order("sold_at", { ascending: false })
        .limit(100),
      supabase
        .from("pos_audit_events")
        .select("transaction_id,reason,performed_at")
        .eq("organisation_id", orgId)
        .eq("event_type", "voided")
        .order("performed_at", { ascending: false })
        .limit(100),
    ]);

    voided = txResult.data ?? null;
    auditRows = auditResult.data ?? null;
  } catch {
    voided = null;
    auditRows = null;
    const { t: fallbackT } = getAppLocaleAndText();
    t = fallbackT;
  }

  const safeTx = voided ?? [];
  const safeAudit = auditRows ?? [];

  const getAudit = (txId: string) =>
    safeAudit.find((a) => a.transaction_id === txId) ?? null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{t.refunds.titleFull}</h1>
        <p className="text-sm text-slate-500">{t.refunds.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.refunds.voidedTransactions(safeTx.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {safeTx.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-slate-400 text-sm">{t.refunds.empty}</p>
              <p className="text-slate-300 text-xs">{t.refunds.emptyDetail}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.refunds.orderNo}</TableHead>
                  <TableHead>{t.tables.date}</TableHead>
                  <TableHead>{t.tables.payment}</TableHead>
                  <TableHead>{t.refunds.reason}</TableHead>
                  <TableHead className="text-right">{t.tables.amount}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTx.map((tx) => {
                  const method = firstJoined(tx.payment_methods);
                  const audit = getAudit(tx.id);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.transaction_number ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {safeDate(tx.sold_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {method?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {audit?.reason ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        &minus;{formatMoney(tx.total, currency)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/app/transactions/${tx.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {t.refunds.view}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">{t.refunds.footerHint}</p>
    </div>
  );
}
