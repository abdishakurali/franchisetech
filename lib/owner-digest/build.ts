import type { AppLocale } from "@/lib/app-i18n";
import { esc } from "@/lib/email/layout";

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
  openedAt: string | null;
  closedAt: string | null;
  expectedCash: number;
  countedCash: number;
  cashDifference: number;
  notes: string | null;
};

export type OwnerDigestVatBreakdown = {
  rate: number;
  netAmount: number;
  vatCollected: number;
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
  periodDetailLabel: string;
  frequency: "daily" | "weekly";
  salesTotal: number;
  salesCount: number;
  cashTotal: number;
  cardTotal: number;
  onlineTotal: number;
  otherTotal: number;
  vatTotal: number;
  vatBreakdown: OwnerDigestVatBreakdown[];
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
  voidTotal: number;
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

function reportTypeLabel(data: OwnerDigestData, ro: boolean): string {
  if (ro) {
    return data.frequency === "daily"
      ? "Raport zilnic: ziua operațională completă"
      : "Raport săptămânal: ultimele 7 zile operaționale complete";
  }
  return data.frequency === "daily"
    ? "Daily report: completed operational day"
    : "Weekly report: last 7 completed operational days";
}

function dataQualityCopy(data: OwnerDigestData, ro: boolean): string {
  if (ro) {
    return data.frequency === "daily"
      ? "Nu include tura curentă. Datele respectă ora de tăiere operațională a businessului."
      : "Nu include tura curentă. Perioada folosește zile operaționale complete.";
  }
  return data.frequency === "daily"
    ? "Does not include the current shift. Data follows the business operational cutoff."
    : "Does not include the current shift. The period uses completed operational days.";
}

export function buildOwnerDigestSubject(data: OwnerDigestData): string {
  const low = data.lowStockItems.length;
  const flag = data.allClear ? "" : " ⚠";
  if (data.locale === "ro") {
    const period = data.frequency === "weekly" ? "săptămânal" : "ziua precedentă";
    const lowPart = low > 0 ? `, ${low} sub stoc` : "";
    return `${data.orgName} — ${money(data.salesTotal, data.currency, data.locale)} (${period})${lowPart}${flag}`;
  }
  const period = data.frequency === "weekly" ? "weekly" : "previous day";
  const lowPart = low > 0 ? `, ${low} low stock` : "";
  return `${data.orgName} — ${money(data.salesTotal, data.currency, data.locale)} (${period})${lowPart}${flag}`;
}

export function buildOwnerDigestTitle(data: OwnerDigestData): string {
  if (data.locale === "ro") {
    return data.frequency === "weekly"
      ? `Rezumat săptămânal — ${data.periodLabel}`
      : `Rezumat pentru ziua precedentă — ${data.periodLabel}`;
  }
  return data.frequency === "weekly"
    ? `Weekly summary — ${data.periodLabel}`
    : `Previous day summary — ${data.periodLabel}`;
}

function buildShiftStatusSection(data: OwnerDigestData, ro: boolean, m: (v: number) => string): string {
  const diff = data.lastClose?.cashDifference ?? null;
  const balanced = diff != null && Math.abs(diff) < 0.01;
  const hasDiscrepancy = (diff != null && !balanced) || data.voidCount > 0 || data.refundCount > 0 || data.tillOpen;
  const bg = hasDiscrepancy ? "#fff7ed" : "#ecfdf5";
  const border = hasDiscrepancy ? "#fed7aa" : "#86efac";
  const title = hasDiscrepancy ? (ro ? "Status tură — verifică" : "Shift status — check") : (ro ? "Status tură — în regulă" : "Shift status — clear");
  const titleColor = hasDiscrepancy ? "#9a3412" : "#166534";
  const diffText =
    diff == null
      ? ro ? "Fără închidere în perioadă" : "No close in period"
      : balanced
        ? ro ? "Exact" : "Exact"
        : `${diff >= 0 ? "+" : "-"}${m(Math.abs(diff))}`;

  return `
    <div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="margin:0 0 12px;font-size:15px;font-weight:800;color:${titleColor};">${title}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px;background:#ffffff;border-radius:8px;width:50%;vertical-align:top;">
            <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Discrepanță casă" : "Cash discrepancy"}</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:${balanced ? "#166534" : "#9a3412"};">${diffText}</p>
            ${data.lastClose ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">${ro ? "Așteptat" : "Expected"} ${m(data.lastClose.expectedCash)} · ${ro ? "numărat" : "counted"} ${m(data.lastClose.countedCash)}</p>` : ""}
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px;background:#ffffff;border-radius:8px;width:50%;vertical-align:top;">
            <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Casa curentă" : "Current till"}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#0f172a;"><strong>${data.tillOpen ? (ro ? "Deschis acum" : "Open now") : (ro ? "Închis" : "Closed")}</strong></p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${ro ? "Deschis" : "Opened"}: ${esc(data.lastClose?.openedAt ?? "—")}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${ro ? "Închis" : "Closed"}: ${esc(data.lastClose?.closedAt ?? "—")}</p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
        <tr>
          <td style="padding:10px;background:#ffffff;border-radius:8px;width:50%;">
            <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Anulări / voids" : "Voids"}</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:${data.voidCount > 0 ? "#9a3412" : "#166534"};">${data.voidCount} · ${m(data.voidTotal)}</p>
          </td>
          <td style="width:8px;"></td>
          <td style="padding:10px;background:#ffffff;border-radius:8px;width:50%;">
            <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Retururi" : "Refunds"}</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:${data.refundCount > 0 ? "#9a3412" : "#166534"};">${data.refundCount} · ${m(data.refundTotal)}</p>
          </td>
        </tr>
      </table>
    </div>`;
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
        ${item.severity === "critical" ? "●" : "○"} ${esc(item.message)}
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
          <p style="margin:4px 0 0;font-size:12px;color:${trendCol};font-weight:600;">${esc(trend)}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${data.salesCount} ${ro ? "tranzacții" : "transactions"} · ${ro ? "medie" : "avg"} ${m(data.avgTicket)}</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:14px;background:#f1f5f9;border-radius:8px;width:50%;vertical-align:top;">
          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;">${ro ? "Încasări" : "Payments"}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;"><strong>${ro ? "Numerar" : "Cash"}:</strong> ${m(data.cashTotal)}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;"><strong>${ro ? "Card" : "Card"}:</strong> ${m(data.cardTotal)}</p>
          ${extraPayments}
        </td>
      </tr>
    </table>
    ${weeklyInsight}
    ${data.priorSalesCount > 0 ? `<p style="margin:0 0 16px;font-size:12px;color:#94a3b8;">${ro ? "Perioada anterioară" : "Prior period"}: ${m(data.priorSalesTotal)} · ${data.priorSalesCount} ${ro ? "tranzacții" : "transactions"}</p>` : ""}`;
}

function buildVatSection(data: OwnerDigestData, ro: boolean, m: (v: number) => string): string {
  if (!data.vatBreakdown.length) return "";
  const rows = data.vatBreakdown
    .map(
      (row) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">TVA ${row.rate.toFixed(row.rate % 1 === 0 ? 0 : 2)}%</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;">${m(row.netAmount)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;">${m(row.vatCollected)}</td>
      </tr>`
    )
    .join("");

  return `
    <h2 style="font-size:16px;font-weight:600;color:#0f172a;margin:24px 0 10px;">${ro ? "TVA pe cote" : "VAT by rate"}</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <tr style="background:#f8fafc;">
        <th style="padding:8px;text-align:left;font-size:11px;color:#64748b;">${ro ? "Cotă" : "Rate"}</th>
        <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;">${ro ? "Net" : "Net"}</th>
        <th style="padding:8px;text-align:right;font-size:11px;color:#64748b;">${ro ? "TVA colectată" : "VAT collected"}</th>
      </tr>
      ${rows}
    </table>`;
}

function buildTopProductsSection(data: OwnerDigestData, ro: boolean, m: (v: number) => string): string {
  if (!data.topProducts.length) return "";

  const rows = data.topProducts
    .map(
      (p, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:24px;">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${esc(p.name)}</td>
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
      <p style="color:#15803d;font-size:14px;margin:0;">✓ ${ro ? `Stocul urmărit este OK (${data.trackedProducts} articole).` : `Tracked stock is OK (${data.trackedProducts} items).`}</p>
      <p style="color:#64748b;font-size:12px;margin:6px 0 0;">${ro ? "Articolele fără urmărire stoc nu intră în această alertă." : "Items without stock tracking are not included in this alert."}</p>`;
  }

  const stockRows = data.lowStockItems
    .map(
      (row) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;">${esc(row.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;color:#dc2626;font-weight:600;">${row.currentQty.toFixed(2)} ${esc(formatUnit(row.unit, data.locale))}</td>
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
  const statusLabel = data.allClear ? (ro ? "În regulă" : "On track") : (ro ? "Atenție" : "Attention");
  const statusColor = data.allClear ? "#166534" : "#92400e";
  const statusBg = data.allClear ? "#dcfce7" : "#fef3c7";

  const ctas = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        <td style="padding:0 8px 8px 0;">
          <a href="${base}/app/reports/z-report" style="display:block;background:#0f172a;color:#fff;font-weight:700;font-size:14px;text-align:center;text-decoration:none;padding:12px 14px;border-radius:8px;">${ro ? "Vezi Raport Z" : "View Z-report"}</a>
        </td>
        <td style="padding:0 8px 8px 0;">
          <a href="${base}/app" style="display:block;background:#fff;color:#0f172a;font-weight:700;font-size:14px;text-align:center;text-decoration:none;padding:12px 14px;border-radius:8px;border:1px solid #cbd5e1;">${ro ? "Azi până acum" : "Today so far"}</a>
        </td>
        <td style="padding:0 0 8px 0;">
          <a href="${base}/app/stock?filter=low" style="display:block;background:#fff;color:#0f172a;font-weight:700;font-size:14px;text-align:center;text-decoration:none;padding:12px 14px;border-radius:8px;border:1px solid #cbd5e1;">${ro ? "Stoc" : "Stock"}</a>
        </td>
      </tr>
    </table>`;

  return `
    <div style="background:#0f172a;border-radius:12px;padding:18px 18px 16px;margin:0 0 18px;">
      <p style="margin:0 0 10px;color:#cbd5e1;font-size:13px;"><strong style="color:#fff;">${esc(data.orgName)}</strong> · ${esc(reportTypeLabel(data, ro))}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:bottom;">
            <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">${ro ? "Vânzări raportate" : "Reported sales"}</p>
            <p style="margin:4px 0 0;color:#ffffff;font-size:30px;font-weight:800;line-height:1.1;">${m(data.salesTotal)}</p>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">${data.salesCount} ${ro ? "tranzacții" : "transactions"} · ${ro ? "bon mediu" : "avg ticket"} ${m(data.avgTicket)}</p>
          </td>
          <td align="right" style="vertical-align:top;">
            <span style="display:inline-block;background:${statusBg};color:${statusColor};font-size:12px;font-weight:800;padding:6px 10px;border-radius:999px;">${statusLabel}</span>
          </td>
        </tr>
      </table>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin:0 0 18px;">
      <p style="margin:0;font-size:13px;font-weight:800;color:#0f172a;">${ro ? "Perioadă raportată" : "Reported period"}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#334155;">${esc(data.periodDetailLabel)}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${esc(dataQualityCopy(data, ro))}</p>
    </div>
    ${buildShiftStatusSection(data, ro, m)}
    ${buildHealthBanner(data, ro)}
    ${buildSalesSection(data, ro, m)}
    ${buildVatSection(data, ro, m)}
    ${buildTopProductsSection(data, ro, m)}
    ${buildStockSection(data, ro)}
    ${ctas}`;
}

export function buildOwnerDigestFooter(data: OwnerDigestData): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";
  if (data.locale === "ro") {
    return `Primești acest rezumat pentru <strong>${esc(data.orgName)}</strong> conform programării din Setări → Notificări.<br>
      <a href="${base}/app/settings?tab=notifications" style="color:#3b82f6;">Modifică setările digest</a>`;
  }
  return `You receive this digest for <strong>${esc(data.orgName)}</strong> based on your schedule in Settings → Notifications.<br>
    <a href="${base}/app/settings?tab=notifications" style="color:#3b82f6;">Change digest settings</a>`;
}
