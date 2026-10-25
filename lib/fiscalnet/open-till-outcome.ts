export function openTillDestination(input: { fiscalActive: boolean; fiscalOk: boolean }): string {
  return input.fiscalActive && !input.fiscalOk ? "/app/pos?fiscal=opening_failed" : "/app/pos";
}
