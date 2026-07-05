/** RON denomination config for the till-close cash counter. Add entries here
 *  (e.g. 500 lei, 2 lei, 1 leu, 50 bani, 10 bani) to extend the counter — no
 *  component changes needed. */
export type CashDenomination = { value: number; label: string };

export const RON_CASH_DENOMINATIONS: CashDenomination[] = [
  { value: 200, label: "200 lei" },
  { value: 100, label: "100 lei" },
  { value: 50, label: "50 lei" },
  { value: 20, label: "20 lei" },
  { value: 10, label: "10 lei" },
  { value: 5, label: "5 lei" },
  { value: 1, label: "1 leu" },
  { value: 0.5, label: "50 bani" },
  { value: 0.1, label: "10 bani" },
];

export function denomTotal(qty: Record<number, number>, denoms: CashDenomination[] = RON_CASH_DENOMINATIONS): number {
  return denoms.reduce((sum, d) => sum + d.value * (qty[d.value] || 0), 0);
}
