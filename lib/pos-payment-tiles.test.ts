import { describe, expect, it } from "vitest";
import { selectPrimaryPaymentMethods } from "./pos-payment-tiles";

const cash = { id: "1", name: "Cash", type: "cash" };
const card = { id: "2", name: "Card", type: "card" };
const online = { id: "3", name: "Online", type: "online" };
const other = { id: "4", name: "Other", type: "other" };

describe("selectPrimaryPaymentMethods", () => {
  it("Dolce Nera's real case: exactly cash + card, card and online/other dropped, order preserved as cash then card", () => {
    expect(selectPrimaryPaymentMethods([online, cash, other, card])).toEqual([cash, card]);
  });

  it("drops Online and Other entirely, even with no cash/card competing for the slots", () => {
    expect(selectPrimaryPaymentMethods([cash, card, online, other])).toEqual([cash, card]);
  });

  it("shows only card when no cash method exists", () => {
    expect(selectPrimaryPaymentMethods([card, online])).toEqual([card]);
  });

  it("falls back to showing every method when neither cash nor card exists — checkout must never become impossible", () => {
    expect(selectPrimaryPaymentMethods([online, other])).toEqual([online, other]);
  });

  it("returns an empty list when there are no payment methods at all (not a crash)", () => {
    expect(selectPrimaryPaymentMethods([])).toEqual([]);
  });
});
