# FranchiseTech Critical Fixes and Features — Complete Audit

**Audit date:** 2026-10-23  
**Repository:** `/Users/abdishakuurally/projects/franchisetech`  
**Branch inspected:** `codex/pos-idempotency-perf`  
**Current HEAD:** `9602736` — `feat(invoices): numbers assigned at issue from a locked counter; storno`  
**Deployment state:** Application changes are not documented as deployed. Production deployment still requires a separate explicit decision.

## Executive decision

The critical implementation is substantially complete in the branch: duplicate-transaction protection, POS performance work, the single **„Plată”** flow, B2B invoices, stock-safe issuing, free transfers, invoice numbering, and storno are committed. Production database migrations were reported as applied and rollback-smoke-tested in the Claude transcript.

The release is **not yet ready for an unqualified production deployment**. Automated backups are restore-tested but not confirmed scheduled; there is no realistic staging validation; the new UI has not received a complete browser/till walkthrough; historical Dolce Nera duplicates remain unresolved; monitoring and rollback evidence after deployment do not yet exist.

## Evidence and confidence

This audit reconciles:

1. The original user prompt in the Claude session titled **“FranchiseTech critical fixes and features.”**
2. Three read-only Claude sub-agent audits.
3. The linked **“POS: single 'Plată' button before Cash/Card”** implementation session.
4. The linked **“Restore automated production DB backups”** session.
5. The main Claude session’s implementation and production-operation reports.
6. Git history and the current working tree inspected on 2026-10-23.

Claims are classified as:

- **Committed:** visible in the current Git history.
- **Transcript-reported:** recorded by Claude, but not independently repeated during this audit.
- **Working tree:** present locally but uncommitted.
- **Unresolved:** acceptance evidence is incomplete or an owner decision is required.

## Original request and constraints

The first prompt instructed Claude to work locally on the latest `main`, create a `codex/*` branch, inspect existing patterns, add tests before behavioral changes, preserve Romanian UI and offline POS behavior, and run tests, typecheck, build, and `scripts/predeploy-guard.sh`. It prohibited secrets, casual live-billing mutations, server-side FiscalNet calls, and direct deployment.

The requested scope was:

1. **B2B invoicing:** supplier/customer identity, CUI, lines, quantities, prices, VAT, totals, PDF similar to the supplied sample, Romanian e-Factura support, correct unit-aware stock deduction, no double deduction, and separate free transfers.
2. **POS payment UX:** one initial **„Plată”** button, followed by Cash/Card selection, without changing payment or fiscal behavior.
3. **Performance:** investigate POS checkout, navigation, cash operations, NIR, APIs, queries, rendering, and transaction handling; profile before optimizing.
4. **Duplicate prevention:** immediate feedback, disabled submission, stable idempotency, database safeguards, fiscal/stock safety, timeout-safe retry, and unambiguous outcomes.
5. **Production safety:** audit first, establish baselines, use realistic staging, write regressions, use additive migrations, back up before migrations, release incrementally, monitor, prepare rollback, never edit customer data without authorization, and never blindly replay financial/fiscal work.

The requested order was audit → duplicate safety → performance → payment UX → invoicing → staging/regression/release.

The user later added three explicit requirements:

- Apply the migrations and merge the linked „Plată” work.
- Finish and test all remaining work end-to-end before deployment.
- Do not deploy until a later decision because nothing should break.

## Sub-agent audit record

### 1. POS checkout and idempotency audit

The sub-agent was asked to map, read-only and with file/line evidence:

- Cash/Card UI, handlers, loading/disabled state, cash received, and change.
- `completeSale*`/checkout actions, idempotency fields, inserts/RPCs, stock, and fiscal flow.
- Offline queue/replay behavior and whether it retained a stable identifier.
- Database uniqueness and RPC safeguards.
- Browser-side FiscalNet printing and print deduplication.
- Existing POS/payment/offline tests and test commands.

Its findings drove the duplicate fix. The important defect was that the database already deduplicated using `(organisation, idempotency_key)`, but the client created a fresh UUID on every submit. Fast double taps therefore reached the server with different keys. Replayed sales could also re-trigger fiscal printing and analytics. Returns generated server-side keys, and cash in/out used a non-atomic read-modify-write without idempotency.

### 2. Invoicing, NIR, cash register, and stock audit

The sub-agent mapped e-Factura, partners, NIR, cash operations, stock, migrations, and flags. Key findings before implementation:

- Existing e-Factura XML/OAuth infrastructure existed, but there was no invoice PDF.
- `@react-pdf/renderer` and shared report-PDF infrastructure were already available.
- Customers/suppliers had incomplete tax/banking metadata.
- NIR posting used the `post_nir_purchase` RPC with locking and weighted-average-cost logic.
- Cash movement was a non-atomic insert plus `expected_cash` read-modify-write.
- Production stock used `quantity_change`; recipes deducted ingredients through `post_pos_document`.
- Unit labels existed but no g↔kg or ml↔litre conversion existed.
- No separate free-transfer/consum movement existed.
- The actual migration folder was `supabase/migrations/`, not the stale `db/migrations/` path in older instructions.
- Feature gating used billing entitlements and organisation module flags, not PostHog feature flags.

### 3. Performance hotspots audit

The sub-agent was asked to review recent performance work, layout queries, POS data loading, full-page refreshes, sequential action calls, N+1 loops, timing instrumentation, indexes, and stress-test material. The consolidated plan recorded these bottlenecks:

- `/app` layout performed roughly seven sequential rounds before optimization.
- POS performed roughly eleven rounds and calculated session totals in JavaScript.
- Sale completion awaited two PostHog flushes and revalidated the whole POS page.
- NIR performed independent validation steps sequentially.
- Cash correctness was primarily a race/idempotency issue rather than a missing-index issue.

## Linked implementation sessions

### Single „Plată” button

The linked session implemented commit `d0b4002`, later merged as `dd2b6f8`.

Committed behavior:

- The order step shows one full-width `h-16` **„Plată”** button.
- It retains `data-tour="pos-charge"` and the previous disabled conditions.
- Tapping freezes the cart snapshot and opens the existing payment-method step.
- Selecting Numerar still pre-fills the exact amount; Card remains available.
- Payment recording, split payments, change math, idempotency, FiscalNet, and `completeSaleReturn` were intentionally untouched.
- Romanian `Plată` and English `Pay` translations were added.

Reported verification in that session:

- 46 test files / 500 tests passed.
- TypeScript passed.
- Lint: 0 errors, 58 warnings.
- Build passed once the worktree temporarily received the main checkout’s environment file.
- Predeploy guard passed.

Known follow-up: `components/marketing/ClaudeMarketing.tsx` reportedly still described “două butoane pentru încasare.”

### Automated production database backups

The backup session corrected an earlier assumption: automated backups did not “stop” on 2026-09-15; production apparently **never had a daily backup**. Four server dumps had been created manually, and the old n8n/app-endpoint design was never enabled and cannot operate correctly from Vercel.

The approved design was:

- Postgres 17 `pg_dump` on `do-server` every day at 02:30 UTC.
- Restore every dump into a temporary local Postgres 17 database.
- Compare table row counts before considering the dump valid.
- Keep 14 days.
- Ping healthchecks.io, with log-only fallback until a URL exists.
- Document schedule, retention, recovery, and verification.

Transcript-reported test result:

- Two manual server runs completed.
- 136 tables and 52,277 rows were checked with zero mismatches.
- Public schema: 98 tables and 51,489 rows.
- Dump size about 4 MB; duration about 20 seconds.
- Roughly 30 restore warnings came from Supabase-only extensions and were excluded from row-count verification.

Current working-tree evidence:

- `scripts/backup/db-backup-nightly.sh` exists but is uncommitted.
- `docs/db-backups.md` exists but is uncommitted.

Unresolved backup work:

- The cron installation was blocked by the Claude guard and is **not confirmed installed**.
- The installed-copy verification is not complete.
- No healthchecks.io URL is documented.
- The retired backup API endpoint remains.
- Four older dump files were reported world-readable even though their directory became root-only.

## Implemented Git history

### Critical-fix branch commits

| Commit | Change | Audit status |
|---|---|---|
| `5a23a2e` | Stop duplicate sales, fiscal receipts, and cash movements on retry | Committed |
| `d1e10a0` | Remove analytics and full-page re-render from the sale path; reduce query rounds | Committed |
| `d0b4002` | Single „Plată” order-step button | Committed |
| `23f36c9` | Romanian B2B invoice, PDF, one-time stock deduction, free transfer | Committed |
| `0333c5d` | Verified pre-migration backup tooling and guarded transactional production migration apply | Committed |
| `dd2b6f8` | Merge the linked „Plată” branch | Committed |
| `daa82b9` | Exclude Claude session worktrees from lint/tests | Committed |
| `9602736` | Locked invoice numbering at issue time and storno | Committed/current HEAD |

### Duplicate and financial-operation safety

Commit `5a23a2e` changed 15 files and added tests and helpers for:

- Stable sale-attempt idempotency across retries/reloads.
- Double-submit prevention in `PosRegister`.
- Sale replay recognition.
- Fiscal print guarding.
- Atomic/idempotent cash movement RPC migration.
- Cart backup retention of the sale-attempt identity.
- User feedback during slow submission.

The main transcript also reports that returns and till close received duplicate protection and that analytics/milestone effects no longer replay for an idempotent sale.

### Performance

Commit `d1e10a0` changed layout, POS page, sale action, client behavior, timing helpers, baseline documentation, and a read-only integrity script.

Transcript-reported outcomes:

- POS data loading fell from about eleven query rounds to about four.
- Shared app setup fell from about four rounds to one.
- Sale completion no longer blocks on analytics flushes.
- Sale completion no longer revalidates/rebuilds the entire POS page.
- Independent NIR validations run in parallel.

Limit: these are structural/static improvements and transcript observations. No accepted before/after production latency dataset exists.

### B2B invoices, inventory, and free transfer

Commit `23f36c9` added or changed 27 files, including:

- Invoice creation/detail/list behavior.
- Downloadable invoice PDF.
- e-Factura/UBL party and tax handling.
- Invoice/customer/supplier metadata settings.
- Stock-unit conversion helpers and tests.
- Exact invoice total calculations and tests.
- One-time stock deduction protected in the database.
- Recipe-based and direct-product deduction.
- Separate **transfer gratuit** action, form, numbering, stock movement, and cost valuation.
- Accountant/export visibility.

The main transcript reports that the PDF matched the supplied sample total of `1,135.05`, and that non-VAT-registered buyer identifiers no longer incorrectly gained an `RO` prefix.

### Invoice numbering and storno

Commit `9602736` added:

- Invoice numbers assigned at issue time from a locked database counter.
- Draft/issued distinction.
- Storno creation and links between original and storno invoices.
- Negative storno totals generated from a shared tested helper.
- Storno stock reversal behavior.
- Shared rounding behavior across screen, PDF, and XML.
- Romanian labels/settings and accounting/export visibility.

This resolves the earlier main-session follow-ups that numbers were not concurrency-safe and credit notes were absent.

## Database and production-operation record

The main Claude transcript reports:

- A verified pre-migration export was created at `~/franchisetech-backups/supabase/pre-migration-20261022T112153Z`.
- The backup covered 97 public tables and 51,489 rows.
- Two migrations were applied in one transaction:
  - `20261022120000_post_cash_movement_rpc.sql`
  - `20261022130000_b2b_invoice_stock_and_free_issue.sql`
- Schema drift checks passed.
- A production smoke test ran inside a rolled-back transaction using a synthetic organisation, leaving no persistent data.
- It tested:
  - Cash in/out replay: recorded once; expected cash `100 → 130`.
  - Invoice replay: stock deducted once.
  - 50 g matcha conversion: 1 kg → 0.95 kg.
  - Two lattes: 0.036 kg coffee deducted via recipe.
  - Free-transfer replay: recorded once, `TG-2026-000001`, cost value `10.00`.
- Commit `9602736` added a further numbering/storno migration. The visible transcript shows this migration being built and tested locally, but this audit found no equally explicit transcript statement confirming its production application. Treat its production state as **unverified**.

No production deploy of the application code is documented.

## Verification record

### Main-session verification reported after merging „Plată”

- 512 tests passed.
- TypeScript passed.
- Build passed.
- Lint initially reported 3,006 errors because it traversed the linked `.claude/worktrees` build output.
- After excluding those worktrees, lint passed with zero errors.
- `scripts/predeploy-guard.sh` passed.

### Later numbering/storno verification reported before the usage limit

- Main Claude UI stated: “All 516 tests pass with zero lint errors.”
- The same session said screen, PDF, and XML shared one rounding function.
- Claude then hit its weekly usage limit before finishing the larger end-to-end/staging objective.

### Verification not performed by this audit

This document-generation pass did not rerun tests, typecheck, build, predeploy guard, database queries, or production UI actions. The counts above are historical evidence from the Claude transcripts and must be refreshed before release.

## Current working tree

The tree was dirty when audited:

- Modified: `lib/marketing/blog.ts` — approximately 220 added lines; unrelated marketing work.
- Modified: `supabase/.temp/cli-latest` — temporary CLI state; should not be included in the critical-fix release without a deliberate reason.
- Untracked: `docs/db-backups.md`.
- Untracked: `scripts/backup/db-backup-nightly.sh`.
- Untracked: `growth/` — marketing drafts, outreach, lead CSVs, and briefs.
- Untracked: `stress-test/franchisetech/` — assumptions, evidence, contradictions, decisions, experiments, and report.

These files must be classified and isolated before release. The backup script/docs belong to the critical safety objective; marketing/growth/stress-test work should not be swept into the release accidentally.

## Acceptance-criteria matrix

| Acceptance criterion | Evidence | Status |
|---|---|---|
| Repeated submit does not create duplicate orders | Stable client attempt key, DB uniqueness/RPC, double-submit tests | Implemented; production UI retry still needs smoke test |
| No duplicate fiscal document | Print guard and replay detection tests | Implemented; real FiscalNet end-to-end test remains |
| No duplicate cash movement | Idempotent atomic RPC and rollback smoke test | Implemented; production schema reported applied |
| No duplicate stock deduction | Invoice/free-transfer idempotency plus rollback smoke test | Implemented for the reported migration |
| Immediate loading/progress feedback | POS submit guard and delayed “do not tap again” feedback | Implemented |
| Timeout/reload retains transaction identity | Sale-attempt/cart-backup helpers | Implemented/tested |
| Payment workflow remains equivalent | „Plată” tests assert unchanged payload; core payment code untouched | Implemented/tested locally |
| POS/navigation/NIR/cash are measurably faster | Structural query/await reductions | Partial: no accepted before/after latency measurements |
| Invoice totals and PDF are correct | Totals/PDF tests and transcript sample match | Implemented/tested locally |
| e-Factura output is correct | Existing UBL infrastructure plus new party/rounding tests | Implemented locally; external ANAF validation not documented |
| Invoice stock updates once with unit conversion | Unit helpers/tests and rollback smoke test | Implemented |
| Free transfers are separate from revenue | Separate action/document/stock movement | Implemented |
| Invoice number is concurrency-safe | Locked counter at issue time | Implemented; production migration state unverified |
| Storno reverses invoice/stock consistently | Commit `9602736` and tests | Implemented locally; production migration/UI E2E unverified |
| Historical customer data remains intact | Additive migrations and rolled-back synthetic smoke test | Strong evidence; still requires release monitoring |
| Verified backup before migrations | Manual verified export reported | Complete for the earlier migrations |
| Daily automated verified backup | Script/manual restore test exists | **Incomplete: cron/alert not confirmed installed** |
| Realistic staging validation | No paid Supabase branch/staging clone available | **Incomplete** |
| Incremental observable release | No application deploy yet | **Pending** |
| Tested rollback | DB smoke transaction rolled back; additive schema | Partial: application rollback drill not documented |

## Historical production-data issue

The main transcript reports a read-only Dolce Nera investigation found:

- Nine identical cash-out pairs, latest dated 2026-10-08.
- One probable duplicate sale.

No correction was authorized or performed. The commit `9602736` includes `docs/data-fixes/2026-10-22-dolce-nera-duplicates.md`, which should remain the basis for an explicit owner/accountant decision. Financial or fiscal rows must not be deleted or replayed blindly.

## Remaining work, in release order

### P0 — Backup durability

1. Review and commit the backup script and runbook separately.
2. Install the approved script, cron entry, and log rotation on `do-server` using the runbook.
3. Configure a healthchecks.io heartbeat or explicitly accept log-only monitoring.
4. Run the installed copy and verify a successful dump, scratch restore, and zero row-count mismatches.
5. Restrict the four old dump files themselves to root-only access.
6. Retire or clearly disable the dead Vercel-incompatible backup endpoint.

### P0 — Release-state verification

1. Confirm production migration history, including the numbering/storno migration introduced by `9602736`.
2. Ensure all migrations are additive and the local/production schema drift guard passes.
3. Separate unrelated dirty marketing, growth, stress-test, and temp-state files from the release.
4. Refresh the complete gate from the current HEAD:
   - focused financial/idempotency tests;
   - full Vitest suite;
   - `npx tsc --noEmit`;
   - lint;
   - production build;
   - `bash scripts/predeploy-guard.sh`.

### P0 — End-to-end acceptance without production writes

Use an isolated local/staging database with production-like anonymised structure and test:

1. Double-tap and timeout/retry for cash and card sales.
2. Reload with an in-flight cart and reuse the same attempt key.
3. Fiscal print retry/acknowledgement without double printing.
4. Cash in/out replay and concurrent sale/cash movement.
5. Return replay and till close replay.
6. NIR draft/post, weighted average cost, and repeated post.
7. Invoice draft → issue → PDF → XML → stock deduction.
8. Direct stock and recipe stock using g/kg and ml/litre conversions.
9. Repeated invoice issue and repeated free transfer.
10. Storno creation, negative totals, PDF/XML, stock restoration, and replay.
11. Romanian mobile/till UX for „Plată”, payment selection, loading, success, and failure.

If realistic staging cannot be created, this is a conscious residual risk and must be recorded before deployment.

### P1 — Observability and release

1. Capture a baseline for POS checkout, app navigation, NIR, and cash operations.
2. Prepare an incremental deploy and rollback checklist.
3. Deploy only after explicit approval.
4. Smoke-test read-only and isolated flows immediately after release.
5. Monitor errors, idempotent replays, fiscal states, stock movements, invoice issuance, Stripe entitlements, and activation events for at least 48 hours.
6. Compare post-release latency with the baseline.

### Owner/accountant decisions

1. Decide how to correct the Dolce Nera duplicate cash-outs and probable duplicate sale.
2. Confirm the accounting treatment and wording of **transfer gratuit**.
3. Confirm whether the backup heartbeat will use healthchecks.io.
4. Decide whether lack of realistic staging blocks deployment.

## Recommended release decision

**Do not deploy yet.** First complete the automated-backup installation, confirm all production migrations, isolate the dirty working tree, refresh the verification gate from `9602736`, and run the end-to-end matrix against non-production data. After those pass, prepare a deployment decision with explicit rollback and 48-hour monitoring ownership.

## Immediate next command

```bash
git diff -- docs/db-backups.md scripts/backup/db-backup-nightly.sh
```

Because both paths are untracked, review them directly as well:

```bash
sed -n '1,260p' docs/db-backups.md
sed -n '1,320p' scripts/backup/db-backup-nightly.sh
```
