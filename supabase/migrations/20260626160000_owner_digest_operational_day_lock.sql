-- Owner digest operational day support + atomic send-window claim.

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS business_day_cutoff_time time NOT NULL DEFAULT '04:00';

ALTER TABLE public.owner_digest_send_log
  DROP CONSTRAINT IF EXISTS owner_digest_send_log_status_check;

ALTER TABLE public.owner_digest_send_log
  ADD CONSTRAINT owner_digest_send_log_status_check
  CHECK (status IN ('processing', 'sent', 'failed', 'skipped'));

DROP FUNCTION IF EXISTS public.get_owner_digest_orgs();

CREATE FUNCTION public.get_owner_digest_orgs()
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
  owner_digest_last_sent_at timestamptz,
  business_day_cutoff_time time
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
    o.owner_digest_last_sent_at,
    o.business_day_cutoff_time
  FROM public.organisations o
  WHERE o.owner_digest_enabled = true
    AND o.owner_digest_frequency IN ('daily', 'weekly')
    AND cardinality(o.owner_digest_recipients) > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.get_owner_digest_orgs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_digest_orgs() TO service_role;

CREATE OR REPLACE FUNCTION public.claim_owner_digest_window(
  p_organisation_id uuid,
  p_window_start timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing text;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_organisation_id::text || ':' || p_window_start::text, 0)
  );

  SELECT status INTO v_existing
  FROM public.owner_digest_send_log
  WHERE organisation_id = p_organisation_id
    AND window_start = p_window_start
    AND status IN ('processing', 'sent')
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN false;
  END IF;

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
    '__lock__',
    'Owner digest processing',
    'processing',
    NULL,
    NULL
  )
  ON CONFLICT (organisation_id, window_start, lower(coalesce(recipient, ''))) DO UPDATE SET
    sent_at = now(),
    subject = EXCLUDED.subject,
    status = EXCLUDED.status,
    provider_message_id = NULL,
    error_message = NULL;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_owner_digest_window(uuid,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_owner_digest_window(uuid,timestamptz) TO service_role;
