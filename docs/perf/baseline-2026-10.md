# POS / cash / NIR performance baseline — October 2026

Branch: `codex/pos-idempotency-perf`

## Status of measurements

- **Production latency percentiles are not available.** Vercel's observability query API returned
  `402 payment_required` (Observability Plus, Pro plan). No numbers in this document are measured
  production timings.
- **Measured timings will come from `PERF_LOG=1`.** `lib/perf/timing.ts` logs `[perf] <label> <ms> <steps>`
  for `completeSaleReturn`, `pos_page`, `app_layout`, `postNirPurchase` and `post_cash_movement`.
  It's a no-op unless the env var is set.

## How to capture the baseline (before/after)

1. Deploy `main` (before) and this branch (after) as Vercel **preview** deployments, both with
   `PERF_LOG=1`, pointed at the staging Supabase branch.
2. On each: open `/app/pos` 20×, complete 20 sales, do 5 cash in/out and post 5 NIRs.
3. `vercel logs <preview-url> | grep "\[perf\]"`, then record p50/p95 per label in the table below.

| Path | Before p50 / p95 | After p50 / p95 |
|---|---|---|
| `completeSaleReturn` (sale → response) | _to measure_ | _to measure_ |
| `pos_page` (POS load) | _to measure_ | _to measure_ |
| `app_layout` (every `/app/*` navigation) | _to measure_ | _to measure_ |
| `post_cash_movement` | _to measure_ | _to measure_ |
| `postNirPurchase` | _to measure_ | _to measure_ |

## Structural changes (counted from code, not measured)

| Path | Before | After |
|---|---|---|
| Sale response | 2 awaited PostHog network flushes plus a milestone org read; then the whole `/app/pos` page re-rendered inside the action response (≈11 query rounds) | PostHog and the milestone run in `after()`. `/app/pos` is no longer revalidated in the response; the POS refreshes in the background 1.5s after a confirmed sale (debounced). The fiscal-status write runs concurrently with the kitchen ticket. |
| POS page load | ≈11 sequential query rounds | ≈4 rounds: (1) context, (2) locale/subscription plus all org reads concurrently, (3) seed inserts only if missing, (4) session-dependent reads concurrently |
| `/app` layout | sites → referral → module flags → module guard: 4 sequential rounds | 1 concurrent round |
| Cash in/out | insert → read `expected_cash` → write `expected_cash` (3 round trips, racy) | 1 RPC (`post_cash_movement`), atomic |
| NIR save/post pre-checks | VAT → units → product names: 3 sequential rounds | 1 concurrent round |

## Not changed yet (candidates once measured)

- The open-session summary still loads every completed transaction of the session (with items and
  payments) and sums in JS. Replace it with an SQL aggregate if `pos_page` timings show it grows with
  shift length.
- Possible indexes `pos_transactions(organisation_id, status)` and
  `pos_sessions(organisation_id, site_id, status, opened_at desc)`. Add them only if `EXPLAIN` on
  staging shows sequential scans.
- Double auth round-trip per navigation (middleware + layout). Left as-is: it's a security boundary.

## Duplicate-record baseline (production, read-only, 2026-10-22)

From `scripts/audit/pos-integrity-readonly.sh`:

- Live `post_pos_document` is the full production body (stock deduction, org lock, cash). The E2E
  redefinition was never applied.
- Probable duplicate sales (same session, total and items, ≤10s apart, last 90 days): **1 pair**
  (Dolce Nera, 2026-09-10).
- Probable duplicate manual cash in/out (≤30s): **Dolce Nera 9 pairs** (most recent 2026-10-08),
  Restaurant Test 1 pair.
- Sessions with duplicate `pos_daily_close` rows: Emerald Bites 4, Dolce Nera 3 (all June 2026).
- Fiscal receipt attempts >1 per transaction: 0.

No production data was modified. Correcting any of these rows needs the owner's explicit
authorisation, and is out of scope here.
