export type ActivationSourceRow = {
  id: string;
  trial_started_at: string | null;
  growth_till_opened_at: string | null;
  growth_first_sale_at: string | null;
  growth_first_report_at: string | null;
};

const milestoneColumns = [
  ["trial_started", "trial_started_at"],
  ["till_session_opened", "growth_till_opened_at"],
  ["first_sale_recorded", "growth_first_sale_at"],
  ["z_report_viewed", "growth_first_report_at"],
] as const;

export function activationEventsForOrg(row: ActivationSourceRow) {
  return milestoneColumns.flatMap(([event, column]) => {
    const timestamp = row[column];
    return timestamp ? [{ event, timestamp }] : [];
  });
}
