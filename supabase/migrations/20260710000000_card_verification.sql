-- Card verification before trial start (2026-07-10).
-- New signups pay a one-time EUR 1 card verification charge before the 15-day
-- trial begins. Both columns are nullable and additive — existing organisations
-- (which already have trial_started_at set) are unaffected.

ALTER TABLE organisations
  ADD COLUMN IF NOT EXISTS card_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS card_verification_payment_intent text;
