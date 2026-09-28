export const CORE_REPORTS = ["sales", "z-report", "stock", "purchases", "margins"] as const;
export type CoreReport = (typeof CORE_REPORTS)[number];

export function selectCoreReport(requested: string | undefined, visible: string[]): CoreReport {
  return CORE_REPORTS.find((key) => key === requested && visible.includes(`/app/reports/${key}`))
    ?? CORE_REPORTS.find((key) => visible.includes(`/app/reports/${key}`))
    ?? "sales";
}
