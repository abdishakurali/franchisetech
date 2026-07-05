-- Owner digest: add 10-minute TTL to processing claims so a window blocked by an
-- application crash between claim and send can be retried on the next cron tick.
-- Previously status IN ('processing', 'sent') with no expiry meant any crash
-- permanently skipped that window.

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
    AND (
      status = 'sent'
      OR (status = 'processing' AND sent_at > now() - interval '10 minutes')
    )
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
