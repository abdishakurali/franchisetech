const MAX_SILENCE_MS = 24 * 60 * 60 * 1000;

export function shouldRecordAnalyticsDelivery(event: string): boolean {
  return event !== "analytics_health_check";
}

export function shouldSendAnalyticsAlert(
  previousError: string | null | undefined,
  state: "healthy" | "alert",
): boolean {
  return state === "alert" && previousError !== "no_production_events_24h";
}

export function analyticsHealthState(input: {
  lastSuccessAt: string | null;
  now?: Date;
}): "healthy" | "alert" {
  if (!input.lastSuccessAt) return "alert";
  const age = (input.now ?? new Date()).getTime() - new Date(input.lastSuccessAt).getTime();
  return age <= MAX_SILENCE_MS ? "healthy" : "alert";
}
