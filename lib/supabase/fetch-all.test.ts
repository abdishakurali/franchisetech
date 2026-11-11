import { describe, expect, it } from "vitest";
import { fakePostgrest } from "@/lib/supabase/fake-postgrest";
import {
  fetchAll,
  fetchAllIn,
  keysetAfterFilter,
  SALES_LINE_KEYS,
  sumByGroup,
  sumColumn,
} from "@/lib/supabase/fetch-all";

const ORG = "org-1";

/** 2,500 receipts for one org (plus noise for another), 600 of them sharing
 * one timestamp so pages must break ties on id. */
function receipts() {
  const rows: Array<{ id: string; organisation_id: string; sold_at: string; total: number; status: string; supplier_id: string | null }> = [];
  const base = Date.parse("2026-10-01T06:00:00.000Z");
  for (let i = 0; i < 2500; i += 1) {
    const shared = i % 4 === 0 && i < 2400; // 600 rows at one instant
    rows.push({
      id: `tx-${String((i * 7919) % 10007).padStart(5, "0")}-${i}`,
      organisation_id: ORG,
      sold_at: shared ? "2026-10-15T12:00:00.000+00:00" : new Date(base + i * 60_000).toISOString(),
      total: Math.round((5 + (i % 37) * 1.37) * 100) / 100,
      status: i % 50 === 0 ? "voided" : "completed",
      supplier_id: i % 11 === 0 ? null : `sup-${i % 7}`,
    });
  }
  for (let i = 0; i < 300; i += 1) {
    rows.push({ id: `other-${i}`, organisation_id: "org-2", sold_at: new Date(base + i * 1000).toISOString(), total: 1000, status: "completed", supplier_id: "sup-1" });
  }
  return rows;
}

const mine = (rows: ReturnType<typeof receipts>) => rows.filter((r) => r.organisation_id === ORG);
const cents = (n: number) => Math.round(n * 100);

describe("keysetAfterFilter", () => {
  it("builds the strictly-after condition for a composite key", () => {
    expect(keysetAfterFilter(["sold_at", "id"], ["2026-10-15T12:00:00+00:00", "tx-1"])).toBe(
      'sold_at.gt."2026-10-15T12:00:00+00:00",and(sold_at.eq."2026-10-15T12:00:00+00:00",id.gt."tx-1")',
    );
    expect(keysetAfterFilter(["a", "b", "c"], ["x", 1, 'q"z'], true)).toBe(
      'a.lt."x",and(a.eq."x",b.lt.1),and(a.eq."x",b.eq.1,c.lt."q\\"z")',
    );
  });
});

describe("fetchAll", () => {
  const rows = receipts();

  it("returns all 2,500 rows past the 1000-row cap, each exactly once, and sums them all", async () => {
    const { client, calls } = fakePostgrest({ pos_transactions: rows });
    // What the old code did: one capped query.
    const capped = await (client.from("pos_transactions").select("id,total").eq("organisation_id", ORG) as unknown as Promise<{ data: Array<{ total: number }> }>);
    expect(capped.data).toHaveLength(1000);

    const { data, error } = await fetchAll<{ id: string; total: number }>(
      () => client.from("pos_transactions").select("id,sold_at,total").eq("organisation_id", ORG),
      { keys: ["sold_at", "id"] },
    );
    expect(error).toBeNull();
    expect(data).toHaveLength(2500);
    expect(new Set(data!.map((r) => r.id)).size).toBe(2500);
    const expected = mine(rows).reduce((s, r) => s + cents(r.total), 0);
    expect(data!.reduce((s, r) => s + cents(r.total), 0)).toBe(expected);
    expect(calls.filter((c) => c.table === "pos_transactions").length - 1).toBe(3); // 1000 + 1000 + 500
  });

  it("keeps the caller's filters on every page", async () => {
    const { client } = fakePostgrest({ pos_transactions: rows });
    const { data } = await fetchAll<{ status: string }>(
      () => client.from("pos_transactions").select("id,sold_at,status").eq("organisation_id", ORG).neq("status", "voided"),
      { keys: ["sold_at", "id"] },
    );
    expect(data).toHaveLength(mine(rows).filter((r) => r.status !== "voided").length);
    expect(data!.every((r) => r.status !== "voided")).toBe(true);
  });

  it("orders by the keys, ascending or descending", async () => {
    const { client } = fakePostgrest({ pos_transactions: rows });
    const asc = await fetchAll<{ id: string; sold_at: string }>(
      () => client.from("pos_transactions").select("id,sold_at").eq("organisation_id", ORG),
      { keys: ["sold_at", "id"] },
    );
    const desc = await fetchAll<{ id: string; sold_at: string }>(
      () => client.from("pos_transactions").select("id,sold_at").eq("organisation_id", ORG),
      { keys: ["sold_at", "id"], descending: true },
    );
    expect(desc.data).toHaveLength(2500);
    expect(desc.data!.map((r) => r.id)).toEqual([...asc.data!].reverse().map((r) => r.id));
    for (let i = 1; i < asc.data!.length; i += 1) {
      expect(Date.parse(asc.data![i].sold_at)).toBeGreaterThanOrEqual(Date.parse(asc.data![i - 1].sold_at));
    }
  });

  it("handles an exact multiple of the page size and an empty result", async () => {
    const { client, calls } = fakePostgrest({ t: rows.slice(0, 2000) });
    const full = await fetchAll(() => client.from("t").select("id").eq("organisation_id", ORG));
    expect(full.data).toHaveLength(2000);
    expect(calls).toHaveLength(3); // the third, empty page ends the loop
    const none = await fetchAll(() => client.from("t").select("id").eq("organisation_id", "nobody"));
    expect(none).toEqual({ data: [], error: null });
  });

  it("pages a four-column key (canonical_sales_lines) with sale and return lines at one instant", async () => {
    const lines: Array<Record<string, unknown>> = [];
    for (let i = 0; i < 1300; i += 1) {
      const at = i < 900 ? "2026-10-10T09:00:00+00:00" : `2026-10-10T10:${String(i % 60).padStart(2, "0")}:00+00:00`;
      lines.push({ organisation_id: ORG, sold_at: at, transaction_item_id: `item-${String(i % 1100).padStart(4, "0")}`, direction: i < 1100 ? 1 : -1, transaction_number: i < 1100 ? `B${i}` : `R${i}`, gross_amount: 1 });
    }
    const { client } = fakePostgrest({ canonical_sales_lines: lines });
    const { data } = await fetchAll(() => client.from("canonical_sales_lines").select("*").eq("organisation_id", ORG), { keys: SALES_LINE_KEYS });
    expect(data).toHaveLength(1300);
    expect(new Set(data!.map((r) => `${r.transaction_item_id}|${r.direction}|${r.transaction_number}`)).size).toBe(1300);
  });

  it("returns null data and the error when any page fails -- never a partial list", async () => {
    const { client } = fakePostgrest({ pos_transactions: rows }, { failOn: (c) => c.filters.some((f) => f.startsWith("or(")) });
    const result = await fetchAll(() => client.from("pos_transactions").select("id,sold_at").eq("organisation_id", ORG), { keys: ["sold_at", "id"] });
    expect(result.data).toBeNull();
    expect(result.error?.message).toMatch(/timeout/);
  });

  it("refuses a null key instead of looping or skipping rows", async () => {
    const { client } = fakePostgrest({ t: Array.from({ length: 1000 }, (_, i) => ({ id: i === 999 ? null : `r${i}` })) });
    await expect(fetchAll(() => client.from("t").select("id"))).rejects.toThrow(/key column "id"/);
  });
});

describe("fetchAllIn", () => {
  it("chunks a long id list and pages each chunk", async () => {
    const items = Array.from({ length: 2500 }, (_, i) => ({ id: `it-${String(i).padStart(5, "0")}`, transaction_id: `tx-${i % 900}`, organisation_id: ORG, amount: 2 }));
    const ids = Array.from({ length: 900 }, (_, i) => `tx-${i}`);
    const { client, calls } = fakePostgrest({ pos_transaction_items: items });
    const { data } = await fetchAllIn<{ amount: number }>([...ids, ...ids.slice(0, 50)], (chunk) =>
      client.from("pos_transaction_items").select("id,amount").eq("organisation_id", ORG).in("transaction_id", chunk),
    );
    expect(data).toHaveLength(2500);
    expect(data!.reduce((s, r) => s + r.amount, 0)).toBe(5000);
    expect(calls.every((c) => c.filters.some((f) => /^transaction_id=in\((\d+)\)$/.test(f) && Number(f.match(/\d+/)![0]) <= 200))).toBe(true);
  });

  it("does not query for an empty id list", async () => {
    const { client, calls } = fakePostgrest({});
    expect(await fetchAllIn([], (chunk) => client.from("x").select("id").in("id", chunk))).toEqual({ data: [], error: null });
    expect(calls).toHaveLength(0);
  });
});

describe("sumColumn / sumByGroup", () => {
  const rows = receipts();
  const expectedTotal = mine(rows).reduce((s, r) => s + r.total, 0);

  for (const aggregates of [true, false]) {
    it(`sums every one of 2,500 rows (aggregates ${aggregates ? "on" : "off"})`, async () => {
      const { client, calls } = fakePostgrest({ pos_transactions: rows }, { aggregates });
      const { data, error } = await sumColumn((select) => client.from("pos_transactions").select(select).eq("organisation_id", ORG), "total");
      expect(error).toBeNull();
      expect(cents(data!)).toBe(cents(expectedTotal));
      expect(calls.length).toBe(aggregates ? 1 : 1 + 3);
    });

    it(`sums per group over every row (aggregates ${aggregates ? "on" : "off"})`, async () => {
      const { client } = fakePostgrest({ purchases: rows }, { aggregates });
      const { data } = await sumByGroup((select) => client.from("purchases").select(select).eq("organisation_id", ORG), "supplier_id", "total");
      const expected = new Map<string, number>();
      for (const r of mine(rows)) if (r.supplier_id) expected.set(r.supplier_id, (expected.get(r.supplier_id) ?? 0) + r.total);
      expect([...data!.keys()].sort()).toEqual([...expected.keys()].sort());
      for (const [k, v] of expected) expect(cents(data!.get(k)!)).toBe(cents(v));
    });
  }

  it("sumColumn returns 0 for no rows and passes real errors through", async () => {
    const { client } = fakePostgrest({ pos_transactions: [] }, { aggregates: true });
    expect((await sumColumn((s) => client.from("pos_transactions").select(s), "total")).data).toBe(0);
    const failing = fakePostgrest({ pos_transactions: rows }, { aggregates: true, failOn: () => true });
    const failed = await sumColumn((s) => failing.client.from("pos_transactions").select(s), "total");
    expect(failed.data).toBeNull();
    expect(failed.error).not.toBeNull();
  });
});
