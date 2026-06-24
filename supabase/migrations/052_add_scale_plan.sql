-- Add 'scale' as a valid plan value in billing_subscriptions.
-- Existing subscribers on 'starter', 'pro', 'multi_location', 'connected' are unaffected.

ALTER TABLE billing_subscriptions
  DROP CONSTRAINT IF EXISTS billing_subscriptions_plan_check;

ALTER TABLE billing_subscriptions
  ADD CONSTRAINT billing_subscriptions_plan_check
  CHECK (plan IN ('starter', 'pro', 'scale', 'connected', 'multi_location'));
