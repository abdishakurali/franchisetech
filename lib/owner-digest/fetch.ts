import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppLocale } from "@/lib/app-i18n";
import { resolveAppLocale } from "@/lib/app-locale";
import type { OwnerDigestAttention, OwnerDigestData, OwnerDigestVatBreakdown } from "@/lib/owner-digest/build";
import { addCalendarDays, zonedParts } from "@/lib/owner-digest/schedule";

type FetchParams = {
  orgId: string;
  orgName: string;
  countryCode: string | null;
  currency: string;
  frequency: "daily" | "weekly";
  timeZone: string;
  businessDayCutoffTime?: string | null;
  referenceNow?: Date;
};

type TxRow = {
  total: number | string | null;
  tax_total?: number | string | null;
  tip_amount?: number | string | null;
  sold_at?: string | null;
  created_at?: string | null;
  status?: string | null;
  payment_methods: { type?: string } | { type?: string }[] | null;
};

type TxItemRow = {
  product_name: string | null;
  quantity: number | string | null;
  gross_amount: number | string | null;
  line_total: number | string | null;
  net_amount: number | string | null;
  vat_amount: number | string | null;
  vat_rate: number | string | null;
};

type ClosedSessionRow = {
  expected_cash?: number | string | null;
  counted_cash?: number | string | null;
  cash_difference?: number | string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  notes?: string | null;
};

type DailyCloseRow = {
  close_date?: string | null;
  expected_cash?: number | string | null;
  counted_cash?: number | string | null;
  cash_difference?: number | string | null;
  notes?: string | null;
};

function parseCutoff(time: string | null | undefined): { hour: number; minute: number } {
  const [rawHour, rawMinute] = String(time || "04:00").slice(0, 5).split(":").map(Number);
  const hour = Number.isFinite(rawHour) ? Math.min(23, Math.max(0, rawHour)) : 4;
  const minute = Number.isFinite(rawMinute) ? Math.min(59, Math.max(0, rawMinute)) : 0;
  return { hour, minute };
}

function zonedDateTimeUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const base = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let offsetHours = -14; offsetHours <= 14; offsetHours++) {
    const d = new Date(base + offsetHours * 3_600_000);
    const p = zonedParts(d, timeZone);
    if (p.year === year && p.month === month && p.day === day && p.hour === hour && p.minute === minute) {
      return d;
    }
  }
  return new Date(base);
}

function formatPeriodLabel(
  frequency: "daily" | "weekly",
  rangeStart: Date,
  rangeEnd: Date,
  locale: AppLocale
): string {
  const fmt = new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (frequency === "daily") {
    const end = new Date(rangeEnd.getTime() - 1);
    const startLabel = fmt.format(rangeStart);
    const endLabel = fmt.format(end);
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }
  const end = new Date(rangeEnd.getTime() - 1);
  return `${fmt.format(rangeStart)} – ${fmt.format(end)}`;
}

function formatPeriodDetailLabel(
  rangeStart: Date,
  rangeEnd: Date,
  locale: AppLocale,
  timeZone: string
): string {
  const ro = locale === "ro";
  const dateFmt = new Intl.DateTimeFormat(ro ? "ro-RO" : "en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  });
  const timeFmt = new Intl.DateTimeFormat(ro ? "ro-RO" : "en-IE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
  const endInclusive = new Date(rangeEnd.getTime() - 60_000);
  const start = `${dateFmt.format(rangeStart)} ${timeFmt.format(rangeStart)}`;
  const end = `${dateFmt.format(endInclusive)} ${timeFmt.format(endInclusive)}`;
  return `${start} – ${end} (${timeZone})`;
}

function getSalesRange(
  frequency: "daily" | "weekly",
  timeZone: string,
  businessDayCutoffTime: string | null | undefined,
  referenceNow: Date
): { rangeStart: Date; rangeEnd: Date } {
  const cutoff = parseCutoff(businessDayCutoffTime);
  const p = zonedParts(referenceNow, timeZone);
  const todayCutoff = zonedDateTimeUtc(p.year, p.month, p.day, cutoff.hour, cutoff.minute, timeZone);
  const currentStartParts =
    referenceNow.getTime() < todayCutoff.getTime()
      ? addCalendarDays(p.year, p.month, p.day, -1)
      : { year: p.year, month: p.month, day: p.day };
  const currentOperationalStart = zonedDateTimeUtc(
    currentStartParts.year,
    currentStartParts.month,
    currentStartParts.day,
    cutoff.hour,
    cutoff.minute,
    timeZone
  );
  const currentStartLocal = zonedParts(currentOperationalStart, timeZone);

  if (frequency === "daily") {
    const startDay = addCalendarDays(currentStartLocal.year, currentStartLocal.month, currentStartLocal.day, -1);
    return {
      rangeStart: zonedDateTimeUtc(startDay.year, startDay.month, startDay.day, cutoff.hour, cutoff.minute, timeZone),
      rangeEnd: currentOperationalStart,
    };
  }

  const startDay = addCalendarDays(currentStartLocal.year, currentStartLocal.month, currentStartLocal.day, -7);
  return {
    rangeStart: zonedDateTimeUtc(startDay.year, startDay.month, startDay.day, cutoff.hour, cutoff.minute, timeZone),
    rangeEnd: currentOperationalStart,
  };
}

function getPriorRange(
  frequency: "daily" | "weekly",
  rangeStart: Date,
  rangeEnd: Date,
  businessDayCutoffTime: string | null | undefined,
  timeZone: string
): { priorStart: Date; priorEnd: Date } {
  const cutoff = parseCutoff(businessDayCutoffTime);
  const p = zonedParts(rangeStart, timeZone);
  const endParts = zonedParts(rangeEnd, timeZone);
  if (frequency === "daily") {
    const startDay = addCalendarDays(p.year, p.month, p.day, -7);
    const endDay = addCalendarDays(endParts.year, endParts.month, endParts.day, -7);
    return {
      priorStart: zonedDateTimeUtc(startDay.year, startDay.month, startDay.day, cutoff.hour, cutoff.minute, timeZone),
      priorEnd: zonedDateTimeUtc(endDay.year, endDay.month, endDay.day, cutoff.hour, cutoff.minute, timeZone),
    };
  }
  const d = addCalendarDays(p.year, p.month, p.day, -7);
  const priorStart = zonedDateTimeUtc(d.year, d.month, d.day, cutoff.hour, cutoff.minute, timeZone);
  return { priorStart, priorEnd: rangeStart };
}

function txTimestamp(tx: TxRow): string {
  return tx.sold_at ?? tx.created_at ?? "";
}

function paymentType(tx: TxRow): string {
  const pm = tx.payment_methods;
  const row = Array.isArray(pm) ? pm[0] : pm;
  return row?.type ?? "other";
}

function aggregateSales(transactions: TxRow[]) {
  let salesTotal = 0;
  let vatTotal = 0;
  let cashTotal = 0;
  let cardTotal = 0;
  let onlineTotal = 0;
  let otherTotal = 0;

  for (const tx of transactions) {
    const total = Number(tx.total ?? 0);
    salesTotal += total;
    vatTotal += Number(tx.tax_total ?? 0);
    const type = paymentType(tx);
    if (type === "cash") cashTotal += total;
    else if (type === "card") cardTotal += total;
    else if (type === "online") onlineTotal += total;
    else otherTotal += total;
  }

  return {
    salesTotal,
    salesCount: transactions.length,
    vatTotal,
    cashTotal,
    cardTotal,
    onlineTotal,
    otherTotal,
    avgTicket: transactions.length ? salesTotal / transactions.length : 0,
  };
}

function dayKey(iso: string, timeZone: string, businessDayCutoffTime?: string | null): string {
  const d = new Date(iso);
  const cutoff = parseCutoff(businessDayCutoffTime);
  const p = zonedParts(d, timeZone);
  const mins = p.hour * 60 + p.minute;
  const cutoffMins = cutoff.hour * 60 + cutoff.minute;
  const operationalDay = mins < cutoffMins ? addCalendarDays(p.year, p.month, p.day, -1) : p;
  return `${operationalDay.year}-${String(operationalDay.month).padStart(2, "0")}-${String(operationalDay.day).padStart(2, "0")}`;
}

function buildDailySales(transactions: TxRow[], timeZone: string, businessDayCutoffTime?: string | null) {
  const map = new Map<string, { total: number; count: number }>();
  for (const tx of transactions) {
    const ts = txTimestamp(tx);
    if (!ts) continue;
    const key = dayKey(ts, timeZone, businessDayCutoffTime);
    const cur = map.get(key) ?? { total: 0, count: 0 };
    cur.total += Number(tx.total ?? 0);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => b.total - a.total);
}

function salesChangePct(current: number, prior: number): number | null {
  if (prior <= 0) return null;
  return ((current - prior) / prior) * 100;
}

function buildVatBreakdown(items: TxItemRow[]): OwnerDigestVatBreakdown[] {
  const map = new Map<number, { netAmount: number; vatCollected: number }>();
  for (const item of items) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? (gross - vat));
    const cur = map.get(rate) ?? { netAmount: 0, vatCollected: 0 };
    cur.netAmount += net;
    cur.vatCollected += vat;
    map.set(rate, cur);
  }
  return [...map.entries()]
    .map(([rate, v]) => ({
      rate,
      netAmount: Number(v.netAmount.toFixed(2)),
      vatCollected: Number(v.vatCollected.toFixed(2)),
    }))
    .sort((a, b) => a.rate - b.rate);
}

function formatTimestamp(iso: string | null | undefined, locale: AppLocale, timeZone: string): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-IE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(iso));
}

function buildAttention(params: {
  locale: AppLocale;
  tillOpen: boolean;
  lowStockCount: number;
  lastCloseDiff: number | null;
  refundCount: number;
  voidCount: number;
  closesInPeriod: number;
  salesCount: number;
  currency: string;
  voidTotal: number;
  refundTotal: number;
}): OwnerDigestAttention[] {
  const ro = params.locale === "ro";
  const items: OwnerDigestAttention[] = [];

  if (params.tillOpen) {
    items.push({
      severity: "warning",
      message: ro
        ? "Casa este încă deschisă — verifică închiderea zilei când ești gata."
        : "Till is still open — remember to close when you're done for the day.",
    });
  }

  if (params.lowStockCount > 0) {
    items.push({
      severity: "warning",
      message: ro
        ? `${params.lowStockCount} articol(e) sub pragul de reaprovizionare.`
        : `${params.lowStockCount} item(s) at or below reorder level.`,
    });
  }

  if (params.lastCloseDiff != null && Math.abs(params.lastCloseDiff) >= 0.01) {
    const abs = Math.abs(params.lastCloseDiff).toFixed(2);
    items.push({
      severity: Math.abs(params.lastCloseDiff) > 5 ? "critical" : "warning",
      message: ro
        ? `Ultima închidere: diferență numerar ${params.lastCloseDiff >= 0 ? "+" : "−"}${abs} ${params.currency === "RON" ? "lei" : params.currency}.`
        : `Last till close: cash difference ${params.lastCloseDiff >= 0 ? "+" : "−"}${abs} ${params.currency}.`,
    });
  }

  if (params.refundCount > 0) {
    items.push({
      severity: "warning",
      message: ro
        ? `${params.refundCount} rambursare(i) în perioadă (${params.refundTotal.toFixed(2)} ${params.currency === "RON" ? "lei" : params.currency}).`
        : `${params.refundCount} refund(s) in this period (${params.refundTotal.toFixed(2)} ${params.currency}).`,
    });
  }

  if (params.voidCount > 0) {
    items.push({
      severity: "warning",
      message: ro
        ? `${params.voidCount} anulare(i) în perioadă (${params.voidTotal.toFixed(2)} ${params.currency === "RON" ? "lei" : params.currency}).`
        : `${params.voidCount} void(s) in this period (${params.voidTotal.toFixed(2)} ${params.currency}).`,
    });
  }

  if (params.salesCount > 0 && params.closesInPeriod === 0 && !params.tillOpen) {
    items.push({
      severity: "warning",
      message: ro
        ? "Au fost vânzări dar nicio închidere de casă înregistrată în perioadă."
        : "Sales recorded but no till close logged in this period.",
    });
  }

  return items;
}

export async function fetchOwnerDigestData(
  supabase: SupabaseClient,
  params: FetchParams
): Promise<OwnerDigestData> {
  const {
    orgId,
    orgName,
    countryCode,
    currency,
    frequency,
    timeZone,
    businessDayCutoffTime = "04:00",
    referenceNow = new Date(),
  } = params;

  const locale = resolveAppLocale({ orgCountryCode: countryCode });
  const { rangeStart, rangeEnd } = getSalesRange(frequency, timeZone, businessDayCutoffTime, referenceNow);
  const { priorStart, priorEnd } = getPriorRange(frequency, rangeStart, rangeEnd, businessDayCutoffTime, timeZone);
  const periodLabel = formatPeriodLabel(frequency, rangeStart, rangeEnd, locale);
  const periodDetailLabel = formatPeriodDetailLabel(rangeStart, rangeEnd, locale, timeZone);
  const priorPeriodLabel = formatPeriodLabel(frequency, priorStart, priorEnd, locale);

  const rangeIso = { start: rangeStart.toISOString(), end: rangeEnd.toISOString() };
  const priorIso = { start: priorStart.toISOString(), end: priorEnd.toISOString() };
  const pStart = zonedParts(rangeStart, timeZone);
  const pEnd = zonedParts(new Date(rangeEnd.getTime() - 1), timeZone);
  const rangeStartDate = `${pStart.year}-${String(pStart.month).padStart(2, "0")}-${String(pStart.day).padStart(2, "0")}`;
  const rangeEndDate = `${pEnd.year}-${String(pEnd.month).padStart(2, "0")}-${String(pEnd.day).padStart(2, "0")}`;

  const [
    txResult,
    priorTxResult,
    anomalyResult,
    sessionResult,
    closedSessionsResult,
    dailyCloseResult,
    productsResult,
  ] = await Promise.all([
    supabase
      .from("pos_transactions")
      .select("id,total,tax_total,tip_amount,sold_at,created_at,status,payment_methods(type)")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("sold_at", rangeIso.start)
      .lt("sold_at", rangeIso.end),
    supabase
      .from("pos_transactions")
      .select("total,sold_at,created_at,status,payment_methods(type)")
      .eq("organisation_id", orgId)
      .eq("status", "completed")
      .gte("sold_at", priorIso.start)
      .lt("sold_at", priorIso.end),
    supabase
      .from("pos_transactions")
      .select("total,status")
      .eq("organisation_id", orgId)
      .in("status", ["voided", "refunded"])
      .gte("sold_at", rangeIso.start)
      .lt("sold_at", rangeIso.end),
    supabase
      .from("pos_sessions")
      .select("expected_cash,status,opened_at")
      .eq("organisation_id", orgId)
      .eq("status", "open")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pos_sessions")
      .select("expected_cash,counted_cash,cash_difference,opened_at,closed_at,notes")
      .eq("organisation_id", orgId)
      .eq("status", "closed")
      .gte("closed_at", rangeIso.start)
      .lt("closed_at", rangeIso.end)
      .order("closed_at", { ascending: false }),
    supabase
      .from("pos_daily_close")
      .select("close_date,expected_cash,counted_cash,cash_difference,notes")
      .eq("organisation_id", orgId)
      .gte("close_date", rangeStartDate)
      .lte("close_date", rangeEndDate)
      .order("close_date", { ascending: false }),
    supabase
      .from("products")
      .select("id,name,current_stock_qty,reorder_level,unit_of_measure")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .or("is_stock_tracked.eq.true,is_ingredient.eq.true"),
  ]);

  const transactions = (txResult.data ?? []) as TxRow[];
  const priorTransactions = (priorTxResult.data ?? []) as TxRow[];
  const current = aggregateSales(transactions);
  const prior = aggregateSales(priorTransactions);

  const anomalies = anomalyResult.data ?? [];
  const refundRows = anomalies.filter((t) => t.status === "refunded");
  const voidRows = anomalies.filter((t) => t.status === "voided");
  const refundCount = refundRows.length;
  const refundTotal = refundRows.reduce((s, t) => s + Number(t.total ?? 0), 0);
  const voidCount = voidRows.length;
  const voidTotal = voidRows.reduce((s, t) => s + Math.abs(Number(t.total ?? 0)), 0);

  const session = sessionResult.data;
  const tillOpen = session?.status === "open";
  const expectedCash = Number(session?.expected_cash ?? 0);

  const closedSessions = (closedSessionsResult.data ?? []) as ClosedSessionRow[];
  const dailyCloses = (dailyCloseResult.data ?? []) as DailyCloseRow[];
  const closesInPeriod = Math.max(closedSessions.length, dailyCloses.length);

  const lastCloseSource = closedSessions[0] ?? dailyCloses[0] ?? null;
  const lastClose = lastCloseSource
    ? {
        date: "closed_at" in lastCloseSource && lastCloseSource.closed_at
          ? String(lastCloseSource.closed_at).slice(0, 10)
          : "close_date" in lastCloseSource && lastCloseSource.close_date
            ? String(lastCloseSource.close_date)
            : "",
        openedAt: "opened_at" in lastCloseSource
          ? formatTimestamp(lastCloseSource.opened_at, locale, timeZone)
          : null,
        closedAt: "closed_at" in lastCloseSource
          ? formatTimestamp(lastCloseSource.closed_at, locale, timeZone)
          : null,
        expectedCash: Number(lastCloseSource.expected_cash ?? 0),
        countedCash: Number(lastCloseSource.counted_cash ?? 0),
        cashDifference: Number(
          lastCloseSource.cash_difference ??
            Number(lastCloseSource.counted_cash ?? 0) - Number(lastCloseSource.expected_cash ?? 0)
        ),
        notes: lastCloseSource.notes ?? null,
      }
    : null;

  const cashDifferenceTotal = closedSessions.reduce(
    (s, row) => s + Math.abs(Number(row.cash_difference ?? 0)),
    0
  );

  const txIds = (txResult.data ?? []).map((t) => (t as { id: string }).id).filter(Boolean);
  let topProducts: OwnerDigestData["topProducts"] = [];
  let vatBreakdown: OwnerDigestVatBreakdown[] = [];
  if (txIds.length > 0) {
    const { data: items } = await supabase
      .from("pos_transaction_items")
      .select("product_name,quantity,gross_amount,line_total,net_amount,vat_amount,vat_rate")
      .eq("organisation_id", orgId)
      .in("transaction_id", txIds);

    const itemRows = (items ?? []) as TxItemRow[];
    vatBreakdown = buildVatBreakdown(itemRows);
    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const item of itemRows) {
      const name = String(item.product_name ?? "—");
      const cur = productMap.get(name) ?? { qty: 0, revenue: 0 };
      cur.qty += Number(item.quantity ?? 0);
      cur.revenue += Number(item.gross_amount ?? item.line_total ?? 0);
      productMap.set(name, cur);
    }
    topProducts = [...productMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  const products = productsResult.data ?? [];
  const allStockRows = products.map((p) => {
    const currentQty = Number(p.current_stock_qty ?? 0);
    const reorderLevel = Number(p.reorder_level ?? 0);
    const isLow = reorderLevel > 0 && currentQty <= reorderLevel;
    return {
      name: String(p.name ?? "—"),
      currentQty,
      reorderLevel,
      unit: String(p.unit_of_measure ?? "buc"),
      isLow,
    };
  });
  const lowStockItems = allStockRows.filter((r) => r.isLow);

  const dailySales =
    frequency === "weekly" ? buildDailySales(transactions, timeZone, businessDayCutoffTime) : [];
  const tradingDays = dailySales.length;
  const busiestDay = dailySales[0] ?? null;

  const attentionItems = buildAttention({
    locale,
    tillOpen,
    lowStockCount: lowStockItems.length,
    lastCloseDiff: lastClose?.cashDifference ?? null,
    refundCount,
    voidCount,
    voidTotal,
    refundTotal,
    closesInPeriod,
    salesCount: current.salesCount,
    currency,
  });

  return {
    orgName,
    locale,
    currency,
    periodLabel,
    periodDetailLabel,
    frequency,
    salesTotal: current.salesTotal,
    salesCount: current.salesCount,
    cashTotal: current.cashTotal,
    cardTotal: current.cardTotal,
    onlineTotal: current.onlineTotal,
    otherTotal: current.otherTotal,
    vatTotal: current.vatTotal,
    vatBreakdown,
    avgTicket: current.avgTicket,
    priorSalesTotal: prior.salesTotal,
    priorSalesCount: prior.salesCount,
    salesChangePct: salesChangePct(current.salesTotal, prior.salesTotal),
    tillOpen,
    expectedCash,
    trackedProducts: allStockRows.length,
    lowStockItems,
    allStockRows,
    topProducts,
    lastClose,
    closesInPeriod,
    cashDifferenceTotal,
    refundCount,
    refundTotal,
    voidCount,
    voidTotal,
    tradingDays,
    busiestDay,
    priorPeriodLabel,
    attentionItems,
    allClear: attentionItems.length === 0,
  };
}
