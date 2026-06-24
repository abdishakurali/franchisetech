import Link from "next/link";
import { PrintButton } from "@/components/app/PrintButton";
import { VoidTransactionButton } from "@/components/app/VoidTransactionButton";
import { CashDrawerNotice } from "@/components/app/CashDrawerNotice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { formatAppDate } from "@/lib/app-locale";
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

function safeDate(value: string | null | undefined, locale: "ro" | "en") {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return formatAppDate(value, locale);
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
  const { countryCode, profileLocale, supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const { t, locale } = await getAppLocaleAndText(countryCode, profileLocale);
  const r = t.transactions.receipt;
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

  if (!tx) return <div className="p-6 text-slate-500">{t.transactions.notFound}</div>;

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
  const customerName =
    typeof tx.customer_name === "string" && tx.customer_name.trim()
      ? tx.customer_name.trim()
      : t.common.walkInCustomer;
  const paymentName = method?.name || r.payment;
  const statusVoided = tx.status === "voided";

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
            {r.title(tx.transaction_number)}
          </h1>
          <p className="text-sm text-slate-500">
            {safeDate(tx.sold_at, locale)} · {paymentName} · {customerName}
            {statusVoided && (
              <span className="ml-2 text-red-600 font-medium">[{t.transactions.statusVoided.toUpperCase()}]</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Link href="/app/pos" className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50">
            {r.newSale}
          </Link>
          <PrintButton />
          {canVoid && <VoidTransactionButton transactionId={tx.id} status={tx.status ?? "completed"} />}
        </div>
      </div>

      {/* Receipt */}
      <Card className="mx-auto max-w-xl print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle>{((org as { name?: string | null } | null)?.name) ?? "franchisetech"}</CardTitle>
          <p className="text-sm text-slate-500">{safeDate(tx.sold_at, locale)} · {paymentName}</p>
          <p className="text-sm text-slate-600">
            {r.customer}: {customerName}
          </p>
          {statusVoided && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 font-medium">
              {t.transactions.statusVoided.toUpperCase()}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{r.item}</TableHead>
                <TableHead className="text-right">{r.qty}</TableHead>
                <TableHead className="text-right">{r.unit}</TableHead>
                <TableHead className="text-right">{r.total}</TableHead>
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
                    <div>{item.product_name || r.item}</div>
                    {lineHasDiscount(item) && (
                      <Badge variant="secondary" className="mt-1 text-[10px] font-semibold text-blue-700">
                        −{linePct}%
                      </Badge>
                    )}
                    {Number(item.vat_rate ?? 0) > 0 && (
                      <div className="text-xs text-slate-400">{r.vatShort(Number(item.vat_rate))}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{Number(item.quantity ?? 0)}</TableCell>
                  <TableCell className="text-right">{money(item.unit_price, currency)}</TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">{money(lineAfter, currency)}</div>
                    {lineHasDiscount(item) && lineBefore > lineAfter + 0.001 && (
                      <div className="text-xs text-slate-400">
                        {money(lineBefore, currency)} {r.beforeDiscount}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );}) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-slate-500">
                    {r.noItems}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {discountSummary.hasDiscount && (
            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>{r.subtotalBeforeDiscount}</span>
                <span>{money(discountSummary.subtotalBefore, currency)}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-medium">
                <span>{r.discountTotal}</span>
                <span>−{money(discountSummary.discountTotal, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{r.totalAfterDiscount}</span>
                <span>{money(discountSummary.totalAfter, currency)}</span>
              </div>
            </div>
          )}

          {/* VAT summary */}
          <div className="space-y-1 border-t pt-3 text-sm">
            {Array.from(vatByRate.entries()).map(([rate, v]) => (
              <div key={rate} className="flex justify-between text-slate-500">
                <span>{r.vatLine(rate, money(v.net, currency))}</span>
                <span>{money(v.vat, currency)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-slate-500"><span>{r.netExclVat}</span><span>{money(totalNet || (totalGross - totalVat), currency)}</span></div>
            <div className="flex justify-between text-slate-500"><span>{r.vatTotal}</span><span>{money(totalVat, currency)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>{r.totalInclVat}</span><span>{money(totalGross, currency)}</span></div>
            {cashPaymentMeta?.cash_received && (
              <>
                <div className="flex justify-between text-slate-500 border-t pt-2">
                  <span>{r.cashReceived}</span>
                  <span>{money(cashPaymentMeta.cash_received, currency)}</span>
                </div>
                {(cashPaymentMeta.change_due ?? 0) > 0.005 && (
                  <div className="flex justify-between font-semibold text-green-700">
                    <span>{r.changeDue}</span>
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
          <CardHeader><CardTitle className="text-base">{r.auditTrail}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {auditEvents.map((event) => {
              const profile = firstJoined(event.profiles as { full_name?: string | null; email?: string | null } | null);
              const who = profile?.full_name || profile?.email || t.common.unknown;
              return (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <Badge variant={event.event_type === "voided" ? "destructive" : "secondary"} className="mt-0.5">
                    {r.auditEvent(event.event_type)}
                  </Badge>
                  <div>
                    <p className="text-slate-700">{who} · {safeDate(event.performed_at, locale)}</p>
                    {event.reason && <p className="text-slate-500 mt-0.5">{r.reason(event.reason)}</p>}
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
