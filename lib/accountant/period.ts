export function normalizeMonth(value: string | null | undefined, now = new Date()): string {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "")
    ? value!
    : now.toISOString().slice(0, 7);
}

export function monthRange(month: string): { from: string; to: string; start: string; end: string; days: number } {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const from = `${month}-01`;
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { from, to, start: `${from}T00:00:00.000Z`, end: `${to}T23:59:59.999Z`, days: lastDay };
}
