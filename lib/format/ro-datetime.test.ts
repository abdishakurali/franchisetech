import { describe, expect, it } from "vitest";
import { formatRoDate, formatRoDateTime, formatRoTime, withRoTimeZone, RO_TIME_ZONE } from "./ro-datetime";

describe("ro-datetime", () => {
  // 22:30 UTC on 10 Nov 2026 is already 11 Nov, 00:30 in Bucharest (EET, UTC+2).
  const lateWinter = "2026-11-10T22:30:00.000Z";
  // 21:15 UTC on 15 Jul 2026 is 16 Jul, 00:15 in Bucharest (EEST, UTC+3).
  const lateSummer = "2026-07-15T21:15:00.000Z";

  it("formats the date in Bucharest, not UTC", () => {
    expect(formatRoDate(lateWinter)).toBe("11.11.2026");
    expect(formatRoDate(lateSummer)).toBe("16.07.2026");
  });

  it("formats date and time with the Bucharest offset (winter and summer time)", () => {
    expect(formatRoDateTime(lateWinter)).toBe("11.11.2026, 00:30:00");
    expect(formatRoDateTime("2026-07-15T09:05:00Z", { dateStyle: "short", timeStyle: "short" })).toBe("15.07.2026, 12:05");
  });

  it("formats time only", () => {
    expect(formatRoTime("2026-11-11T12:05:09Z")).toBe("14:05:09");
    expect(formatRoTime("2026-11-11T12:05:09Z", { hour: "2-digit", minute: "2-digit" })).toBe("14:05");
  });

  it("keeps date-only values on the same calendar day", () => {
    expect(formatRoDate("2026-01-31")).toBe("31.01.2026");
  });

  it("accepts another locale but keeps the Bucharest zone", () => {
    expect(formatRoTime("2026-11-11T12:05:00Z", { locale: "en-IE", hour: "2-digit", minute: "2-digit" })).toBe("14:05");
  });

  it("cannot be overridden to another time zone", () => {
    expect(formatRoTime("2026-11-11T12:05:00Z", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })).toBe("14:05");
    expect(withRoTimeZone({ timeZone: "UTC", dateStyle: "short" })).toEqual({ timeZone: RO_TIME_ZONE, dateStyle: "short" });
  });

  it("returns the fallback for missing or invalid values", () => {
    expect(formatRoDate(null)).toBe("—");
    expect(formatRoDate(undefined)).toBe("—");
    expect(formatRoDate("")).toBe("—");
    expect(formatRoDateTime("not a date", { fallback: "-" })).toBe("-");
  });

  it("accepts Date objects and epoch numbers", () => {
    const d = new Date(lateWinter);
    expect(formatRoDate(d)).toBe("11.11.2026");
    expect(formatRoDate(d.getTime())).toBe("11.11.2026");
  });
});
