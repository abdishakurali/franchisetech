export type CashSummaryOperation = {
  id: string;
  movement_type: "cash_in" | "cash_out";
  amount: number;
  reason: string | null;
  performedAt: string | null;
};

export type CashSummary = {
  openingCash: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
  txCount: number;
  topProduct: string | null;
  cashInTotal: number;
  cashOutTotal: number;
  cashOperations: CashSummaryOperation[];
};

export function applyCashMovementToSummary<T extends CashSummary>(summary: T, operation: CashSummaryOperation): T {
  const amount = Math.abs(operation.amount);
  const cashIn = operation.movement_type === "cash_in";
  return {
    ...summary,
    expectedCash: summary.expectedCash + (cashIn ? amount : -amount),
    cashInTotal: summary.cashInTotal + (cashIn ? amount : 0),
    cashOutTotal: summary.cashOutTotal + (cashIn ? 0 : amount),
    cashOperations: [{ ...operation, amount }, ...summary.cashOperations],
  };
}

export function reconcileCashSummary<T extends CashSummary>(summary: T, confirmedLocal: CashSummaryOperation[]): T {
  const serverIds = new Set(summary.cashOperations.map((operation) => operation.id));
  return confirmedLocal
    .filter((operation) => !serverIds.has(operation.id))
    .reduce<T>((current, operation) => applyCashMovementToSummary(current, operation), summary);
}
