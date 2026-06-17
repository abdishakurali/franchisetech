-- 016_referral_rpcs_and_unique_constraint.sql
-- Captures live SECURITY DEFINER RPCs into source control.
-- Fixes credit_referral ON CONFLICT bug (was on random id, now on referred_organisation_id).
-- Adds UNIQUE index so concurrent webhook retries cannot double-credit.

-- 1. Unique partial index prevents two referral rows for the same referred org.
CREATE UNIQUE INDEX IF NOT EXISTS uq_referrals_referred_org
  ON referrals (referred_organisation_id)
  WHERE referred_organisation_id IS NOT NULL;

-- 2. ensure_referral_code — idempotent code generator.
CREATE OR REPLACE FUNCTION public.ensure_referral_code(p_org_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_code TEXT; i INT := 0;
BEGIN
  SELECT referral_code INTO v_code FROM organisations WHERE id = p_org_id;
  IF v_code IS NOT NULL THEN RETURN v_code; END IF;
  WHILE i < 5 LOOP
    v_code := 'FT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_org_id::TEXT || i::TEXT) FROM 1 FOR 6));
    BEGIN
      UPDATE organisations SET referral_code = v_code WHERE id = p_org_id AND referral_code IS NULL;
      IF FOUND THEN RETURN v_code; END IF;
    EXCEPTION WHEN unique_violation THEN END;
    i := i + 1;
  END LOOP;
  RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.ensure_referral_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_referral_code(uuid) TO authenticated, service_role;

-- 3. credit_referral — credits referrer when new org makes first payment.
--    ON CONFLICT (referred_organisation_id) ensures atomic exactly-once insert.
CREATE OR REPLACE FUNCTION public.credit_referral(
  p_new_org_id uuid, p_referred_email text, p_referral_code text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_referrer_id UUID; v_inserted BOOLEAN := FALSE;
BEGIN
  SELECT id INTO v_referrer_id FROM organisations
  WHERE referral_code = p_referral_code AND id != p_new_org_id;
  IF v_referrer_id IS NULL THEN RETURN; END IF;
  UPDATE organisations SET referred_by_code = p_referral_code
  WHERE id = p_new_org_id AND referred_by_code IS NULL;
  INSERT INTO referrals (
    organisation_id, referrer_organisation_id, referral_code,
    referred_email, referred_organisation_id, status, credit_months, signed_up_at, credited_at
  ) VALUES (
    p_new_org_id, v_referrer_id, p_referral_code,
    p_referred_email, p_new_org_id, 'credited', 1, NOW(), NOW()
  ) ON CONFLICT (referred_organisation_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF (v_inserted::int) > 0 THEN
    UPDATE organisations
    SET referral_credit_months = COALESCE(referral_credit_months, 0) + 1,
        referral_credit_note = 'Your free month credit will be applied to your next billing cycle.'
    WHERE id = v_referrer_id;
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.credit_referral(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.credit_referral(uuid,text,text) TO authenticated, service_role;

-- 4-6. Reminder RPCs (captured as-is from production).
CREATE OR REPLACE FUNCTION public.get_due_reminder_schedules(p_now timestamptz DEFAULT now())
RETURNS TABLE(id uuid, organisation_id uuid, site_id uuid, asset_id uuid, reminder_type text, label text,
  days_of_week integer[], time_of_day time, timezone text, recipients text[], last_sent_at timestamptz,
  org_name text, asset_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT rs.id, rs.organisation_id, rs.site_id, rs.asset_id, rs.reminder_type, rs.label,
    rs.days_of_week, rs.time_of_day, rs.timezone, rs.recipients, rs.last_sent_at, o.name, a.name
  FROM reminder_schedules rs JOIN organisations o ON o.id = rs.organisation_id
  LEFT JOIN assets a ON a.id = rs.asset_id WHERE rs.enabled = true;
END; $$;
REVOKE ALL ON FUNCTION public.get_due_reminder_schedules(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_due_reminder_schedules(timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.log_reminder_send(
  p_organisation_id uuid, p_schedule_id uuid, p_recipient text, p_subject text, p_status text,
  p_provider_message_id text DEFAULT NULL, p_error text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO reminder_send_log (organisation_id, reminder_schedule_id, recipient, subject,
    status, provider_message_id, error)
  VALUES (p_organisation_id, p_schedule_id, p_recipient, p_subject, p_status, p_provider_message_id, p_error);
END; $$;
REVOKE ALL ON FUNCTION public.log_reminder_send(uuid,uuid,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_reminder_send(uuid,uuid,text,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_reminder_sent(p_schedule_id uuid, p_sent_at timestamptz DEFAULT now())
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE reminder_schedules SET last_sent_at = p_sent_at WHERE id = p_schedule_id;
END; $$;
REVOKE ALL ON FUNCTION public.mark_reminder_sent(uuid,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_reminder_sent(uuid,timestamptz) TO service_role;
