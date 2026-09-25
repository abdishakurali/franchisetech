type CashMovement = { performed_at: string; movement_type: string | null; amount: number | null; reason: string | null };
type CashSale = { sold_at: string; transaction_number: string | null; total: number | null; status: string | null; payment_methods: { name?: string | null; type?: string | null } | Array<{ name?: string | null; type?: string | null }> | null };

export function buildCashLedger(openingBalance: number, movements: CashMovement[], sales: CashSale[]) {
  const entries = [
    ...movements.map((row) => ({ at: row.performed_at, document: row.movement_type || "Mișcare numerar", explanation: row.reason || "LIPSĂ EXPLICAȚIE", cashIn: Number(row.amount ?? 0) > 0 ? Number(row.amount) : 0, cashOut: Number(row.amount ?? 0) < 0 ? Math.abs(Number(row.amount)) : 0 })),
    ...sales.filter((row) => {
      const method = Array.isArray(row.payment_methods) ? row.payment_methods[0] : row.payment_methods;
      return row.status === "completed" && method?.type?.toLowerCase() === "cash";
    }).map((row) => ({ at: row.sold_at, document: row.transaction_number || "Bon fiscal", explanation: "Vânzare în numerar", cashIn: Number(row.total ?? 0), cashOut: 0 })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  let balance = openingBalance;
  return entries.map((entry) => ({ ...entry, balance: balance += entry.cashIn - entry.cashOut }));
}
