export type SaleLineTotals = {
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  discount_amount: number;
};

export type SaleTotals = {
  subtotalNet: number;
  taxTotal: number;
  totalGross: number;
  discountTotal: number;
  tipAmount: number;
  saleTotal: number;
};

export function computeSaleTotals(
  itemCalcs: SaleLineTotals[],
  opts: { tipsEnabled: boolean; tipAmountRaw: number },
): SaleTotals {
  const subtotalNet = itemCalcs.reduce((s, i) => s + i.net_amount, 0);
  const taxTotal = itemCalcs.reduce((s, i) => s + i.vat_amount, 0);
  const totalGross = itemCalcs.reduce((s, i) => s + i.gross_amount, 0);
  const discountTotal = itemCalcs.reduce((s, i) => s + i.discount_amount, 0);
  const tipAmount = opts.tipsEnabled ? Math.max(0, Number(opts.tipAmountRaw.toFixed(2))) : 0;
  const saleTotal = Number((totalGross + tipAmount).toFixed(2));
  return { subtotalNet, taxTotal, totalGross, discountTotal, tipAmount, saleTotal };
}

export type PaymentRow = {
  method: string;
  payment_method_id: string | null;
  amount: number;
  reference?: string;
  note?: string;
};

export type CanonicalPayment = PaymentRow & {
  sequence: number;
  metadata: Record<string, unknown>;
};

export type ResolvedPayments = {
  paidTotal: number;
  hasCashPayment: boolean;
  cashOverpay: number;
  canonicalPayments: CanonicalPayment[];
};

/**
 * Validates that a set of payment rows covers the sale total, then assigns
 * any cash overpay as change against the cash rows, in the order submitted.
 * A split sale may legitimately overpay (customer hands over a round cash
 * amount) as long as a cash row can absorb the excess as change; any other
 * mismatch between paid and due is rejected.
 */
export type PaymentFailureCode = "payment_mismatch" | "cash_insufficient";

export function resolveSalePayments(input: {
  paymentRows: PaymentRow[];
  saleTotal: number;
  splitEnabled: boolean;
  paymentType: string;
  cashReceivedStored: number | null;
}): { ok: true; result: ResolvedPayments } | { ok: false; error: string; code: PaymentFailureCode } {
  const { paymentRows, saleTotal, splitEnabled, paymentType, cashReceivedStored } = input;

  const paidTotal = Number(paymentRows.reduce((sum, row) => sum + row.amount, 0).toFixed(2));
  const hasCashPayment = paymentRows.some((row) => row.method === "cash");
  const cashOverpay =
    splitEnabled && hasCashPayment && paidTotal > saleTotal
      ? Number((paidTotal - saleTotal).toFixed(2))
      : 0;

  if (paidTotal + 0.0001 < saleTotal) {
    return { ok: false, error: "Payment total is less than the sale total.", code: "payment_mismatch" };
  }
  if (paidTotal > saleTotal + 0.0001 && !cashOverpay) {
    return { ok: false, error: "Payment total is higher than the sale total.", code: "payment_mismatch" };
  }
  if (
    paymentType === "cash" &&
    !splitEnabled &&
    cashReceivedStored !== null &&
    cashReceivedStored + 0.005 < saleTotal
  ) {
    return { ok: false, error: "Cash received is less than the total due.", code: "cash_insufficient" };
  }

  let remainingOverpay = cashOverpay;
  const canonicalPayments: CanonicalPayment[] = paymentRows.map((row, sequence) => {
    const changeApplied = row.method === "cash" ? Math.min(remainingOverpay, row.amount) : 0;
    remainingOverpay -= changeApplied;
    return {
      ...row,
      sequence,
      amount: Number((row.amount - changeApplied).toFixed(2)),
      metadata: {
        ...(splitEnabled ? { split: true } : {}),
        ...(changeApplied > 0 ? { cash_received: row.amount, change_due: changeApplied } : {}),
        ...(!splitEnabled && row.method === "cash" && cashReceivedStored !== null
          ? {
              cash_received: cashReceivedStored,
              change_due: Number((cashReceivedStored - saleTotal).toFixed(2)),
            }
          : {}),
      },
    };
  });

  return { ok: true, result: { paidTotal, hasCashPayment, cashOverpay, canonicalPayments } };
}
