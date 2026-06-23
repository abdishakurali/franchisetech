-- 050: Remove inventory gate from owner digest — digest should work for all orgs
-- Previously get_owner_digest_orgs() silently excluded any org without inventory_enabled=true,
-- meaning starter-tier orgs (majority) never received the digest even when they configured it.

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
    AND cardinality(o.owner_digest_recipients) > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.get_owner_digest_orgs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_owner_digest_orgs() TO service_role;
