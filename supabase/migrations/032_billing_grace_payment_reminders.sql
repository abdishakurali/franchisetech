-- 032: Grace period column + payment_reminders table
-- Implements: 3-day grace period on failed subscription renewal,
--             idempotent 15-minute billing reminder log.

-- ── 1. grace_period_ends_at on billing_subscriptions ────────────────────────
ALTER TABLE billing_subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_ends_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_grace
  ON billing_subscriptions(grace_period_ends_at)
  WHERE grace_period_ends_at IS NOT NULL;

-- ── 2. payment_reminders ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_reminders (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid         NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  reminder_type    text         NOT NULL CHECK (reminder_type IN (
    'trial_expired',
    'past_due_grace',
    'past_due_final'
  )),
  -- Floored to 15-minute boundary — used for deduplication
  window_start     timestamptz  NOT NULL,
  sent_at          timestamptz  NOT NULL DEFAULT now(),
  channel          text         NOT NULL DEFAULT 'email',
  recipient        text,
  status           text         NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message    text,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

-- One reminder per org per type per 15-min window = idempotent retries are safe
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_reminders_idempotent
  ON payment_reminders(organisation_id, reminder_type, window_start);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_org
  ON payment_reminders(organisation_id);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_window
  ON payment_reminders(reminder_type, window_start DESC);

-- RLS: service role writes; org members can read their own history
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_reminders_select_member" ON payment_reminders;
CREATE POLICY "payment_reminders_select_member" ON payment_reminders
  FOR SELECT USING (is_org_member(organisation_id));

DROP POLICY IF EXISTS "payment_reminders_no_public_write" ON payment_reminders;
CREATE POLICY "payment_reminders_no_public_write" ON payment_reminders
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "payment_reminders_no_public_update" ON payment_reminders;
CREATE POLICY "payment_reminders_no_public_update" ON payment_reminders
  FOR UPDATE USING (false);
