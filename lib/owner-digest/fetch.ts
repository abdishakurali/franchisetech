import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppLocale } from "@/lib/app-i18n";
import { resolveAppLocale } from "@/lib/app-locale";
import type { OwnerDigestAttention, OwnerDigestData } from "@/lib/owner-digest/build";
import { addCalendarDays, zonedDayStartUtc, zonedParts } from "@/lib/owner-digest/schedule";

type FetchParams = {
  orgId: string;
  orgName: string;
  countryCode: string | null;
  currency: string;
  frequency: "daily" | "weekly";
  timeZone: string;
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
    return fmt.format(end);
  }
  const end = new Date(rangeEnd.getTime() - 1);
  return `${fmt.format(rangeStart)} – ${fmt.format(end)}`;
}

function getSalesRange(
  frequency: "daily" | "weekly",
  timeZone: string,
  referenceNow: Date
): { rangeStart: Date; rangeEnd: Date } {
  const p = zonedParts(referenceNow, timeZone);
  const todayStart = zonedDayStartUtc(p.year, p.month, p.day, timeZone);

  if (frequency === "daily") {
    const y = addCalendarDays(p.year, p.month, p.day, -1);
    const rangeStart = zonedDayStartUtc(y.year, y.month, y.day, timeZone);
    return { rangeStart, rangeEnd: todayStart };
  }

  const weekStart = addCalendarDays(p.year, p.month, p.day, -7);
  const rangeStart = zonedDayStartUtc(weekStart.year, weekStart.month, weekStart.day, timeZone);
  return { rangeStart, rangeEnd: todayStart };
}

function getPriorRange(
  frequency: "daily" | "weekly",
  rangeStart: Date,
  timeZone: string
): { priorStart: Date; priorEnd: Date } {
  const p = zonedParts(rangeStart, timeZone);
  if (frequency === "daily") {
    const d = addCalendarDays(p.year, p.month, p.day, -1);
    const priorStart = zonedDayStartUtc(d.year, d.month, d.day, timeZone);
    return { priorStart, priorEnd: rangeStart };
  }
  const d = addCalendarDays(p.year, p.month, p.day, -7);
  const priorStart = zonedDayStartUtc(d.year, d.month, d.day, timeZone);
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

function dayKey(iso: string, timeZone: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { timeZone });
}

function buildDailySales(transactions: TxRow[], timeZone: string) {
  const map = new Map<string, { total: number; count: number }>();
  for (const tx of transactions) {
    const ts = txTimestamp(tx);
    if (!ts) continue;
    const key = dayKey(ts, timeZone);
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
        ? `${params.refundCount} rambursare(i) în perioadă.`
        : `${params.refundCount} refund(s) in this period.`,
    });
  }

  if (params.voidCount > 0) {
    items.push({
      severity: "warning",
      message: ro
        ? `${params.voidCount} anulare(i) în perioadă.`
        : `${params.voidCount} void(s) in this period.`,
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
    referenceNow = new Date(),
  } = params;

  const locale = resolveAppLocale({ orgCountryCode: countryCode });
  const { rangeStart, rangeEnd } = getSalesRange(frequency, timeZone, referenceNow);
  const { priorStart, priorEnd } = getPriorRange(frequency, rangeStart, timeZone);
  const periodLabel = formatPeriodLabel(frequency, rangeStart, rangeEnd, locale);

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
      .select("expected_cash,counted_cash,cash_difference,closed_at,notes")
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

  const session = sessionResult.data;
  const tillOpen = session?.status === "open";
  const expectedCash = Number(session?.expected_cash ?? 0);

  const closedSessions = closedSessionsResult.data ?? [];
  const dailyCloses = dailyCloseResult.data ?? [];
  const closesInPeriod = Math.max(closedSessions.length, dailyCloses.length);

  const lastCloseSource = closedSessions[0] ?? dailyCloses[0] ?? null;
  const lastCloseRaw = lastCloseSource as Record<string, unknown> | null;
  const lastClose = lastCloseRaw
    ? {
        date: lastCloseRaw.closed_at
          ? String(lastCloseRaw.closed_at).slice(0, 10)
          : lastCloseRaw.close_date
            ? String(lastCloseRaw.close_date)
            : "",
        expectedCash: Number(lastCloseRaw.expected_cash ?? 0),
        countedCash: Number(lastCloseRaw.counted_cash ?? 0),
        cashDifference: Number(
          lastCloseRaw.cash_difference ??
            Number(lastCloseRaw.counted_cash ?? 0) - Number(lastCloseRaw.expected_cash ?? 0)
        ),
        notes: (lastCloseRaw.notes as string | null) ?? null,
      }
    : null;

  const cashDifferenceTotal = closedSessions.reduce(
    (s, row) => s + Math.abs(Number(row.cash_difference ?? 0)),
    0
  );

  const txIds = (txResult.data ?? []).map((t) => (t as { id: string }).id).filter(Boolean);
  let topProducts: OwnerDigestData["topProducts"] = [];
  if (txIds.length > 0) {
    const { data: items } = await supabase
      .from("pos_transaction_items")
      .select("product_name,quantity,gross_amount,line_total")
      .eq("organisation_id", orgId)
      .in("transaction_id", txIds);

    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const item of items ?? []) {
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
    frequency === "weekly" ? buildDailySales(transactions, timeZone) : [];
  const tradingDays = dailySales.length;
  const busiestDay = dailySales[0] ?? null;

  const attentionItems = buildAttention({
    locale,
    tillOpen,
    lowStockCount: lowStockItems.length,
    lastCloseDiff: lastClose?.cashDifference ?? null,
    refundCount,
    voidCount,
    closesInPeriod,
    salesCount: current.salesCount,
    currency,
  });

  return {
    orgName,
    locale,
    currency,
    periodLabel,
    frequency,
    salesTotal: current.salesTotal,
    salesCount: current.salesCount,
    cashTotal: current.cashTotal,
    cardTotal: current.cardTotal,
    onlineTotal: current.onlineTotal,
    otherTotal: current.otherTotal,
    vatTotal: current.vatTotal,
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
    tradingDays,
    busiestDay,
    attentionItems,
    allClear: attentionItems.length === 0,
  };
}
