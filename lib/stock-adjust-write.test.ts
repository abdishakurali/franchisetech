import { describe, expect, it } from "vitest";
import { recordOpeningStock, setProductStockWithMovement } from "./stock-adjust-write";

type Err = { message: string } | null;
type Call = { table: string; op: string; payload?: unknown };

/** Fake Supabase client: records every write and fails the n-th call of an op
 * on a table when told to. */
function fakeSupabase(fail: Partial<Record<string, Err>> = {}) {
  const calls: Call[] = [];
  const seen: Record<string, number> = {};
  function result(table: string, op: string) {
    const key = `${table}.${op}`;
    seen[key] = (seen[key] ?? 0) + 1;
    const err = fail[`${key}#${seen[key]}`] ?? fail[key] ?? null;
    return { error: err };
  }
  const client = {
    from(table: string) {
      return {
        update(payload: unknown) {
          calls.push({ table, op: "update", payload });
          const r = result(table, "update");
          const chain = { eq: () => chain, then: (res: (v: { error: Err }) => unknown) => res(r) };
          return chain;
        },
        insert(payload: unknown) {
          calls.push({ table, op: "insert", payload });
          return Promise.resolve(result(table, "insert"));
        },
        delete() {
          calls.push({ table, op: "delete" });
          const r = result(table, "delete");
          const chain = { eq: () => chain, then: (res: (v: { error: Err }) => unknown) => res(r) };
          return chain;
        },
      };
    },
  };
  return { client, calls };
}

const args = { orgId: "org", productId: "p1", oldQty: 4, newQty: 10, unit: "kg", userId: "u1" };

describe("setProductStockWithMovement", () => {
  it("updates the product first, then writes the movement for the delta", async () => {
    const { client, calls } = fakeSupabase();
    expect(await setProductStockWithMovement(client, args)).toEqual({ ok: true });
    expect(calls.map((c) => `${c.table}.${c.op}`)).toEqual(["products.update", "stock_movements.insert"]);
    expect(calls[0].payload).toEqual({ current_stock_qty: 10 });
    expect(calls[1].payload).toMatchObject({ quantity_change: 6, movement_type: "manual_adjustment", unit_of_measure: "kg" });
  });

  it("a refused product update writes no movement (no orphan ledger row)", async () => {
    const { client, calls } = fakeSupabase({ "products.update": { message: "rls" } });
    const res = await setProductStockWithMovement(client, args);
    expect(res).toMatchObject({ ok: false, stage: "update" });
    expect(calls.some((c) => c.table === "stock_movements")).toBe(false);
  });

  it("a refused movement puts the old stock back", async () => {
    const { client, calls } = fakeSupabase({ "stock_movements.insert": { message: "check violation" } });
    const res = await setProductStockWithMovement(client, args);
    expect(res).toEqual({ ok: false, stage: "movement", rolledBack: true, message: "check violation" });
    const updates = calls.filter((c) => c.op === "update").map((c) => c.payload);
    expect(updates).toEqual([{ current_stock_qty: 10 }, { current_stock_qty: 4 }]);
  });

  it("reports when the rollback itself fails", async () => {
    const { client } = fakeSupabase({
      "stock_movements.insert": { message: "boom" },
      "products.update#2": { message: "rollback refused" },
    });
    expect(await setProductStockWithMovement(client, args)).toMatchObject({ ok: false, stage: "movement", rolledBack: false });
  });

  it("no change in quantity writes no movement", async () => {
    const { client, calls } = fakeSupabase();
    expect(await setProductStockWithMovement(client, { ...args, newQty: 4 })).toEqual({ ok: true });
    expect(calls.map((c) => c.op)).toEqual(["update"]);
  });
});

describe("recordOpeningStock", () => {
  const open = { orgId: "org", productId: "p1", qty: 12, unit: "buc" };

  it("writes one opening movement and touches nothing else", async () => {
    const { client, calls } = fakeSupabase();
    expect(await recordOpeningStock(client, open)).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].payload).toMatchObject({ movement_type: "opening", quantity_change: 12, product_id: "p1" });
  });

  it("a refused movement removes the just-created product", async () => {
    const { client, calls } = fakeSupabase({ "stock_movements.insert": { message: "nope" } });
    expect(await recordOpeningStock(client, open)).toEqual({ ok: false, productRemoved: true, message: "nope" });
    expect(calls.map((c) => `${c.table}.${c.op}`)).toEqual(["stock_movements.insert", "products.delete"]);
  });

  it("if the product cannot be removed, its stock goes back to 0 to match the empty ledger", async () => {
    const { client, calls } = fakeSupabase({
      "stock_movements.insert": { message: "nope" },
      "products.delete": { message: "fk" },
    });
    expect(await recordOpeningStock(client, open)).toMatchObject({ ok: false, productRemoved: false });
    expect(calls.at(-1)).toMatchObject({ table: "products", op: "update", payload: { current_stock_qty: 0 } });
  });
});
