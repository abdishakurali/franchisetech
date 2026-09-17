# Design implementation checkpoint — 2026-09-16

Status: partially implemented locally; not deployed or accepted as a complete design match.

## Latest instruction: never deploy

The user explicitly prohibited deployment. This overrides earlier deployment requests, even if a guard later passes.

## Isolated authenticated testing readiness

Read-only checks on 2026-09-16 confirmed that the separate project
`franchisetech-restore-rehearsal-scratch` (`zztmkanzaxzpfncbtbke`) exists,
but lacks `public.stock_movements` and `public.pos_sessions`,
which the current application requires. The project's
`organisations`, `organisation_members`, and `pos_transactions` do exist;
American-spelling table names are not used by this application.
Comparing public base tables across projects found 93 in production and 80
in scratch, with 13 absent in scratch. The remaining gaps include
`nir_sequences`, `pos_cash_movements`, `inventory_counts`, and
`inventory_count_items`.

The existing staging verification command fails closed because the four
`STAGING_*` configuration variables are absent. Docker is not installed/available
on PATH, so a local Supabase stack is not currently available either.

No authenticated journey has been run. Do not follow the older local-test-pass
document's instruction to log in as Dolcenera. Next prerequisite: a schema-complete
isolated database and dedicated test account, configured securely outside chat,
with test-mode integrations. Do not copy live customer records or use production
credentials to bypass this prerequisite. Preparing/rebuilding the scratch database
requires confirming that it is disposable first.

## Reference and safety

The supplied `2 App Design.dc.html` and `3 Marketing Design.dc.html` are the visual references. Existing application operations remain authoritative for behavior. No production data changes are authorized for this design work; Dolcenera must remain untouched. The local `/design-review` route uses explicitly labeled fixtures, makes no database calls, and returns 404 in production.

## Local changes

- Romanian home, features, industries, equipment and pricing use the supplied marketing styling and assets; signup links preserve plan selection.
- The new public navigation includes the existing `/compare` (Comparații) and `/blog` (Ghiduri) pages on desktop and mobile.
- Settings presents units, payment methods, categories, location and FiscalNet together. Existing editors open inline. Additional business, account and integration settings remain accessible.
- Setup checklist uses five steps. Signup/onboarding styling, Reports, stock and POS presentation have changes pending full acceptance.
- Reports chart consumes report data; it does not present sales as profit.
- Merely viewing app/settings no longer creates a missing referral code.
- Product and purchase list/forms no longer seed categories, payment methods, or VAT rates during page rendering; those defaults are created during onboarding. Existing organizations lacking defaults need an explicit setup path before editing.
- Explicit Marketplace links target `tab=marketplace`; legacy `tab=integrations` retains its fiscal-section compatibility mapping.

## Evidence

- Production build completed successfully.
- TypeScript, focused Settings lint and whitespace checks passed after the Marketplace link correction.
- Existing unit suite: 355 tests passed across 21 files.
- Browser checks cover marketing-to-signup navigation without form submission and isolated Settings on desktop and mobile.
- Desktop/mobile Settings screenshots were visually inspected. These fixture screenshots do not verify authenticated data or write operations.

## Deployment blocker

`bash scripts/predeploy-guard.sh` returned BLOCKED: production migration versions missing from the local history/baseline:

- `20260915110455`
- `20260915111100`
- `20260915135522`
- `20260915165312`
- `20260916095829`

Do not bypass the guard or add unexplained baseline exemptions. Reconcile the actual migration history before any deployment. Do not modify already committed migrations.

## Remaining acceptance work

- Full authenticated journey in an isolated test organization/database: onboarding, first sale, purchases, stock, reports and settings persistence.
- Complete page-by-page comparison for dashboard, products, recipes, secondary forms and reports; current tests are not proof of full visual parity.
- Verify real FiscalNet hardware locally. Current Settings status reflects recorded attempts, not a live connection test.
- Settings unit usage counts and exact source layout details remain to be reconciled without altering customer units.
- Marketing reference sections needing verified testimonials/media are not substituted with invented claims. English routes retain their prior presentation.
- Video inspection is unverified: extraction was blocked by the tool approval review.
- Production deployment, payment submission, fiscal printing and customer data mutation have not been performed in this design pass.
