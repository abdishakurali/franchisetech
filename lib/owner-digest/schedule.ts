/** Calendar parts for an instant in an IANA timezone */
export function zonedParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** UTC instant for 00:00 on a calendar day in the given timezone */
export function zonedDayStartUtc(year: number, month: number, day: number, timeZone: string): Date {
  const base = Date.UTC(year, month - 1, day, 0, 0, 0);
  for (let offsetHours = -14; offsetHours <= 14; offsetHours++) {
    const d = new Date(base + offsetHours * 3_600_000);
    const p = zonedParts(d, timeZone);
    if (p.year === year && p.month === month && p.day === day && p.hour === 0 && p.minute === 0) {
      return d;
    }
  }
  return new Date(base);
}

export function isoWeekday(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const noon = zonedDayStartUtc(p.year, p.month, p.day, timeZone);
  noon.setUTCHours(noon.getUTCHours() + 12);
  const dow = new Date(noon.toLocaleString("en-US", { timeZone })).getDay();
  return dow === 0 ? 7 : dow;
}

export function addCalendarDays(year: number, month: number, day: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1, day + delta));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function parseCutoff(time?: string | null) {
  const match = String(time || "04:00").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return { hour: 4, minute: 0 };
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
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

export type DigestOrgSchedule = {
  organisation_id: string;
  owner_digest_frequency: string;
  owner_digest_day_of_week: number;
  owner_digest_time_of_day: string;
  owner_digest_timezone: string;
  owner_digest_last_sent_at: string | null;
};

export const OWNER_DIGEST_SEND_WINDOW_MINUTES = 15;

/** True when org is in the send window and has not been sent for this period */
export function isOwnerDigestDue(org: DigestOrgSchedule, now: Date): boolean {
  const tz = org.owner_digest_timezone || "Europe/Bucharest";
  const p = zonedParts(now, tz);
  const isoDay = isoWeekday(now, tz);

  if (org.owner_digest_frequency === "weekly" && isoDay !== org.owner_digest_day_of_week) {
    return false;
  }

  const timeStr = String(org.owner_digest_time_of_day).slice(0, 5);
  const [schHour, schMin] = timeStr.split(":").map(Number);
  const nowMins = p.hour * 60 + p.minute;
  const schMins = schHour * 60 + schMin;
  if (nowMins < schMins || nowMins >= schMins + OWNER_DIGEST_SEND_WINDOW_MINUTES) return false;

  if (org.owner_digest_last_sent_at) {
    const lastP = zonedParts(new Date(org.owner_digest_last_sent_at), tz);
    if (org.owner_digest_frequency === "daily") {
      if (lastP.year === p.year && lastP.month === p.month && lastP.day === p.day) {
        return false;
      }
    } else {
      if (isoWeekKey(lastP.year, lastP.month, lastP.day) === isoWeekKey(p.year, p.month, p.day)) {
        return false;
      }
    }
  }

  return true;
}

function isoWeekKey(year: number, month: number, day: number): string {
  // month is 1-indexed (from zonedParts / Intl.DateTimeFormat)
  const tmp = new Date(Date.UTC(year, month - 1, day));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${weekNo}`;
}

/** Idempotency key: start of digest window in UTC */
export function ownerDigestWindowStart(
  frequency: "daily" | "weekly",
  now: Date,
  timeZone: string,
  businessDayCutoffTime?: string | null
): Date {
  const p = zonedParts(now, timeZone);
  const cutoff = parseCutoff(businessDayCutoffTime);
  const beforeCutoff = p.hour * 60 + p.minute < cutoff.hour * 60 + cutoff.minute;
  const currentOpDay = beforeCutoff ? addCalendarDays(p.year, p.month, p.day, -1) : p;
  const delta = frequency === "weekly" ? -7 : -1;
  const windowDay = addCalendarDays(currentOpDay.year, currentOpDay.month, currentOpDay.day, delta);
  return zonedDateTimeUtc(windowDay.year, windowDay.month, windowDay.day, cutoff.hour, cutoff.minute, timeZone);
}

/** Legacy calendar-period key, kept for tests and non-digest callers. */
export function ownerDigestCalendarWindowStart(
  frequency: "daily" | "weekly",
  now: Date,
  timeZone: string
): Date {
  const p = zonedParts(now, timeZone);
  if (frequency === "daily") {
    return zonedDayStartUtc(p.year, p.month, p.day, timeZone);
  }
  const isoDow = isoWeekday(now, timeZone);
  const mondayDelta = 1 - isoDow;
  const mon = addCalendarDays(p.year, p.month, p.day, mondayDelta);
  return zonedDayStartUtc(mon.year, mon.month, mon.day, timeZone);
}
