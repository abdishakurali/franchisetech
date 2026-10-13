import { describe, expect, it } from "vitest";
import {
  ACCOUNTING_REPORT_PATHS,
  canAccessAccountingReport,
  isOwnerAccountingReportRole,
  shouldShowAccountingReportLink,
} from "./accounting-report-access";

describe("accounting report access", () => {
  it("defines the complete owner-facing accounting report set", () => {
    expect(ACCOUNTING_REPORT_PATHS).toEqual([
      "/app/reports/consum",
      "/app/reports/balanta",
      "/app/reports/gestiune",
      "/app/reports/detalii-vanzari",
      "/app/reports/registru-de-casa",
      "/app/reports/audit-export",
    ]);
  });

  it.each(["owner", "manager"])("lets %s bypass report-plan gates", (role) => {
    expect(isOwnerAccountingReportRole(role)).toBe(true);
    expect(canAccessAccountingReport(role, false)).toBe(true);
  });

  it.each(["cashier", "kitchen", "accountant", null])(
    "keeps existing entitlement gates for %s",
    (role) => {
      expect(isOwnerAccountingReportRole(role)).toBe(false);
      expect(canAccessAccountingReport(role, false)).toBe(false);
      expect(canAccessAccountingReport(role, true)).toBe(true);
    },
  );

  it("restores accounting links for owners without unlocking unrelated modules", () => {
    expect(shouldShowAccountingReportLink("/app/reports/balanta", "owner", false)).toBe(true);
    expect(shouldShowAccountingReportLink("/app/reports/margins", "owner", false)).toBe(false);
    expect(shouldShowAccountingReportLink("/app/reports/balanta", "cashier", false)).toBe(false);
  });

  it.each([
    "/app/reports/detalii-vanzari",
    "/app/reports/gestiune",
    "/app/reports/consum",
    "/app/reports/registru-de-casa",
  ])("restores the customer-requested report %s for owners and managers", (path) => {
    expect(shouldShowAccountingReportLink(path, "owner", false)).toBe(true);
    expect(shouldShowAccountingReportLink(path, "manager", false)).toBe(true);
  });
});
