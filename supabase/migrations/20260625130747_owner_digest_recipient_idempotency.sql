-- Owner digest idempotency must be per recipient.
-- The original index was per organisation/window only, so multiple recipients
-- overwrote each other in owner_digest_send_log.

DROP INDEX IF EXISTS public.idx_owner_digest_send_log_idempotent;

CREATE UNIQUE INDEX IF NOT EXISTS idx_owner_digest_send_log_idempotent_recipient
  ON public.owner_digest_send_log (
    organisation_id,
    window_start,
    lower(coalesce(recipient, ''))
  );

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
    lower(coalesce(p_recipient, '')),
    p_subject,
    p_status,
    p_provider_message_id,
    p_error_message
  )
  ON CONFLICT (organisation_id, window_start, lower(coalesce(recipient, ''))) DO UPDATE SET
    sent_at = now(),
    subject = EXCLUDED.subject,
    status = EXCLUDED.status,
    provider_message_id = EXCLUDED.provider_message_id,
    error_message = EXCLUDED.error_message;
END;
$$;

REVOKE ALL ON FUNCTION public.log_owner_digest_send(uuid,timestamptz,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_owner_digest_send(uuid,timestamptz,text,text,text,text,text) TO service_role;
