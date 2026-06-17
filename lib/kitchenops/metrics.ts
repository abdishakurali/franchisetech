import { formatCurrency, getActiveOrg, money } from "@/lib/kitchenops/data";
export { formatCurrency };

export async function getKitchenOpsContext() {
  return getActiveOrg();
}

export function sumRows<T>(rows: T[] | null | undefined, getter: (row: T) => number) {
  return (rows ?? []).reduce((total, row) => total + getter(row), 0);
}

export function formatMoney(value: number | string | null | undefined, currency = "EUR") {
  return formatCurrency(value, currency);
}

export function orgCurrency(membership: unknown) {
  const org = Array.isArray((membership as { organisations?: unknown })?.organisations)
    ? ((membership as { organisations?: unknown[] }).organisations?.[0] as { currency_code?: string | null; currency_symbol?: string | null } | undefined)
    : ((membership as { organisations?: unknown })?.organisations as { currency_code?: string | null; currency_symbol?: string | null } | undefined);
  return { code: org?.currency_code ?? "EUR", symbol: org?.currency_symbol ?? "€" };
}

export function formatOrgMoney(value: number | string | null | undefined, membership: unknown) {
  const c = orgCurrency(membership);
  return formatCurrency(value, c.code, c.symbol);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function marginPercent(salePrice: number, cost: number) {
  if (!salePrice) return 0;
  return ((salePrice - cost) / salePrice) * 100;
}
