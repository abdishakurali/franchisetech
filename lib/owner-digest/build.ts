import type { AppLocale } from "@/lib/app-i18n";

export type OwnerDigestStockRow = {
  name: string;
  currentQty: number;
  reorderLevel: number;
  unit: string;
  isLow: boolean;
};

export type OwnerDigestTopProduct = {
  name: string;
  qty: number;
  revenue: number;
};

export type OwnerDigestClose = {
  date: string;
  expectedCash: number;
  countedCash: number;
  cashDifference: number;
  notes: string | null;
};

export type OwnerDigestAttention = {
  severity: "warning" | "critical";
  message: string;
};

export type OwnerDigestData = {
  orgName: string;
  locale: AppLocale;
  currency: string;
  periodLabel: string;
  frequency: "daily" | "weekly";
  salesTotal: number;
  salesCount: number;
  cashTotal: number;
  cardTotal: number;
  onlineTotal: number;
  otherTotal: number;
  vatTotal: number;
  avgTicket: number;
  priorSalesTotal: number;
  priorSalesCount: number;
  salesChangePct: number | null;
  tillOpen: boolean;
  expectedCash: number;
  trackedProducts: number;
  lowStockItems: OwnerDigestStockRow[];
  allStockRows: OwnerDigestStockRow[];
  topProducts: OwnerDigestTopProduct[];
  lastClose: OwnerDigestClose | null;
  closesInPeriod: number;
  cashDifferenceTotal: number;
  refundCount: number;
  refundTotal: number;
  voidCount: number;
  tradingDays: number;
  busiestDay: { date: string; total: number; count: number } | null;
  priorPeriodLabel: string;
  attentionItems: OwnerDigestAttention[];
  allClear: boolean;
};

function money(value: number, currency: string, locale: AppLocale): string {
  if (currency === "RON") return `${value.toFixed(2)} lei`;
  return new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-IE", {
    style: "currency",
    currency: currency || "EUR",
  }).format(value);
}

const RO_UNITS: Record<string, string> = {
  each: "buc",
  portion: "porție",
  kg: "kg",
  g: "g",
  litre: "l",
  liter: "l",
  l: "l",
  ml: "ml",
  cup: "cană",
  bottle: "sticlă",
  box: "cutie",
  case: "ladă",
  pack: "pachet",
  buc: "buc",
};

function formatUnit(unit: string, locale: AppLocale): string {
  if (locale !== "ro") return unit;
  const key = unit.toLowerCase().trim();
  return RO_UNITS[key] ?? unit;
}

function formatTrend(pct: number | null, locale: AppLocale, priorLabel: string): string {
  const ro = locale === "ro";
  if (pct == null) {
    return ro ? "fără vânzări în perioada anterioară" : "no sales in prior period";
  }
  const sign = pct >= 0 ? "+" : "";
  const label = ro ? `față de ${priorLabel}` : `vs ${priorLabel}`;
  return `${sign}${pct.toFixed(0)}% ${label}`;
}

function trendColor(pct: number | null): string {
  if (pct == null) return "#64748b";
  if (pct > 0) return "#15803d";
  if (pct < 0) return "#dc2626";
  return "#64748b";
}

function formatShortDate(isoDate: string, locale: AppLocale): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(locale === "ro" ? "ro-RO" : "en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function buildOwnerDigestSubject(data: OwnerDigestData): string {
  const low = data.lowStockItems.length;
  const flag = data.allClear ? "" : " ⚠";
  if (data.locale === "ro") {
    const period = data.frequency === "weekly" ? "săptămânal" : "zilnic";
    const lowPart = low > 0 ? `, ${low} sub stoc` : "";
    return `${data.orgName} — ${money(data.salesTotal, data.currency, data.locale)} (${period})${lowPart}${flag}`;
  }
  const period = data.frequency === "weekly" ? "weekly" : "daily";
  const lowPart = low > 0 ? `, ${low} low stock` : "";
  return `${data.orgName} — ${money(data.salesTotal, data.currency, data.locale)} (${period})${lowPart}${flag}`;
}

export function buildOwnerDigestTitle(data: OwnerDigestData): string {
  if (data.locale === "ro") {
    return data.frequency === "weekly"
      ? `Rezumat săptămânal — ${data.periodLabel}`
      : `Rezumat zilnic — ${data.periodLabel}`;
  }
  return data.frequency === "weekly"
    ? `Weekly summary — ${data.periodLabel}`
    : `Daily summary — ${data.periodLabel}`;
}

function buildHealthBanner(data: OwnerDigestData, ro: boolean): string {
  if (data.allClear) {
    return `
      <div style="background:#ecfdf5;border:1px solid #86efac;border-radius:10px;padding:14px 16px;margin:0 0 20px;">
        <p style="margin:0;font-size:15px;font-weight:700;color:#166534;">${ro ? "✓ Totul arată în regulă" : "✓ Everything looks on track"}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#15803d;">${ro
          ? `${data.salesCount} tranzacții · casă ${data.tillOpen ? "deschisă" : "închisă"} · stoc OK`
          : `${data.salesCount} transactions · till ${data.tillOpen ? "open" : "closed"} · stock OK`}</p>
      </div>`;
  }

  const rows = data.attentionItems
    .map(
      (item) => `
      <li style="margin:0 0 6px;font-size:13px;color:${item.severity === "critical" ? "#991b1b" : "#92400e"};">
        ${item.severity === "critical" ? "●" : "○"} ${item.message}
      </li>`
    )
    .join("");

  return `
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 16px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#92400e;">${ro ? "Necesită atenție" : "Needs attention"}</p>
      <ul style="margin:8px 0 0;padding-left:18px;">${rows}</ul>
    </div>`;
}

function buildSalesSection(data: OwnerDigestData, ro: boolean, m: (v: number) => string): string {
  const trend = formatTrend(data.salesChangePct, data.locale, data.priorPeriodLabel);
  const trendCol = trendColor(data.salesChangePct);

  const extraPayments =
    data.onlineTotal > 0 || data.otherTotal > 0
      ? `
      ${data.onlineTotal > 0 ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">${ro ? "Online" : "Online"}: ${m(data.onlineTotal)}</p>` : ""}
      ${data.otherTotal > 0 ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">${ro ? "Altele" : "Other"}: ${m(data.otherTotal)}</p>` : ""}`
      : "";

  const weeklyInsight =
    data.frequency === "weekly" && data.busiestDay
      ? `<p style="margin:8px 0 0;font-size:12px;color:#64748b;">${ro ? "Ziua cea mai bună" : "Best day"}: <strong>${formatShortDate(data.busiestDay.date, data.locale)}</strong> — ${m(data.busiestDay.total)} (${data.busiestDay.count} ${ro ? "tranz." : "tx"}) · ${data.tradingDays} ${ro ? "zile cu vânzări" : "trading days"}</p>`
      : "";

  return `
    <h2 style="font-size:16px;font-weight:600;color:#0f172a;margin:0 0 10px;">${ro ? "Vânzări" : "Sales"}</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="padding:14px;background:#f1f5f9;border-radius:8px;width:50%;">
          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Total perioadă" : "Period total"}</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#0f172a;">${m(data.salesTotal)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${trendCol};font-weight:600;">${trend}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.salesCount} ${ro ? "tranzacții" : "transactions"} · ${ro ? "medie" : "avg"} ${m(data.avgTicket)}</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:14px;background:#f1f5f9;border-radius:8px;width:50%;vertical-align:top;">
          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Încasări" : "Payments"}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;"><strong>${ro ? "Numerar" : "Cash"}:</strong> ${m(data.cashTotal)}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;"><strong>${ro ? "Card" : "Card"}:</strong> ${m(data.cardTotal)}</p>
          ${extraPayments}
          ${data.vatTotal > 0 ? `<p style="margin:8px 0 0;font-size:12px;color:#64748b;">TVA colectată: ${m(data.vatTotal)}</p>` : ""}
        </td>
      </tr>
    </table>
    ${weeklyInsight}
    ${data.priorSalesCount > 0 ? `<p style="margin:0 0 16px;font-size:12px;color:#94a3b8;">${ro ? "Perioada anterioară" : "Prior period"}: ${m(data.priorSalesTotal)} · ${data.priorSalesCount} ${ro ? "tranzacții" : "transactions"}</p>` : ""}`;
}

function buildCashSection(data: OwnerDigestData, ro: boolean, m: (v: number) => string): string {
  const tillLine = data.tillOpen
    ? (ro
      ? `Casă <strong>deschisă</strong> acum — așteptat în sertar: <strong>${m(data.expectedCash)}</strong>`
      : `Till is <strong>open</strong> — expected in drawer: <strong>${m(data.expectedCash)}</strong>`)
    : (ro ? "Casă <strong>închisă</strong>" : "Till is <strong>closed</strong>");

  let closeBlock = "";
  if (data.lastClose) {
    const diff = data.lastClose.cashDifference;
    const diffColor = Math.abs(diff) < 0.01 ? "#15803d" : diff > 0 ? "#b45309" : "#dc2626";
    const diffLabel =
      Math.abs(diff) < 0.01
        ? ro
          ? "Exact"
          : "Exact"
        : `${diff >= 0 ? "+" : "−"}${m(Math.abs(diff))}`;
    closeBlock = `
      <div style="margin-top:10px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;">
        <p style="margin:0 0 6px;font-weight:600;color:#0f172a;">${ro ? "Ultima închidere" : "Last till close"}${data.lastClose.date ? ` · ${data.lastClose.date}` : ""}</p>
        <p style="margin:0;color:#64748b;">${ro ? "Așteptat" : "Expected"} ${m(data.lastClose.expectedCash)} → ${ro ? "numărat" : "counted"} ${m(data.lastClose.countedCash)} · <span style="color:${diffColor};font-weight:600;">${diffLabel}</span></p>
        ${data.lastClose.notes ? `<p style="margin:6px 0 0;font-size:12px;color:#92400e;">${ro ? "Notă" : "Note"}: ${data.lastClose.notes}</p>` : ""}
      </div>`;
  } else if (!data.tillOpen && data.salesCount > 0) {
    closeBlock = `<p style="margin:10px 0 0;font-size:13px;color:#92400e;">${ro ? "Nicio închidere de casă înregistrată în această perioadă." : "No till close recorded in this period."}</p>`;
  }

  const closesSummary =
    data.closesInPeriod > 0
      ? `<p style="margin:8px 0 0;font-size:12px;color:#64748b;">${data.closesInPeriod} ${ro ? "închideri în perioadă" : "closes in period"}${data.cashDifferenceTotal > 0 ? ` · ${ro ? "diferențe totale" : "total differences"} ${m(data.cashDifferenceTotal)}` : ""}</p>`
      : "";

  return `
    <h2 style="font-size:16px;font-weight:600;color:#0f172a;margin:24px 0 10px;">${ro ? "Casă & numerar" : "Till & cash"}</h2>
    <p style="margin:0;font-size:14px;color:#334155;">${tillLine}</p>
    ${closeBlock}
    ${closesSummary}`;
}

function buildTopProductsSection(data: OwnerDigestData, ro: boolean, m: (v: number) => string): string {
  if (!data.topProducts.length) return "";

  const rows = data.topProducts
    .map(
      (p, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:24px;">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${p.name}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;">${p.qty.toFixed(0)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;">${m(p.revenue)}</td>
      </tr>`
    )
    .join("");

  return `
    <h2 style="font-size:16px;font-weight:600;color:#0f172a;margin:24px 0 10px;">${ro ? "Top produse" : "Top products"}</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <tr style="background:#f8fafc;">
        <th style="padding:8px;text-align:left;font-size:11px;color:#64748b;">#</th>
        <th style="padding:8px;text-align:left;font-size:11px;color:#64748b;">${ro ? "Produs" : "Product"}</th>
        <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;">${ro ? "Cant." : "Qty"}</th>
        <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;">${ro ? "Venit" : "Revenue"}</th>
      </tr>
      ${rows}
    </table>`;
}

function buildStockSection(data: OwnerDigestData, ro: boolean): string {
  if (data.lowStockItems.length === 0) {
    return `
      <h2 style="font-size:16px;font-weight:600;color:#0f172a;margin:24px 0 10px;">${ro ? "Stoc" : "Stock"}</h2>
      <p style="color:#15803d;font-size:14px;margin:0;">✓ ${ro ? `Tot stocul urmărit este OK (${data.trackedProducts} articole).` : `All tracked stock is OK (${data.trackedProducts} items).`}</p>`;
  }

  const stockRows = data.lowStockItems
    .map(
      (row) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${row.name}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;color:#dc2626;font-weight:600;">${row.currentQty.toFixed(2)} ${formatUnit(row.unit, data.locale)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;">${row.reorderLevel > 0 ? row.reorderLevel.toFixed(2) : "—"}</td>
      </tr>`
    )
    .join("");

  return `
    <h2 style="font-size:16px;font-weight:600;color:#0f172a;margin:24px 0 10px;">${ro ? "Stoc — de comandat" : "Stock — reorder"}</h2>
    <p style="color:#b45309;font-size:14px;margin:0 0 12px;"><strong>${data.lowStockItems.length}</strong> ${ro ? "articol(e) sub prag" : "item(s) at or below reorder level"}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <tr style="background:#f8fafc;">
        <th style="padding:8px;text-align:left;font-size:11px;color:#64748b;">${ro ? "Produs" : "Product"}</th>
        <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;">${ro ? "Stoc" : "On hand"}</th>
        <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;">${ro ? "Prag" : "Reorder"}</th>
      </tr>
      ${stockRows}
    </table>`;
}

export function buildOwnerDigestBodyHtml(data: OwnerDigestData): string {
  const ro = data.locale === "ro";
  const m = (v: number) => money(v, data.currency, data.locale);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";

  const ctas = `
    <p style="margin:28px 0 0;">
      <a href="${base}/app/reports/z-report" style="display:inline-block;background:#1d4ed8;color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:10px 18px;border-radius:8px;margin-right:8px;">${ro ? "Raport Z" : "Z-report"}</a>
      <a href="${base}/app" style="display:inline-block;background:#fff;color:#1d4ed8;font-weight:600;font-size:14px;text-decoration:none;padding:10px 18px;border-radius:8px;border:1px solid #1d4ed8;margin-right:8px;">${ro ? "Panou" : "Dashboard"}</a>
      <a href="${base}/app/stock?filter=low" style="display:inline-block;background:#fff;color:#1d4ed8;font-weight:600;font-size:14px;text-decoration:none;padding:10px 18px;border-radius:8px;border:1px solid #1d4ed8;">${ro ? "Stoc" : "Stock"}</a>
    </p>`;

  return `
    <p style="color:#64748b;font-size:14px;margin:0 0 16px;"><strong>${data.orgName}</strong></p>
    ${buildHealthBanner(data, ro)}
    ${buildSalesSection(data, ro, m)}
    ${buildCashSection(data, ro, m)}
    ${buildTopProductsSection(data, ro, m)}
    ${buildStockSection(data, ro)}
    ${ctas}`;
}

export function buildOwnerDigestFooter(data: OwnerDigestData): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";
  if (data.locale === "ro") {
    return `Primești acest rezumat pentru <strong>${data.orgName}</strong> conform programării din Setări → Notificări.<br>
      <a href="${base}/app/settings?tab=notifications" style="color:#3b82f6;">Modifică setările digest</a>`;
  }
  return `You receive this digest for <strong>${data.orgName}</strong> based on your schedule in Settings → Notifications.<br>
    <a href="${base}/app/settings?tab=notifications" style="color:#3b82f6;">Change digest settings</a>`;
}
