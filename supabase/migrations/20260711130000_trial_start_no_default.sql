-- Removes the DB-level defaults on organisations.trial_started_at / trial_ends_at
-- (added in 015_referrals_trial.sql as `default now()` / `default (now() + interval
-- '15 days')`). Those defaults silently started every trial at org-creation time,
-- regardless of application code, because create_organisation_with_owner's INSERT
-- never lists these columns — Postgres just filled them from the default. That
-- defeated the card-verification gate (20260710000000_card_verification.sql): the
-- trial was already "started" before the app ever got a chance to gate it.
--
-- Metadata-only change — does not touch existing rows, only affects future inserts
-- that omit these columns. Confirmed no other code path relies on the default.

ALTER TABLE organisations
  ALTER COLUMN trial_started_at DROP DEFAULT,
  ALTER COLUMN trial_ends_at DROP DEFAULT;
