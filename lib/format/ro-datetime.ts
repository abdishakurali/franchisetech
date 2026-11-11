/**
 * Display-only date/time formatters pinned to Romania.
 *
 * Servers (Vercel) run in UTC, so toLocale* / Intl.DateTimeFormat without a
 * timeZone render UTC to Romanian users, and client components that format
 * during render disagree with the server HTML (React hydration error #418).
 * These helpers always pass timeZone "Europe/Bucharest".
 *
 * Use them only for text shown to people. Never for values that are stored,
 * queried, compared, or sent to FiscalNet / ANAF / SAF-T / SAGA.
 */

export const RO_TIME_ZONE = "Europe/Bucharest";
export const RO_LOCALE = "ro-RO";

export type DateInput = string | number | Date | null | undefined;

export type RoFormatOptions = Intl.DateTimeFormatOptions & {
  /** BCP 47 locale; defaults to "ro-RO". The time zone is always Europe/Bucharest. */
  locale?: string;
  /** Returned when the value is missing or not a valid date. Defaults to "—". */
  fallback?: string;
};

function toValidDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function split(options: RoFormatOptions = {}) {
  const { locale = RO_LOCALE, fallback = "—", ...intl } = options;
  return { locale, fallback, intl: { ...intl, timeZone: RO_TIME_ZONE } };
}

/** Adds timeZone "Europe/Bucharest" to Intl options (overrides any other zone). */
export function withRoTimeZone(options: Intl.DateTimeFormatOptions = {}): Intl.DateTimeFormatOptions {
  return { ...options, timeZone: RO_TIME_ZONE };
}

/** Like toLocaleDateString("ro-RO"), in Romania time: "11.11.2026". */
export function formatRoDate(value: DateInput, options?: RoFormatOptions): string {
  const d = toValidDate(value);
  const { locale, fallback, intl } = split(options);
  return d ? d.toLocaleDateString(locale, intl) : fallback;
}

/** Like toLocaleString("ro-RO"), in Romania time: "11.11.2026, 14:05:03". */
export function formatRoDateTime(value: DateInput, options?: RoFormatOptions): string {
  const d = toValidDate(value);
  const { locale, fallback, intl } = split(options);
  return d ? d.toLocaleString(locale, intl) : fallback;
}

/** Like toLocaleTimeString("ro-RO"), in Romania time: "14:05:03". */
export function formatRoTime(value: DateInput, options?: RoFormatOptions): string {
  const d = toValidDate(value);
  const { locale, fallback, intl } = split(options);
  return d ? d.toLocaleTimeString(locale, intl) : fallback;
}
