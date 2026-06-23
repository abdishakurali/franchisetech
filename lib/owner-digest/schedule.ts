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

export type DigestOrgSchedule = {
  organisation_id: string;
  owner_digest_frequency: string;
  owner_digest_day_of_week: number;
  owner_digest_time_of_day: string;
  owner_digest_timezone: string;
  owner_digest_last_sent_at: string | null;
};

/** True when org is in the send window and has not been sent for this period */
export function isOwnerDigestDue(org: DigestOrgSchedule, now: Date): boolean {
  const tz = org.owner_digest_timezone || "Europe/Bucharest";
  const tzNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const isoDay = tzNow.getDay() === 0 ? 7 : tzNow.getDay();

  if (org.owner_digest_frequency === "weekly" && isoDay !== org.owner_digest_day_of_week) {
    return false;
  }

  const timeStr = String(org.owner_digest_time_of_day).slice(0, 5);
  const [schHour, schMin] = timeStr.split(":").map(Number);
  const nowMins = tzNow.getHours() * 60 + tzNow.getMinutes();
  const schMins = schHour * 60 + schMin;
  if (nowMins < schMins || nowMins >= schMins + 60) return false;

  if (org.owner_digest_last_sent_at) {
    const lastTz = new Date(
      new Date(org.owner_digest_last_sent_at).toLocaleString("en-US", { timeZone: tz })
    );
    if (org.owner_digest_frequency === "daily") {
      if (
        lastTz.getFullYear() === tzNow.getFullYear() &&
        lastTz.getMonth() === tzNow.getMonth() &&
        lastTz.getDate() === tzNow.getDate()
      ) {
        return false;
      }
    } else {
      const lastWeek = getIsoWeekKey(lastTz);
      const thisWeek = getIsoWeekKey(tzNow);
      if (lastWeek === thisWeek) return false;
    }
  }

  return true;
}

function getIsoWeekKey(d: Date): string {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
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
