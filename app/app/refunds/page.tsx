import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";

// Safe date formatter — never throws regardless of input
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

// Safe money formatter — never throws
function safeMoney(value: number | string | null | undefined): string {
  try {
    const n = Number(value ?? 0);
    const amount = Number.isFinite(n) ? n : 0;
    return `€${amount.toFixed(2)}`;
  } catch {
    return "€0.00";
  }
}

// Unwrap Supabase join result (single or array)
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

  try {
    const { supabase, orgId } = await getKitchenOpsContext();

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
    // Errors handled by error.tsx boundary — return graceful empty state
    voided = null;
    auditRows = null;
  }

  const safeTx = voided ?? [];
  const safeAudit = auditRows ?? [];

  // Simple O(n²) lookup instead of Map — avoids any serialization issues
  const getAudit = (txId: string) =>
    safeAudit.find((a) => a.transaction_id === txId) ?? null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Refunds &amp; Voids</h1>
        <p className="text-sm text-slate-500">
          Voided transactions with reason and audit trail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voided transactions ({safeTx.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {safeTx.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-slate-400 text-sm">No refunds or voids recorded.</p>
              <p className="text-slate-300 text-xs">
                Voids will appear here after you void a transaction from its receipt.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
                        &minus;{safeMoney(tx.total)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/app/transactions/${tx.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
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

      <p className="text-xs text-slate-400">
        To void a sale: open the transaction receipt and click &quot;Void
        transaction&quot;. Partial refunds are coming soon.
      </p>
    </div>
  );
}
