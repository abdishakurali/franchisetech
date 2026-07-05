import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/app/PrintButton";
import { RegistruDeCasaButton } from "@/components/app/RegistruDeCasaButton";
import { ZReportCashForm } from "@/components/app/ZReportCashForm";
import { GrowthReportViewTracker } from "@/components/app/GrowthReportViewTracker";
import { ZReportReferralNudge } from "@/components/app/ZReportReferralNudge";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { ensureReferralCode } from "@/lib/referrals";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { formatAppDate, intlLocaleForApp } from "@/lib/app-locale";

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function ZReportPage({ searchParams }: { searchParams?: Promise<{ date?: string }> }) {
  const { countryCode, profileLocale, supabase, orgId, user, membership, currency } = await getKitchenOpsContext();
  const { t, locale } = await getAppLocaleAndText(countryCode, profileLocale);
  const zp = t.reportPages.zReport;
  const params = await searchParams;
  const org = firstJoined(membership.organisations as { name?: string | null } | { name?: string | null }[]);

  const today = new Date().toISOString().slice(0, 10);
  const reportDate = params?.date ?? today;
  const dayStart = `${reportDate}T00:00:00.000Z`;
  const dayEnd = `${reportDate}T23:59:59.999Z`;

  const { data: transactions } = await supabase.from("pos_transactions")
    .select("*,payment_methods(name,type),profiles(full_name,email)")
    .eq("organisation_id", orgId)
    .gte("sold_at", dayStart)
    .lte("sold_at", dayEnd)
    .order("sold_at");

  // Scoped by transaction_id (from the already sold_at-filtered transactions
  // above), not pos_transaction_items.created_at -- for migrated historical
  // sales, created_at is the bulk-import timestamp, not the real sale date.
  const transactionIds = (transactions ?? []).map((tx) => tx.id);
  const { data: items } = transactionIds.length
    ? await supabase.from("pos_transaction_items")
        .select("product_name,quantity,line_total,vat_rate,net_amount,vat_amount,gross_amount,transaction_id")
        .eq("organisation_id", orgId)
        .in("transaction_id", transactionIds)
    : { data: [] as Array<{ product_name: string; quantity: number | null; line_total: number | null; vat_rate: number | null; net_amount: number | null; vat_amount: number | null; gross_amount: number | null; transaction_id: string }> };


  // Cash movements for this day
  const { data: cashMovements } = await supabase
    .from('pos_cash_movements')
    .select('id,movement_type,amount,reason,performed_at')
    .eq('organisation_id', orgId)
    .gte('performed_at', dayStart)
    .lte('performed_at', dayEnd)
    .order('performed_at');

  // Get opening cash from pos_sessions for this day
  const { data: sessions } = await supabase
    .from('pos_sessions')
    .select('opening_cash')
    .eq('organisation_id', orgId)
    .gte('opened_at', dayStart)
    .lte('opened_at', dayEnd)
    .order('opened_at', { ascending: true })
    .limit(1);
  const openingCash = Number(sessions?.[0]?.opening_cash ?? 0);

  const cashInTotal = (cashMovements ?? []).filter((m) => m.movement_type === 'cash_in').reduce((s, m) => s + Number(m.amount ?? 0), 0);
  const cashOutTotal = (cashMovements ?? []).filter((m) => m.movement_type === 'cash_out').reduce((s, m) => s + Number(m.amount ?? 0), 0);

  const completedTx = (transactions ?? []).filter((tx) => tx.status !== "voided");
  const voidedTx = (transactions ?? []).filter((tx) => tx.status === "voided");

  // Totals from completed only
  const totalGross = completedTx.reduce((s, tx) => s + Number(tx.total_gross ?? tx.total ?? 0), 0);
  const totalNet = completedTx.reduce((s, tx) => s + Number(tx.subtotal_net ?? 0), 0);
  const totalVat = completedTx.reduce((s, tx) => s + Number(tx.tax_total ?? 0), 0);
  const totalTips = completedTx.reduce((s, tx) => s + Number(tx.tip_amount ?? 0), 0);
  const grossExTips = totalGross - totalTips;

  // Payment method totals
  const byPaymentType = new Map<string, number>();
  for (const tx of completedTx) {
    const method = firstJoined(tx.payment_methods as {name?:string;type?:string}|{name?:string;type?:string}[]);
    const type = ((method as { name?: string | null; type?: string | null } | null)?.type) ?? "other";
    const name = ((method as { name?: string | null; type?: string | null } | null)?.name) ?? zp.other;
    byPaymentType.set(name, (byPaymentType.get(name) ?? 0) + Number(tx.total ?? 0));
  }
  const cashTotal = [...byPaymentType.entries()].filter(([k]) => k.toLowerCase() === "cash").reduce((s, [, v]) => s + v, 0);
  const cardTotal = [...byPaymentType.entries()].filter(([k]) => k.toLowerCase() === "card").reduce((s, [, v]) => s + v, 0);
  const onlineTotal = [...byPaymentType.entries()].filter(([k]) => k.toLowerCase() === "online").reduce((s, [, v]) => s + v, 0);
  const otherTotal = [...byPaymentType.entries()].filter(([k]) => !["cash","card","online"].includes(k.toLowerCase())).reduce((s, [, v]) => s + v, 0);

  // VAT breakdown
  const completedItemTxIds = new Set(completedTx.map((tx) => tx.id));
  const completedItems = (items ?? []).filter((item) => completedItemTxIds.has(item.transaction_id));
  const vatByRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const item of completedItems) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = vatByRate.get(rate) ?? { net: 0, vat: 0, gross: 0 };
    entry.net += net; entry.vat += vat; entry.gross += gross;
    vatByRate.set(rate, entry);
  }

  // Top products
  const byProduct = new Map<string, number>();
  for (const item of completedItems) {
    byProduct.set(item.product_name, (byProduct.get(item.product_name) ?? 0) + Number(item.gross_amount ?? item.line_total ?? 0));
  }
  const topProducts = [...byProduct.entries()].sort(([,a],[,b]) => b - a).slice(0, 5);

  const generatedAt = formatAppDate(new Date().toISOString(), locale);
  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();
  const generatedBy = profile?.full_name || profile?.email || user.email || t.common.unknown;
  const referral = await ensureReferralCode(orgId).catch(() => ({
    available: false,
    link: null as string | null,
  }));
  const showReferralNudge = completedTx.length > 0 && Boolean(referral.link);
  return (
    <div className="space-y-6 p-6">
      <GrowthReportViewTracker />
      {referral.link && (
        <ZReportReferralNudge
          orgId={orgId}
          referralLink={referral.link}
          show={showReferralNudge}
        />
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{zp.title}</h1>
          <p className="text-sm text-slate-500">{zp.subtitle}</p>
        </div>
        <div className="flex gap-3 items-center">
          <form className="flex gap-2">
            <input type="date" name="date" defaultValue={reportDate} max={today} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50">{zp.load}</button>
          </form>
          {countryCode === "RO" && (
            <RegistruDeCasaButton
              orgName={((org as { name?: string | null } | null)?.name) ?? "franchisetech"}
              currency={currency}
              openingCash={openingCash}
              movements={(cashMovements ?? []).map((m) => ({
                movement_type: m.movement_type,
                amount: m.amount,
                reason: m.reason,
                performed_at: m.performed_at,
              }))}
              cashSales={cashTotal}
              expectedCash={openingCash + cashTotal + cashInTotal - cashOutTotal}
              userName={generatedBy}
              dateStart={dayStart}
              dateEnd={dayEnd}
            />
          )}
          <PrintButton />
        </div>
      </div>

      {/* Report header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 print:border-0">
        <div className="flex flex-wrap gap-8 text-sm">
          <div><p className="text-slate-500">{zp.business}</p><p className="font-semibold text-slate-900">{((org as { name?: string | null } | null)?.name) ?? "franchisetech"}</p></div>
          <div><p className="text-slate-500">{zp.reportDate}</p><p className="font-semibold text-slate-900">{reportDate}</p></div>
          <div><p className="text-slate-500">{zp.generatedAt}</p><p className="font-semibold text-slate-900">{generatedAt}</p></div>
          <div><p className="text-slate-500">{zp.generatedBy}</p><p className="font-semibold text-slate-900">{generatedBy}</p></div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{t.transactions.title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{completedTx.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{zp.netSales}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatMoney(totalNet || (totalGross - totalVat), currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{zp.vatCollected}</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-blue-600">{formatMoney(totalVat, currency)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{zp.grossExTips}</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-green-600">{formatMoney(grossExTips, currency)}</CardContent></Card>
      </div>
      {totalTips > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap gap-8 text-sm">
            <div><p className="text-slate-500">{t.reportPages.sales.grossExTipsShort}</p><p className="text-xl font-semibold text-slate-900">{formatMoney(grossExTips, currency)}</p></div>
            <div><p className="text-slate-500">{t.reportPages.sales.tipsCollected}</p><p className="text-xl font-semibold text-amber-700">{formatMoney(totalTips, currency)}</p></div>
            <div><p className="text-slate-500">{t.reportPages.sales.totalCollected}</p><p className="text-xl font-bold text-slate-900">{formatMoney(totalGross, currency)}</p></div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment breakdown */}
        <Card>
          <CardHeader><CardTitle>{zp.paymentBreakdown}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b text-sm"><span className="text-slate-600">{t.common.cash}</span><strong>{formatMoney(cashTotal, currency)}</strong></div>
            <div className="flex justify-between py-2 border-b text-sm"><span className="text-slate-600">{t.common.card}</span><strong>{formatMoney(cardTotal, currency)}</strong></div>
            <div className="flex justify-between py-2 border-b text-sm"><span className="text-slate-600">{zp.online}</span><strong>{formatMoney(onlineTotal, currency)}</strong></div>
            {otherTotal > 0 && <div className="flex justify-between py-2 border-b text-sm"><span className="text-slate-600">{zp.other}</span><strong>{formatMoney(otherTotal, currency)}</strong></div>}
            <div className="flex justify-between py-2 text-base font-bold"><span>{t.reportPages.sales.totalCollected}</span><span>{formatMoney(totalGross, currency)}</span></div>
          </CardContent>
        </Card>

        {/* VAT breakdown */}
        <Card>
          <CardHeader><CardTitle>{zp.vatBreakdown}</CardTitle></CardHeader>
          <CardContent>
            {vatByRate.size === 0 ? (
              <p className="text-sm text-slate-400">{zp.noVatData}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{zp.rate}</TableHead>
                    <TableHead className="text-right">{t.tables.net}</TableHead>
                    <TableHead className="text-right">{t.tables.vat}</TableHead>
                    <TableHead className="text-right">{t.tables.gross}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(vatByRate.entries()).sort(([a],[b]) => a - b).map(([rate, v]) => (
                    <TableRow key={rate}>
                      <TableCell><Badge variant="outline">{rate}%</Badge></TableCell>
                      <TableCell className="text-right">{formatMoney(v.net, currency)}</TableCell>
                      <TableCell className="text-right">{formatMoney(v.vat, currency)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(v.gross, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Void / refund count */}
      <Card>
        <CardHeader><CardTitle>{zp.adjustments}</CardTitle></CardHeader>
        <CardContent className="flex gap-8 text-sm">
          <div><p className="text-slate-500">{zp.voids}</p><p className="text-xl font-bold text-red-600">{voidedTx.length}</p></div>
          <div><p className="text-slate-500">{zp.refunds}</p><p className="text-xl font-bold text-amber-600">0 <span className="text-sm font-normal text-slate-400">{zp.comingSoon}</span></p></div>
        </CardContent>
      </Card>

      {/* Top products */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{zp.topProducts}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t.tables.product}</TableHead><TableHead className="text-right">{t.tables.total}</TableHead></TableRow></TableHeader>
              <TableBody>
                {topProducts.map(([name, total]) => (
                  <TableRow key={name}><TableCell>{name}</TableCell><TableCell className="text-right font-medium">{formatMoney(total, currency)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Cash in / out movements */}
      {(cashMovements ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{zp.cashMovements}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='rounded-lg bg-green-50 border border-green-200 p-3'>
                <p className='text-xs text-slate-500'>{zp.cashInTotal}</p>
                <p className='text-xl font-bold text-green-700'>{formatMoney(cashInTotal, currency)}</p>
              </div>
              <div className='rounded-lg bg-red-50 border border-red-200 p-3'>
                <p className='text-xs text-slate-500'>{zp.cashOutTotal}</p>
                <p className='text-xl font-bold text-red-600'>{formatMoney(cashOutTotal, currency)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{zp.type}</TableHead>
                  <TableHead>{zp.reason}</TableHead>
                  <TableHead>{zp.time}</TableHead>
                  <TableHead className='text-right'>{t.tables.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(cashMovements ?? []).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span className={m.movement_type === 'cash_in' ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                        {m.movement_type === 'cash_in' ? zp.cashIn : zp.cashOut}
                      </span>
                    </TableCell>
                    <TableCell className='text-slate-600'>{m.reason ?? '—'}</TableCell>
                    <TableCell className='text-xs text-slate-400'>
                      {m.performed_at ? new Intl.DateTimeFormat(intlLocaleForApp(locale), { timeStyle: "short" }).format(new Date(m.performed_at)) : "—"}
                    </TableCell>
                    <TableCell className='text-right font-medium tabular-nums'>
                      {formatMoney(Math.abs(Number(m.amount ?? 0)), currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Cash reconciliation */}
      <ZReportCashForm expectedCash={cashTotal} reportDate={reportDate} orgId={orgId} currency={currency} />

      {/* Manager sign-off */}
      <Card className="print:block">
        <CardHeader><CardTitle>{zp.managerSignoff}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8 mt-4 text-sm print:grid-cols-2">
            <div>
              <p className="text-slate-500 mb-8">{zp.managerSignature}</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-slate-400 mt-2">{zp.nameDate}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-8">{zp.countedBy}</p>
              <div className="border-b border-slate-400 w-full" />
              <p className="text-slate-400 mt-2">{zp.nameDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
