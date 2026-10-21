import { describe, expect, it } from "vitest";
import {
  buildPaymentFailureProperties,
  selectCanonicalSubscription,
} from "@/lib/billing/reconciliation";

describe("selectCanonicalSubscription", () => {
  it("prefers the current active subscription over canceled history", () => {
    const selected = selectCanonicalSubscription([
      { id: "sub_old", status: "canceled", created: 30 },
      { id: "sub_live", status: "active", created: 20 },
    ]);

    expect(selected?.id).toBe("sub_live");
  });

  it("returns the newest terminal subscription when nothing is current", () => {
    const selected = selectCanonicalSubscription([
      { id: "sub_old", status: "canceled", created: 20 },
      { id: "sub_new", status: "canceled", created: 30 },
    ]);

    expect(selected?.id).toBe("sub_new");
  });
});

describe("buildPaymentFailureProperties", () => {
  it("reports amount due and safe Stripe failure details", () => {
    expect(buildPaymentFailureProperties({
      id: "in_123",
      amount_due: 4900,
      attempt_count: 9,
      currency: "eur",
      lastPaymentError: {
        code: "card_declined",
        decline_code: "generic_decline",
        type: "card_error",
      },
    })).toEqual({
      invoice_id: "in_123",
      amount_due_cents: 4900,
      attempt_count: 9,
      currency: "eur",
      failure_code: "card_declined",
      decline_code: "generic_decline",
      failure_type: "card_error",
      requires_action: false,
    });
  });

  it("marks authentication-required failures without leaking messages", () => {
    expect(buildPaymentFailureProperties({
      id: "in_auth",
      amount_due: 7900,
      attempt_count: 1,
      currency: "eur",
      lastPaymentError: { code: "authentication_required", type: "card_error" },
    }).requires_action).toBe(true);
  });
});
