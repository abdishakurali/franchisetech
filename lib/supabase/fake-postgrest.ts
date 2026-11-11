/**
 * TEST ONLY. A small in-memory PostgREST stand-in for unit tests of code
 * that pages through results: eq / neq / in / gt / gte / lt / lte /
 * not(col, "is", null) / or() with nested and() / order / limit / range /
 * `col.sum()` aggregates grouped by the other selected columns. Like
 * PostgREST's max-rows it never returns more than `maxRows` rows (1000).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;
type Pred = (r: Row) => boolean;

const ISO = /^\d{4}-\d{2}-\d{2}([T ][\d:.]+)?(Z|[+-]\d{2}:?\d{2})?$/;

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" || typeof b === "number") return Number(a) - Number(b);
  const sa = String(a);
  const sb = String(b);
  if (ISO.test(sa) && ISO.test(sb)) return Date.parse(sa) - Date.parse(sb);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function unquote(v: string): string {
  return v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\") : v;
}

/** Split on commas that are not inside parentheses or quotes. */
function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quoted = false;
  let cur = "";
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (c === '"' && s[i - 1] !== "\\") quoted = !quoted;
    if (!quoted && c === "(") depth += 1;
    if (!quoted && c === ")") depth -= 1;
    if (!quoted && depth === 0 && c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

function opPred(col: string, op: string, value: unknown): Pred {
  switch (op) {
    case "eq": return (r) => r[col] != null && compare(r[col], value) === 0;
    case "neq": return (r) => r[col] == null || compare(r[col], value) !== 0;
    case "gt": return (r) => r[col] != null && compare(r[col], value) > 0;
    case "gte": return (r) => r[col] != null && compare(r[col], value) >= 0;
    case "lt": return (r) => r[col] != null && compare(r[col], value) < 0;
    case "lte": return (r) => r[col] != null && compare(r[col], value) <= 0;
    default: throw new Error(`fake-postgrest: unsupported operator ${op}`);
  }
}

function parseLogic(expr: string, mode: "or" | "and"): Pred {
  const preds = splitTop(expr).map((term): Pred => {
    const nested = term.match(/^(and|or)\((.*)\)$/);
    if (nested) return parseLogic(nested[2], nested[1] as "and" | "or");
    const m = term.match(/^([a-z_]+)\.([a-z]+)\.(.*)$/);
    if (!m) throw new Error(`fake-postgrest: cannot parse filter ${term}`);
    return opPred(m[1], m[2], unquote(m[3]));
  });
  return mode === "or" ? (r) => preds.some((p) => p(r)) : (r) => preds.every((p) => p(r));
}

export type FakeCall = { table: string; select: string; filters: string[] };

export function fakePostgrest(
  tables: Record<string, Row[]>,
  options: { aggregates?: boolean; maxRows?: number; failOn?: (call: FakeCall) => boolean } = {},
) {
  const maxRows = options.maxRows ?? 1000;
  const calls: FakeCall[] = [];

  const from = (table: string) => {
    const preds: Pred[] = [];
    const orders: Array<{ col: string; asc: boolean }> = [];
    const call: FakeCall = { table, select: "*", filters: [] };
    let limit = Infinity;
    let offset = 0;
    const b: Record<string, unknown> = {
      select(s: string) { call.select = s; return b; },
      eq(c: string, v: unknown) { call.filters.push(`${c}=eq`); preds.push(opPred(c, "eq", v)); return b; },
      neq(c: string, v: unknown) { call.filters.push(`${c}=neq`); preds.push(opPred(c, "neq", v)); return b; },
      gt(c: string, v: unknown) { call.filters.push(`${c}=gt`); preds.push(opPred(c, "gt", v)); return b; },
      gte(c: string, v: unknown) { call.filters.push(`${c}=gte`); preds.push(opPred(c, "gte", v)); return b; },
      lt(c: string, v: unknown) { call.filters.push(`${c}=lt`); preds.push(opPred(c, "lt", v)); return b; },
      lte(c: string, v: unknown) { call.filters.push(`${c}=lte`); preds.push(opPred(c, "lte", v)); return b; },
      in(c: string, vs: unknown[]) { call.filters.push(`${c}=in(${vs.length})`); preds.push((r) => vs.some((v) => r[c] != null && compare(r[c], v) === 0)); return b; },
      not(c: string, op: string, v: unknown) {
        if (op !== "is" || v !== null) throw new Error("fake-postgrest: only not(col, 'is', null)");
        preds.push((r) => r[c] != null);
        return b;
      },
      or(expr: string) { call.filters.push(`or(${expr})`); preds.push(parseLogic(expr, "or")); return b; },
      order(c: string, o?: { ascending?: boolean }) { orders.push({ col: c, asc: o?.ascending !== false }); return b; },
      limit(n: number) { limit = n; return b; },
      range(a: number, z: number) { offset = a; limit = z - a + 1; return b; },
      abortSignal() { return b; },
      then(resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
        return Promise.resolve(run()).then(resolve, reject);
      },
    };

    const run = () => {
      calls.push(call);
      if (options.failOn?.(call)) return { data: null, error: { message: "canceling statement due to statement timeout" } };
      const cols = splitTop(call.select).map((c) => c.trim());
      const aggs = cols.filter((c) => c.endsWith(".sum()"));
      if (aggs.length && !options.aggregates) {
        return { data: null, error: { code: "PGRST123", message: "Use of aggregate functions is not allowed" } };
      }
      let rows = (tables[table] ?? []).filter((r) => preds.every((p) => p(r)));
      if (aggs.length) {
        const groupCols = cols.filter((c) => !c.endsWith(".sum()"));
        const groups = new Map<string, Row>();
        for (const r of rows) {
          const key = JSON.stringify(groupCols.map((c) => r[c] ?? null));
          const g = groups.get(key) ?? Object.fromEntries([...groupCols.map((c) => [c, r[c] ?? null]), ...aggs.map((a) => [a.includes(":") ? a.split(":")[0] : "sum", null])]);
          for (const a of aggs) {
            const [alias, expr] = a.includes(":") ? a.split(":") : ["sum", a];
            const col = expr.replace(".sum()", "");
            if (r[col] != null) g[alias] = Number(g[alias] ?? 0) + Number(r[col]);
          }
          groups.set(key, g);
        }
        rows = [...groups.values()];
      }
      rows = [...rows].sort((a, z) => {
        for (const { col, asc } of orders) {
          if (a[col] == null && z[col] == null) continue;
          if (a[col] == null) return asc ? 1 : -1; // NULLS LAST asc, FIRST desc
          if (z[col] == null) return asc ? -1 : 1;
          const d = compare(a[col], z[col]);
          if (d !== 0) return asc ? d : -d;
        }
        return 0;
      });
      return { data: rows.slice(offset, offset + Math.min(limit, maxRows)), error: null };
    };
    return b;
  };

  return { client: { from } as unknown as SupabaseClient, calls };
}
