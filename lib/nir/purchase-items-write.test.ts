import { describe, expect, it } from "vitest";
import { replacePurchaseItems } from "./purchase-items-write";

type Result = { error: { message: string } | null };

function fakeSupabase(opts: { deleteResult?: Result; insertResult?: Result }) {
  const calls: { op: string; rows?: unknown[] }[] = [];
  const client = {
    from(table: string) {
      expect(table).toBe("purchase_items");
      return {
        delete() {
          calls.push({ op: "delete" });
          const chain = {
            eq: () => chain,
            then: (res: (r: Result) => unknown) => res(opts.deleteResult ?? { error: null }),
          };
          return chain;
        },
        insert(rows: unknown[]) {
          calls.push({ op: "insert", rows });
          return Promise.resolve(opts.insertResult ?? { error: null });
        },
      };
    },
  };
  return { client, calls };
}

const line = {
  product_id: "prod-1",
  quantity: 2,
  received_quantity: null,
  unit_cost: 10,
  total_cost: 20,
  tax_rate: 21,
  tax_amount: 4.2,
  unit_of_measure: "kg",
};

describe("replacePurchaseItems", () => {
  it("returns ok when delete and insert succeed, with product names filled", async () => {
    const { client, calls } = fakeSupabase({});
    const r = await replacePurchaseItems(client, "org", "pur", [line], new Map([["prod-1", "Cafea"]]));
    expect(r).toEqual({ ok: true });
    expect(calls.map((c) => c.op)).toEqual(["delete", "insert"]);
    expect((calls[1].rows as Array<{ product_name: string }>)[0].product_name).toBe("Cafea");
  });

  it("surfaces an insert failure instead of leaving a silent 0-line draft", async () => {
    const { client } = fakeSupabase({ insertResult: { error: { message: "violates check constraint" } } });
    const r = await replacePurchaseItems(client, "org", "pur", [line], new Map());
    expect(r).toEqual({ ok: false, stage: "insert", message: "violates check constraint" });
  });

  it("surfaces a delete failure and does not insert", async () => {
    const { client, calls } = fakeSupabase({ deleteResult: { error: { message: "rls" } } });
    const r = await replacePurchaseItems(client, "org", "pur", [line], new Map());
    expect(r).toEqual({ ok: false, stage: "delete", message: "rls" });
    expect(calls.map((c) => c.op)).toEqual(["delete"]);
  });

  it("no items: deletes only", async () => {
    const { client, calls } = fakeSupabase({});
    expect(await replacePurchaseItems(client, "org", "pur", [], new Map())).toEqual({ ok: true });
    expect(calls.map((c) => c.op)).toEqual(["delete"]);
  });
});
