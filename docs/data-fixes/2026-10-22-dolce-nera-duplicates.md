# Dolce Nera — duplicate cash movements and one possible duplicate sale

**Status: proposal only. Nothing has been changed in production.** Every correction below needs the owner's
confirmation, case by case.

## Cause (fixed in branch `codex/pos-idempotency-perf`, not yet deployed)

Before this branch, every press of "Confirmă" in the cash in/out dialog sent a new request without an
idempotency key. The server inserted the movement, then read `expected_cash` and wrote it back. Repeated taps
on a slow connection therefore recorded the same cash out several times. The new `post_cash_movement` RPC
(applied to production on 2026-10-22, used once the branch is deployed) records each dialog submission at most
once.

All figures below are read-only queries against production on 2026-10-22. Times are Europe/Bucharest.

## A. Duplicate manual cash outs

The stored `expected_cash` already reflects every duplicate row: it was reduced once per row. The close form has a
"set to expected" button, so `cash_difference = 0` does **not** prove the cash was physically counted.

| # | Date / time | Reason | Amount | Rows recorded | Extra rows | Session close |
|---|---|---|---|---|---|---|
| 1 | 2026-07-16 11:50:37–39 | Plata gunoi cf SPCBUC01520357 | −208.00 | 4 within 2.2 s | 3 (−624.00) | counted 2,095.95 = expected → diff 0 |
| 2 | 2026-09-29 10:16:32 | Depunere banca numerar | −2,000.00 | 2 within 2.9 s | 1 (−2,000.00) | counted 527.00 vs expected −1,473.00 → **diff +2,000 recorded** |
| 3 | 2026-10-01 11:36:19 | Plata factura 0452757 | −44.00 | 2 within 1.8 s | 1 (−44.00) | counted 804.00 = expected → diff 0 |
| 4 | 2026-10-08 11:27:59 | Spcbuc01605917 | −202.00 | 2 within 1.6 s | 1 (−202.00) | counted 1,858.00 = expected → diff 0 |

How sure each case is:
- **Case 2 is almost certainly a duplicate.** The cashier counted real cash (527.00), and the recorded +2,000
  surplus is exactly the duplicate amount.
- **Cases 1, 3 and 4 are very likely duplicates.** Each pair has the same supplier invoice reference and was
  recorded within about a second. The till count can't confirm this, so the owner should check: was invoice
  SPCBUC01520357 / 0452757 / Spcbuc01605917 paid once? How much cash was really in the drawer at close?

What each correction changes:
- Removing the extra rows corrects the **Registru de Casă** report, which is derived from these rows on the fly.
- For case 2 it also turns the session's +2,000 difference into 0.
- For cases 1, 3 and 4 it raises `expected_cash` by the duplicate amount. If the owner confirms the drawer really
  held that extra cash, set `counted_cash` to the same figure so the difference stays 0. Otherwise the
  difference becomes negative, which would show a shortage.
- **Accountant:** if the July, September or October Registru de Casă / SAF-T was already exported or filed,
  tell the accountant before correcting.

### Proposed SQL (do not run without the owner's yes; run case by case, inside a transaction)

```sql
begin;
-- Case 2 (2026-09-29, −2,000 deposit recorded twice): keep the first row, remove the second.
delete from pos_cash_movements
 where id = 'b5ae8e90-8aff-4f7d-a647-13f911b58b42'
   and organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
   and amount = -2000 and reason = 'Depunere banca numerar';
update pos_sessions
   set expected_cash = expected_cash + 2000,
       cash_difference = counted_cash - (expected_cash + 2000)
 where id = '7a3be9ba-a53c-4a07-9f8a-c570eace8501';
update pos_daily_close
   set expected_cash = expected_cash + 2000,
       cash_difference = counted_cash - (expected_cash + 2000)
 where session_id = '7a3be9ba-a53c-4a07-9f8a-c570eace8501';
-- Expect: 1 row deleted, pos_sessions.cash_difference = 0. Check, then:
commit;  -- or rollback;
```

Cases 1, 3 and 4 follow the same pattern. Keep the earliest row of each group:

| Case | Remove ids | Session | Add back to expected |
|---|---|---|---|
| 1 | `574a7c56-8ae3-4aa3-8d0d-1e7e392e0f5e`, `6503613d-13ab-41f8-8056-aa709475f880`, `bb4b7725-ff30-4774-b819-fad831ff0a0b` (keep `dd719b4e-…`, the earliest) | `b4b81f42-d2a6-4a13-b4e3-2fa80cf09755` | +624.00 |
| 3 | `d82ac6b1-4320-4ce8-92dc-ff2460f663e1` (keep `d1527a36-…`) | `9743cd28-f492-4f0f-88a6-1cd258a4b679` | +44.00 |
| 4 | `cdcb2a41-cae2-4089-9aaa-606c3c7dd0a7` (keep `17df28a6-…`) | `50c44a42-6bc6-4230-814a-0e5610e4a7c6` | +202.00 |

For each of these, also decide whether `counted_cash` should rise by the same amount (the drawer really had it)
or stay as it is (a shortage is shown).

The "keep" choice for case 1 follows `performed_at`: `dd719b4e` is earliest. Re-check this before running.

## B. Possible duplicate sale (card, 2026-09-10 14:26)

- KO-MTVFZK7V and KO-MTVFZQVO: one ESPRESSO H.B. 30ml, 7.00 RON, paid by card. Same cashier, same till session,
  recorded 8.6 s apart, with **different** idempotency keys (the old per-tap key bug).
- Both have `fiscal_receipt_status = api_pending` and 0 fiscal receipt attempts, so neither printed a fiscal
  receipt through the app.
- **Owner check:** the card terminal's report for 2026-09-10 around 14:26. One 7.00 charge means the second sale
  is a duplicate and should be voided through the app's normal void flow (it reverses stock and appears in the
  audit log). No SQL needed. Two charges means two real espressos, so leave them.
