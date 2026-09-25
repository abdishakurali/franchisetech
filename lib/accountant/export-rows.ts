export const amountPerUnit = (amount: unknown, quantity: unknown) => {
  const qty = Math.abs(Number(quantity ?? 0));
  return qty > 0 ? Math.abs(Number(amount ?? 0)) / qty : 0;
};

export type AccountantIssue = { label: string; count: number };

export function accountantReadinessIssues(input: {
  identityMissing: boolean;
  productsWithoutSalePrice: number;
  purchasesWithoutDocument: number;
  purchaseLinesWithoutCost: number;
  stockWithoutCost: number;
  cashDiscrepancies: number;
}): AccountantIssue[] {
  return [
    input.identityMissing && { label: "Denumirea legală sau CUI lipsesc", count: 1 },
    input.productsWithoutSalePrice > 0 && { label: "Produse fără preț de vânzare", count: input.productsWithoutSalePrice },
    input.purchasesWithoutDocument > 0 && { label: "Achiziții fără factură ori furnizor", count: input.purchasesWithoutDocument },
    input.purchaseLinesWithoutCost > 0 && { label: "Linii de achiziție fără preț furnizor", count: input.purchaseLinesWithoutCost },
    input.stockWithoutCost > 0 && { label: "Produse în stoc fără cost", count: input.stockWithoutCost },
    input.cashDiscrepancies > 0 && { label: "Închideri cu diferență de numerar", count: input.cashDiscrepancies },
  ].filter(Boolean) as AccountantIssue[];
}
