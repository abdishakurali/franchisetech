export type FixtureLine = {
  documentId: string;
  direction: 1 | -1;
  net: number;
  vat: number;
  gross: number;
};

export type FixturePayment = { amount: number; method: string };
export type FixtureStockMovement = { quantity: number; unitCost: number };

const money = (value: number) => Number(value.toFixed(2));

export function aggregateFixture(input: {
  openingCash: number;
  openingStock: number;
  lines: FixtureLine[];
  payments: FixturePayment[];
  stock: FixtureStockMovement[];
}) {
  const receiptCount = new Set(input.lines.filter((line) => line.direction === 1).map((line) => line.documentId)).size;
  const net = money(input.lines.reduce((sum, line) => sum + line.net, 0));
  const vat = money(input.lines.reduce((sum, line) => sum + line.vat, 0));
  const gross = money(input.lines.reduce((sum, line) => sum + line.gross, 0));
  const cost = money(-input.stock.reduce((sum, movement) => sum + movement.quantity * movement.unitCost, 0));

  return {
    receiptCount,
    vatDocumentCount: receiptCount,
    net,
    vat,
    gross,
    expectedCash: money(input.openingCash + input.payments.filter((payment) => payment.method === "cash").reduce((sum, payment) => sum + payment.amount, 0)),
    closingStock: Number((input.openingStock + input.stock.reduce((sum, movement) => sum + movement.quantity, 0)).toFixed(6)),
    cost,
    netMargin: money(net - cost),
  };
}
