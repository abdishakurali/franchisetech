-- 045: Owner digest email settings on organisations + send log + cron RPCs

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS owner_digest_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_digest_frequency text NOT NULL DEFAULT 'off'
    CHECK (owner_digest_frequency IN ('off', 'daily', 'weekly')),
  ADD COLUMN IF NOT EXISTS owner_digest_day_of_week int NOT NULL DEFAULT 1
    CHECK (owner_digest_day_of_week BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS owner_digest_time_of_day time NOT NULL DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS owner_digest_timezone text NOT NULL DEFAULT 'Europe/Bucharest',
  ADD COLUMN IF NOT EXISTS owner_digest_recipients text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS owner_digest_last_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.owner_digest_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient text,
  subject text,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message text,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_owner_digest_send_log_idempotent
  ON public.owner_digest_send_log (organisation_id, window_start);

CREATE INDEX IF NOT EXISTS idx_owner_digest_send_log_org
  ON public.owner_digest_send_log (organisation_id, sent_at DESC);

ALTER TABLE public.owner_digest_send_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_digest_send_log_select_member ON public.owner_digest_send_log;
CREATE POLICY owner_digest_send_log_select_member ON public.owner_digest_send_log
  FOR SELECT USING (is_org_member(organisation_id));

DROP POLICY IF EXISTS owner_digest_send_log_no_public_write ON public.owner_digest_send_log;
CREATE POLICY owner_digest_send_log_no_public_write ON public.owner_digest_send_log
  FOR INSERT WITH CHECK (false);

-- List orgs with digest enabled (cron filters schedule in app layer)
CREATE OR REPLACE FUNCTION public.get_owner_digest_orgs()
RETURNS TABLE (
  organisation_id uuid,
  org_name text,
  country_code text,
  currency_code text,
  inventory_enabled boolean,
  owner_digest_frequency text,
  owner_digest_day_of_week int,
  owner_digest_time_of_day time,
  owner_digest_timezone text,
  owner_digest_recipients text[],
  owner_digest_last_sent_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.country_code,
    o.currency_code,
    COALESCE(o.inventory_enabled, false),
    o.owner_digest_frequency,
    o.owner_digest_day_of_week,
    o.owner_digest_time_of_day,
    o.owner_digest_timezone,
    o.owner_digest_recipients,
    o.owner_digest_last_sent_at
  FROM public.organisations o
  WHERE o.owner_digest_enabled = true
    AND o.owner_digest_frequency IN ('daily', 'weekly')
    AND COALESCE(o.inventory_enabled, false) = true
    AND cardinality(o.owner_digest_recipients) > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.get_owner_digest_orgs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_owner_digest_orgs() TO service_role;

CREATE OR REPLACE FUNCTION public.log_owner_digest_send(
  p_organisation_id uuid,
  p_window_start timestamptz,
  p_recipient text,
  p_subject text,
  p_status text,
  p_provider_message_id text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.owner_digest_send_log (
    organisation_id,
    window_start,
    recipient,
    subject,
    status,
    provider_message_id,
    error_message
  ) VALUES (
    p_organisation_id,
    p_window_start,
    p_recipient,
    p_subject,
    p_status,
    p_provider_message_id,
    p_error_message
  )
  ON CONFLICT (organisation_id, window_start) DO UPDATE SET
    sent_at = now(),
    recipient = EXCLUDED.recipient,
    subject = EXCLUDED.subject,
    status = EXCLUDED.status,
    provider_message_id = EXCLUDED.provider_message_id,
    error_message = EXCLUDED.error_message;
END;
$$;

REVOKE ALL ON FUNCTION public.log_owner_digest_send(uuid,timestamptz,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_owner_digest_send(uuid,timestamptz,text,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_owner_digest_sent(
  p_organisation_id uuid,
  p_sent_at timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.organisations
  SET owner_digest_last_sent_at = p_sent_at
  WHERE id = p_organisation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_owner_digest_sent(uuid,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_owner_digest_sent(uuid,timestamptz) TO service_role;
