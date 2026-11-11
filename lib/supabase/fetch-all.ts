/**
 * Read every row of a PostgREST query, not just the first 1000.
 *
 * PostgREST caps each response at `max-rows` (1000 on Supabase) and does
 * NOT error when it does: an un-paginated `.select()` over a month of sales
 * returns the first 1000 rows and every total built on it is silently low.
 *
 * Keyset (seek) pagination, not `.range()` offsets: OFFSET n makes Postgres
 * build and throw away n rows on every page, so the whole read is quadratic
 * (that is what timed out the gestiune PDF on 2026-11-10). Each keyset page
 * starts where the previous one ended, so every page costs the same.
 */

export const PAGE_SIZE = 1000;

/** Postgres caps how many ids we put in one `in.(...)` filter (URL length). */
export const IN_CHUNK_SIZE = 200;

/** Unique, non-null sort key of canonical_sales_lines (a UNION ALL view with
 * no id): a sale line is unique per item; a return line per (item, return
 * number). Every query paged with it must select these four columns. */
export const SALES_LINE_KEYS = ["sold_at", "transaction_item_id", "direction", "transaction_number"];

/** payment_events is unique on (organisation_id, idempotency_key). */
export const PAYMENT_EVENT_KEYS = ["occurred_at", "idempotency_key"];

type PgError = { message: string; code?: string; details?: string; hint?: string };
type Result<T> = { data: T[] | null; error: PgError | null };

/** The subset of PostgrestFilterBuilder this module calls. */
export type PageableQuery = {
  gt(column: string, value: unknown): PageableQuery;
  lt(column: string, value: unknown): PageableQuery;
  gte(column: string, value: unknown): PageableQuery;
  lte(column: string, value: unknown): PageableQuery;
  or(filters: string): PageableQuery;
  not(column: string, operator: string, value: unknown): PageableQuery;
  order(column: string, options?: { ascending?: boolean }): PageableQuery;
  limit(count: number): PageableQuery;
  abortSignal(signal: AbortSignal): PageableQuery;
  then: PromiseLike<{ data: unknown; error: PgError | null }>["then"];
};

export type FetchAllOptions = {
  /**
   * Columns that together are UNIQUE and NOT NULL for every row, most
   * significant first. They must be top-level columns in the select.
   * Defaults to ["id"]. Rows come back ordered by these keys.
   */
  keys?: string[];
  /** Sort descending on every key instead of ascending. */
  descending?: boolean;
  pageSize?: number;
  signal?: AbortSignal;
};

/** Quote a value for use inside a PostgREST or=(...) filter. */
export function pgrstQuote(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * The "strictly after this row" filter for a composite key:
 * (k1 > v1) OR (k1 = v1 AND k2 > v2) OR (k1 = v1 AND k2 = v2 AND k3 > v3) ...
 */
export function keysetAfterFilter(keys: string[], values: unknown[], descending = false): string {
  const op = descending ? "lt" : "gt";
  const branches: string[] = [];
  for (let i = 0; i < keys.length; i += 1) {
    const eqs = keys.slice(0, i).map((k, j) => `${k}.eq.${pgrstQuote(values[j])}`);
    const tail = `${keys[i]}.${op}.${pgrstQuote(values[i])}`;
    branches.push(eqs.length ? `and(${[...eqs, tail].join(",")})` : tail);
  }
  return branches.join(",");
}

/**
 * `build` must return a FRESH query each call, with `.select()` and all
 * filters applied but no `.order()`, `.limit()` or `.range()`.
 *
 * Returns `{ data, error }` like a single query. On any failed page it
 * returns `data: null` and the error -- never a partial list, which would
 * be a wrong-but-plausible total.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rows are as untyped as the client's
export async function fetchAll<T = any>(build: () => unknown, options: FetchAllOptions = {}): Promise<Result<T>> {
  const keys = options.keys ?? ["id"];
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const ascending = !options.descending;
  const rows: T[] = [];
  let cursor: unknown[] | null = null;

  for (;;) {
    let query = build() as PageableQuery;
    if (cursor) {
      if (keys.length === 1) {
        query = ascending ? query.gt(keys[0], cursor[0]) : query.lt(keys[0], cursor[0]);
      } else {
        // The leading-key bound lets Postgres use an index range scan; the
        // or() then trims ties on the leading key.
        query = ascending ? query.gte(keys[0], cursor[0]) : query.lte(keys[0], cursor[0]);
        query = query.or(keysetAfterFilter(keys, cursor, !ascending));
      }
    }
    for (const key of keys) query = query.order(key, { ascending });
    query = query.limit(pageSize);
    if (options.signal) query = query.abortSignal(options.signal);

    const { data, error } = await query;
    if (error) return { data: null, error };
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < pageSize) break;

    const last = page[page.length - 1] as Record<string, unknown>;
    cursor = keys.map((key) => {
      const value = last[key];
      if (value === undefined || value === null) {
        throw new Error(`fetchAll: key column "${key}" is missing or null in a row; select it and use NOT NULL keys`);
      }
      return value;
    });
  }
  return { data: rows, error: null };
}

/**
 * fetchAll for a filter `column in (ids)`, split into chunks so a long id
 * list never blows the URL limit. `build(chunk)` applies `.in(column, chunk)`.
 * An empty id list returns no rows without a query.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rows are as untyped as the client's
export async function fetchAllIn<T = any>(
  ids: readonly string[],
  build: (chunk: string[]) => unknown,
  options: FetchAllOptions & { chunkSize?: number } = {},
): Promise<Result<T>> {
  const unique = [...new Set(ids)];
  const size = options.chunkSize ?? IN_CHUNK_SIZE;
  const rows: T[] = [];
  for (let i = 0; i < unique.length; i += size) {
    const chunk = unique.slice(i, i + size);
    const { data, error } = await fetchAll<T>(() => build(chunk), options);
    if (error) return { data: null, error };
    rows.push(...(data ?? []));
  }
  return { data: rows, error: null };
}

/** PostgREST error when db-aggregates-enabled is off. */
const AGGREGATES_DISABLED = "PGRST123";

/**
 * Sum one numeric column over every matching row, in the database
 * (`col.sum()`), so the 1000-row cap never applies. `build(select)` must
 * return a fresh filtered query using the given select string. If PostgREST
 * aggregates are switched off it falls back to paging the rows with
 * fetchAll (`options.keys`, default ["id"]) and summing them here.
 */
export async function sumColumn(
  build: (select: string) => unknown,
  column: string,
  options: FetchAllOptions = {},
): Promise<{ data: number | null; error: PgError | null }> {
  let query = build(`${column}.sum()`) as PageableQuery;
  if (options.signal) query = query.abortSignal(options.signal);
  const { data, error } = await query;
  if (!error) {
    const row = (Array.isArray(data) ? data[0] : data) as { sum?: number | string | null } | undefined;
    return { data: Number(row?.sum ?? 0), error: null };
  }
  if (error.code !== AGGREGATES_DISABLED) return { data: null, error };

  const keys = options.keys ?? ["id"];
  const select = [...new Set([...keys, column])].join(",");
  const rows = await fetchAll<Record<string, unknown>>(() => build(select), options);
  if (rows.error) return { data: null, error: rows.error };
  return { data: (rows.data ?? []).reduce((sum, row) => sum + Number(row[column] ?? 0), 0), error: null };
}

/**
 * Sum `column` per value of `groupBy` in the database
 * (`groupBy,column.sum()`), paging the grouped result. Falls back to paging
 * the raw rows (`options.keys`, default ["id"]) and grouping here when
 * PostgREST aggregates are off. Null group values are skipped.
 */
export async function sumByGroup(
  build: (select: string) => unknown,
  groupBy: string,
  column: string,
  options: FetchAllOptions = {},
): Promise<{ data: Map<string, number> | null; error: PgError | null }> {
  const totals = new Map<string, number>();
  // Null groups are excluded in the query so the keyset cursor (the group
  // value itself) is never null.
  const grouped = await fetchAll<Record<string, unknown>>(
    () => (build(`${groupBy},${column}.sum()`) as PageableQuery).not(groupBy, "is", null),
    { ...options, keys: [groupBy] },
  );
  if (!grouped.error) {
    for (const row of grouped.data ?? []) {
      if (row[groupBy] != null) totals.set(String(row[groupBy]), Number(row.sum ?? 0));
    }
    return { data: totals, error: null };
  }
  if (grouped.error.code !== AGGREGATES_DISABLED) return { data: null, error: grouped.error };

  const keys = options.keys ?? ["id"];
  const select = [...new Set([...keys, groupBy, column])].join(",");
  const rows = await fetchAll<Record<string, unknown>>(() => build(select), options);
  if (rows.error) return { data: null, error: rows.error };
  for (const row of rows.data ?? []) {
    const group = row[groupBy];
    if (group == null) continue;
    totals.set(String(group), (totals.get(String(group)) ?? 0) + Number(row[column] ?? 0));
  }
  return { data: totals, error: null };
}
