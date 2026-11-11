import { describe, expect, it } from "vitest";
import { replaceRecipeItems, type RecipeItemRow } from "./recipe-items-write";

type Err = { message: string } | null;

function fakeSupabase(opts: { insertError?: Err; insertData?: Array<{ id: string }> | null; deleteError?: Err }) {
  const calls: Array<{ op: string; filters: Array<[string, string, unknown]> }> = [];
  let deletes = 0;
  const client = {
    from(table: string) {
      expect(table).toBe("recipe_items");
      return {
        insert(rows: unknown[]) {
          calls.push({ op: "insert", filters: [] });
          return {
            select: () =>
              Promise.resolve({
                data: opts.insertError ? null : opts.insertData ?? rows.map((_, i) => ({ id: `new-${i}` })),
                error: opts.insertError ?? null,
              }),
          };
        },
        delete() {
          const call = { op: "delete", filters: [] as Array<[string, string, unknown]> };
          calls.push(call);
          const isFirst = deletes++ === 0;
          const chain = {
            eq: (c: string, v: unknown) => { call.filters.push(["eq", c, v]); return chain; },
            in: (c: string, v: unknown) => { call.filters.push(["in", c, v]); return chain; },
            not: (c: string, op: string, v: unknown) => { call.filters.push(["not", c, `${op} ${v}`]); return chain; },
            then: (res: (r: { error: Err }) => unknown) => res({ error: isFirst ? opts.deleteError ?? null : null }),
          };
          return chain;
        },
      };
    },
  };
  return { client, calls };
}

const rows: RecipeItemRow[] = [
  { organisation_id: "org", recipe_id: "r1", ingredient_product_id: "beans", quantity: 0.018 },
  { organisation_id: "org", recipe_id: "r1", ingredient_product_id: "cup", quantity: 1 },
];

describe("replaceRecipeItems", () => {
  it("inserts the new lines first, then deletes only the old ones", async () => {
    const { client, calls } = fakeSupabase({});
    expect(await replaceRecipeItems(client, "org", "r1", rows)).toEqual({ ok: true });
    expect(calls.map((c) => c.op)).toEqual(["insert", "delete"]);
    expect(calls[1].filters).toContainEqual(["not", "id", "in (new-0,new-1)"]);
    expect(calls[1].filters).toContainEqual(["eq", "recipe_id", "r1"]);
  });

  it("a failed insert deletes nothing, so the old lines survive", async () => {
    const { client, calls } = fakeSupabase({ insertError: { message: "violates check constraint" } });
    expect(await replaceRecipeItems(client, "org", "r1", rows)).toEqual({
      ok: false, stage: "insert", message: "violates check constraint",
    });
    expect(calls.map((c) => c.op)).toEqual(["insert"]);
  });

  it("a partial insert (fewer rows back) is treated as a failure", async () => {
    const { client, calls } = fakeSupabase({ insertData: [{ id: "new-0" }] });
    const r = await replaceRecipeItems(client, "org", "r1", rows);
    expect(r.ok).toBe(false);
    expect(calls.map((c) => c.op)).toEqual(["insert"]);
  });

  it("a failed delete of old lines removes the new ones again", async () => {
    const { client, calls } = fakeSupabase({ deleteError: { message: "rls" } });
    expect(await replaceRecipeItems(client, "org", "r1", rows)).toEqual({ ok: false, stage: "delete", message: "rls" });
    expect(calls.map((c) => c.op)).toEqual(["insert", "delete", "delete"]);
    expect(calls[2].filters).toContainEqual(["in", "id", ["new-0", "new-1"]]);
  });

  it("refuses an empty replace without touching the database", async () => {
    const { client, calls } = fakeSupabase({});
    expect((await replaceRecipeItems(client, "org", "r1", [])).ok).toBe(false);
    expect(calls).toEqual([]);
  });
});
