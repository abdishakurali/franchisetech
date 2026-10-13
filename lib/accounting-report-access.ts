export const ACCOUNTING_REPORT_PATHS = [
  "/app/reports/consum",
  "/app/reports/balanta",
  "/app/reports/gestiune",
  "/app/reports/detalii-vanzari",
  "/app/reports/registru-de-casa",
  "/app/reports/audit-export",
] as const;

export function isOwnerAccountingReportRole(role: string | null | undefined): boolean {
  return role === "owner" || role === "manager";
}

export function canAccessAccountingReport(
  role: string | null | undefined,
  entitled: boolean,
): boolean {
  return isOwnerAccountingReportRole(role) || entitled;
}

export function shouldShowAccountingReportLink(
  path: string,
  role: string | null | undefined,
  baseVisible: boolean,
): boolean {
  return baseVisible || (
    isOwnerAccountingReportRole(role) &&
    (ACCOUNTING_REPORT_PATHS as readonly string[]).includes(path)
  );
}
