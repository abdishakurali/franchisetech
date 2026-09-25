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

export function accountantDateRange(fromValue: string | null | undefined, toValue: string | null | undefined, now = new Date()) {
  const fallbackMonth = normalizeMonth(undefined, now);
  const fallback = monthRange(fallbackMonth);
  const validDate = (value: string | null | undefined) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") ? value! : null;
  const from = validDate(fromValue) ?? fallback.from;
  const requestedTo = validDate(toValue) ?? fallback.to;
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const requestedToDate = new Date(`${requestedTo}T00:00:00.000Z`);
  const maxTo = new Date(fromDate); maxTo.setUTCDate(maxTo.getUTCDate() + 365);
  const to = requestedToDate < fromDate ? from : (requestedToDate > maxTo ? maxTo.toISOString().slice(0, 10) : requestedTo);
  const days = Math.floor((new Date(`${to}T00:00:00.000Z`).getTime() - fromDate.getTime()) / 86_400_000) + 1;
  return { from, to, start: `${from}T00:00:00.000Z`, end: `${to}T23:59:59.999Z`, days };
}
