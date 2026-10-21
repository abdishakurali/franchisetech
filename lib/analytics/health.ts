const MAX_SILENCE_MS = 24 * 60 * 60 * 1000;

export function analyticsHealthState(input: {
  lastSuccessAt: string | null;
  now?: Date;
}): "healthy" | "alert" {
  if (!input.lastSuccessAt) return "alert";
  const age = (input.now ?? new Date()).getTime() - new Date(input.lastSuccessAt).getTime();
  return age <= MAX_SILENCE_MS ? "healthy" : "alert";
}
