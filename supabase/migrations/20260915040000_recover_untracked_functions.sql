-- These 5 objects are live in production but have NO entry anywhere in
-- supabase_migrations.schema_migrations — unlike every other recovery in
-- this audit, there was no original migration text to pull back. They were
-- applied directly (dashboard SQL editor, or before this project adopted
-- migration tracking) and never went through the migration tool at all.
-- Recovered here from pg_get_functiondef/pg_get_triggerdef on production
-- during the full migration provenance audit (2026-09-15).
--
-- Status of each, checked against the app (rpc() call sites) and pg_trigger:
--
-- create_organisation_for_user, create_asset_for_org, create_site_for_org,
-- record_referral_signup: no call site anywhere in app/lib/components.
-- These look like early onboarding/referral helpers superseded by
-- create_organisation_with_owner (idempotent_onboarding_rpc, already in
-- this repo) and by credit_referral/ensure_referral_code. Recovered as
-- dead code, not a live behavior gap — flagging rather than deleting, since
-- deleting is out of scope for a provenance audit.
--
-- sync_stripe_customer_id: IS live — an active AFTER INSERT OR UPDATE
-- trigger (trg_sync_stripe_customer) on billing_subscriptions, copying a
-- new stripe_customer_id onto organisations.stripe_customer_id. This one
-- is a genuine, currently-running behavior that had no record in git at
-- all until this commit.

CREATE OR REPLACE FUNCTION public.create_organisation_for_user(org_name text, business_type_val text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org organisations%ROWTYPE;
  result json;
BEGIN
  -- Insert organisation
  INSERT INTO organisations (name, business_type, country)
  VALUES (org_name, business_type_val, 'Ireland')
  RETURNING * INTO new_org;

  -- Add current user as owner (uses auth.uid() from JWT context)
  INSERT INTO organisation_members (organisation_id, user_id, role)
  VALUES (new_org.id, auth.uid(), 'owner');

  SELECT row_to_json(new_org) INTO result;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_asset_for_org(p_org_id uuid, p_site_id uuid, p_name text, p_asset_type text, p_location text DEFAULT NULL::text, p_qr_code text DEFAULT NULL::text, p_min_temp numeric DEFAULT NULL::numeric, p_max_temp numeric DEFAULT NULL::numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_asset assets%ROWTYPE;
  result json;
BEGIN
  INSERT INTO assets (organisation_id, site_id, name, asset_type, location, qr_code, min_temp, max_temp, active)
  VALUES (p_org_id, p_site_id, p_name, p_asset_type, p_location, p_qr_code, p_min_temp, p_max_temp, true)
  RETURNING * INTO new_asset;

  SELECT row_to_json(new_asset) INTO result;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_site_for_org(p_org_id uuid, p_name text, p_city text DEFAULT NULL::text, p_eircode text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_site sites%ROWTYPE;
  result json;
BEGIN
  INSERT INTO sites (organisation_id, name, city, eircode)
  VALUES (p_org_id, p_name, p_city, p_eircode)
  RETURNING * INTO new_site;

  SELECT row_to_json(new_site) INTO result;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_referral_signup(p_new_org_id uuid, p_referred_email text, p_referral_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_id UUID;
BEGIN
  SELECT id INTO v_referrer_id
  FROM organisations
  WHERE referral_code = p_referral_code
    AND id != p_new_org_id;

  IF v_referrer_id IS NULL THEN RETURN; END IF;

  -- Record on the new org that they came via referral
  UPDATE organisations
  SET referred_by_code = p_referral_code
  WHERE id = p_new_org_id AND referred_by_code IS NULL;

  -- Record as signed_up (not yet credited)
  INSERT INTO referrals (
    organisation_id, referrer_organisation_id, referral_code,
    referred_email, referred_organisation_id,
    status, credit_months, signed_up_at
  ) VALUES (
    p_new_org_id, v_referrer_id, p_referral_code,
    p_referred_email, p_new_org_id,
    'signed_up', 1, NOW()
  )
  ON CONFLICT DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_stripe_customer_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.stripe_customer_id IS NOT NULL THEN
    UPDATE organisations SET stripe_customer_id = NEW.stripe_customer_id
    WHERE id = NEW.organisation_id AND stripe_customer_id IS NULL;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_stripe_customer ON public.billing_subscriptions;
CREATE TRIGGER trg_sync_stripe_customer
  AFTER INSERT OR UPDATE ON public.billing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_stripe_customer_id();
