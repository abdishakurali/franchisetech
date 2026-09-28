# Isolated first-sale E2E

This runbook is for a disposable Supabase project only. It must never use
Dolcenera or production credentials.

## Preconditions

Set `E2E_SUPABASE_URL`, `E2E_SUPABASE_SERVICE_ROLE_KEY`, and
`E2E_BASE_URL` in the shell (do not commit them). The database must have the
`20260917` isolated migrations applied. The service-role key is required for
the atomic posting RPCs; browser auth still uses a disposable test account.

## Sequence

1. Create a fresh test account and organisation; assert zero products.
2. Complete the minimum onboarding fields; assert no demo product was seeded.
3. Create `Cappuccino` with an explicit sales VAT rate.
4. Open a till and record one cash sale; assert a completed transaction and
   `first_sale` growth milestone.
5. Create and post one NIR; assert the matching stock movement and quantity.
6. Load the dashboard and Z-report; assert today's total equals the sale and
   the report can be viewed.
7. Repeat the sale request with the same idempotency key; assert no duplicate.

The browser portion should run with `PLAYWRIGHT_BASE_URL=$E2E_BASE_URL`.
Until those variables are supplied, only the static contract verifier can run.

## Safe verification

```sh
node scripts/verify-isolated-first-sale-contract.mjs
```

No production or customer organisation is modified by this verifier.
