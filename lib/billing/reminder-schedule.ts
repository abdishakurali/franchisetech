export type BillingReminderType = "trial_expired" | "past_due_grace" | "past_due_final";

/** Stable per-incident key. The database unique index makes every reminder type send once. */
export function billingReminderWindow(reminderType: BillingReminderType, incidentAt: string): string {
  const date = new Date(incidentAt);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${reminderType} incident timestamp`);
  return date.toISOString();
}
