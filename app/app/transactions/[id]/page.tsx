import Link from "next/link";
import { PrintButton } from "@/components/app/PrintButton";
import { VoidTransactionButton } from "@/components/app/VoidTransactionButton";
import { CashDrawerNotice } from "@/components/app/CashDrawerNotice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import {
  lineDiscountPctStored,
  lineGrossAfterStored,
  lineGrossBeforeStored,
  lineHasDiscount,
  receiptDiscountSummary,
} from "@/lib/pos-receipt-display";

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function money(value: number | string | null | undefined, cur = "EUR") {
  const n = Number(value ?? 0);
  const amount = Number.isFinite(n) ? n : 0;
  if (cur === "RON") return `${amount.toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(amount);
}

function safeDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return formatDate(value);
}

type ReceiptItem = {
  id: string;
  product_name: string;
  quantity: number | string;
  unit_price: number | string;
  line_total: number | string;
  discount_pct?: number | string | null;
  discount_amount?: number | string | null;
  vat_rate?: number | null;
  net_amount?: number | null;
  vat_amount?: number | null;
  gross_amount?: number | null;
};

type AuditEvent = {
  id: string;
  event_type: string;
  reason: string | null;
  performed_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default async function TransactionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();
  let cashDrawerSettings = {
    mode: "manual" as const,
    port: 17878,
    token: null as string | null,
    triggerOnCashSale: true,
    triggerOnCashIn: true,
    triggerOnCashOut: true,
  };
  try {
    const { data: drawerOrg, error } = await supabase
      .from("organisations")
      .select("cash_drawer_mode,cash_drawer_connector_port,cash_drawer_connector_token,cash_drawer_trigger_on_cash_sale,cash_drawer_trigger_on_cash_in,cash_drawer_trigger_on_cash_out")
      .eq("id", orgId)
      .maybeSingle();
    if (!error && drawerOrg) {
      cashDrawerSettings = {
        mode: drawerOrg.cash_drawer_mode ?? "manual",
        port: drawerOrg.cash_drawer_connector_port ?? 17878,
        token: drawerOrg.cash_drawer_connector_token ?? null,
        triggerOnCashSale: drawerOrg.cash_drawer_trigger_on_cash_sale ?? true,
        triggerOnCashIn: drawerOrg.cash_drawer_trigger_on_cash_in ?? true,
        triggerOnCashOut: drawerOrg.cash_drawer_trigger_on_cash_out ?? true,
      };
    }
  } catch {}

  const { data: tx } = await supabase
    .from("pos_transactions")
    .select("*,payment_methods(name),pos_transaction_items(*)")
    .eq("organisation_id", orgId)
    .eq("id", id)
    .single();

  if (!tx) return <div className="p-6 text-slate-500">Transaction not found.</div>;

  // Cash received / change due from sale_payments metadata
  let cashPaymentMeta: { cash_received?: number; change_due?: number } | null = null;
  try {
    const { data: sp } = await supabase
      .from("sale_payments")
      .select("method, metadata")
      .eq("sale_id", id)
      .eq("method", "cash")
      .maybeSingle();
    const meta = sp?.metadata as Record<string, number> | null;
    if (meta?.cash_received) cashPaymentMeta = { cash_received: meta.cash_received, change_due: meta.change_due };
  } catch { cashPaymentMeta = null; }

  // Audit trail
  let auditEvents: AuditEvent[] | null = null;
  try {
    const { data: ae } = await supabase
      .from("pos_audit_events")
      .select("*,profiles(full_name,email)")
      .eq("transaction_id", id)
      .order("performed_at", { ascending: true });
    auditEvents = ae as AuditEvent[] | null;
  } catch { auditEvents = null; }

  const org = firstJoined(membership.organisations as { name?: string | null } | { name?: string | null }[]);
  const method = firstJoined(tx.payment_methods as { name?: string | null } | { name?: string | null }[]);
  const items = Array.isArray(tx.pos_transaction_items) ? (tx.pos_transaction_items as ReceiptItem[]) : [];
  const customerName = typeof tx.customer_name === "string" && tx.customer_name.trim() ? tx.customer_name.trim() : "Walk-in customer";
  const paymentName = method?.name || "Payment";

  const canVoid = membership.role === "owner" || membership.role === "manager";

  // VAT breakdown from items
  const vatByRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const item of items) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = vatByRate.get(rate) ?? { net: 0, vat: 0, gross: 0 };
    entry.net += net; entry.vat += vat; entry.gross += gross;
    vatByRate.set(rate, entry);
  }

  const totalGross = Number(tx.total_gross ?? tx.total ?? 0);
  const totalNet = Number(tx.subtotal_net ?? tx.subtotal ?? 0);
  const totalVat = Number(tx.tax_total ?? 0);
  const discountSummary = receiptDiscountSummary(items, tx);

  return (
    <div className="space-y-6 p-6">
      {query.drawer === "cash_sale" && <CashDrawerNotice reason="cash_sale" settings={cashDrawerSettings} />}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Receipt {tx.transaction_number}
          </h1>
          <p className="text-sm text-slate-500">
            {safeDate(tx.sold_at)} · {paymentName} · {customerName}
            {tx.status === "voided" && <span className="ml-2 text-red-600 font-medium">[VOIDED]</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Link href="/app/pos" className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50">New sale</Link>
          <PrintButton />
          {canVoid && <VoidTransactionButton transactionId={tx.id} status={tx.status ?? "completed"} />}
        </div>
      </div>

      {/* Receipt */}
      <Card className="mx-auto max-w-xl print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle>{((org as { name?: string | null } | null)?.name) ?? "franchisetech"}</CardTitle>
          <p className="text-sm text-slate-500">{safeDate(tx.sold_at)} · {paymentName}</p>
          <p className="text-sm text-slate-600">Customer: {customerName}</p>
          {tx.status === "voided" && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 font-medium">VOIDED</div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? items.map((item) => {
                const linePct = lineDiscountPctStored(item);
                const lineBefore = lineGrossBeforeStored(item);
                const lineAfter = lineGrossAfterStored(item);
                return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>{item.product_name || "Item"}</div>
                    {lineHasDiscount(item) && (
                      <Badge variant="secondary" className="mt-1 text-[10px] font-semibold text-blue-700">
                        −{linePct}%
                      </Badge>
                    )}
                    {Number(item.vat_rate ?? 0) > 0 && (
                      <div className="text-xs text-slate-400">VAT {item.vat_rate}%</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{Number(item.quantity ?? 0)}</TableCell>
                  <TableCell className="text-right">{money(item.unit_price, currency)}</TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">{money(lineAfter, currency)}</div>
                    {lineHasDiscount(item) && lineBefore > lineAfter + 0.001 && (
                      <div className="text-xs text-slate-400">{money(lineBefore, currency)} before discount</div>
                    )}
                  </TableCell>
                </TableRow>
              );}) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-slate-500">
                    No items saved for this receipt.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {discountSummary.hasDiscount && (
            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal before discount</span>
                <span>{money(discountSummary.subtotalBefore, currency)}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-medium">
                <span>Discount total</span>
                <span>−{money(discountSummary.discountTotal, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Total after discount</span>
                <span>{money(discountSummary.totalAfter, currency)}</span>
              </div>
            </div>
          )}

          {/* VAT summary */}
          <div className="space-y-1 border-t pt-3 text-sm">
            {Array.from(vatByRate.entries()).map(([rate, v]) => (
              <div key={rate} className="flex justify-between text-slate-500">
                <span>VAT {rate}% ({money(v.net, currency)} net)</span>
                <span>{money(v.vat, currency)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-slate-500"><span>Net (excl. VAT)</span><span>{money(totalNet || (totalGross - totalVat), currency)}</span></div>
            <div className="flex justify-between text-slate-500"><span>VAT total</span><span>{money(totalVat, currency)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total (incl. VAT)</span><span>{money(totalGross, currency)}</span></div>
            {cashPaymentMeta?.cash_received && (
              <>
                <div className="flex justify-between text-slate-500 border-t pt-2">
                  <span>{currency === "RON" ? "Numerar primit" : "Cash received"}</span>
                  <span>{money(cashPaymentMeta.cash_received, currency)}</span>
                </div>
                {(cashPaymentMeta.change_due ?? 0) > 0.005 && (
                  <div className="flex justify-between font-semibold text-green-700">
                    <span>{currency === "RON" ? "Rest de dat" : "Change due"}</span>
                    <span>{money(cashPaymentMeta.change_due ?? 0, currency)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit trail */}
      {(auditEvents && auditEvents.length > 0) && (
        <Card className="mx-auto max-w-xl print:hidden">
          <CardHeader><CardTitle className="text-base">Audit trail</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {auditEvents.map((event) => {
              const profile = firstJoined(event.profiles as { full_name?: string | null; email?: string | null } | null);
              const who = profile?.full_name || profile?.email || "Unknown";
              return (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <Badge variant={event.event_type === "voided" ? "destructive" : "secondary"} className="mt-0.5 capitalize">
                    {event.event_type}
                  </Badge>
                  <div>
                    <p className="text-slate-700">{who} · {safeDate(event.performed_at)}</p>
                    {event.reason && <p className="text-slate-500 mt-0.5">Reason: {event.reason}</p>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
