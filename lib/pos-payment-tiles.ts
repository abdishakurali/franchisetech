export interface PaymentMethodLike {
  id: string;
  name: string;
  type: string;
}

/**
 * Gate B: no method picker — the sell screen shows exactly Numerar then
 * Card, never more, regardless of how many payment methods an org has
 * configured (Online/Other still exist for reporting/history, just not as
 * tender options here). Falls back to whatever methods DO exist if an org
 * somehow has neither cash nor card configured, so checkout is never
 * structurally impossible — this is a UI simplification, not a capability
 * removal.
 */
export function selectPrimaryPaymentMethods<T extends PaymentMethodLike>(methods: T[]): T[] {
  const cash = methods.find((m) => m.type === "cash");
  const card = methods.find((m) => m.type === "card");
  const picked = [cash, card].filter((m): m is T => Boolean(m));
  return picked.length > 0 ? picked : methods;
}
