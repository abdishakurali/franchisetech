type SubscriptionCandidate = {
  id: string;
  status: string;
  created: number;
};

const STATUS_PRIORITY: Record<string, number> = {
  active: 6,
  trialing: 5,
  past_due: 4,
  unpaid: 3,
  incomplete: 2,
  paused: 1,
  incomplete_expired: 0,
  canceled: 0,
};

export function selectCanonicalSubscription<T extends SubscriptionCandidate>(
  subscriptions: T[],
): T | null {
  return [...subscriptions].sort((a, b) => {
    const priority = (STATUS_PRIORITY[b.status] ?? 0) - (STATUS_PRIORITY[a.status] ?? 0);
    return priority || b.created - a.created;
  })[0] ?? null;
}

type SafePaymentError = {
  code?: string | null;
  decline_code?: string | null;
  type?: string | null;
};

export function buildPaymentFailureProperties(input: {
  id: string;
  amount_due?: number | null;
  attempt_count?: number | null;
  currency?: string | null;
  lastPaymentError?: SafePaymentError | null;
}) {
  const error = input.lastPaymentError;
  return {
    invoice_id: input.id,
    amount_due_cents: input.amount_due ?? 0,
    attempt_count: input.attempt_count ?? 0,
    currency: input.currency ?? "eur",
    failure_code: error?.code ?? null,
    decline_code: error?.decline_code ?? null,
    failure_type: error?.type ?? null,
    requires_action: error?.code === "authentication_required",
  };
}
