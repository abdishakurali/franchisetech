-- FridgeProof: Onboarding bootstrap RPC
-- Fixes: "new row violates row-level security policy for table organisations"
--
-- Root cause: direct client inserts into organisations / organisation_members
-- hit RLS before the membership row exists, so auth.uid() checks fail.
--
-- Fix: SECURITY DEFINER function that runs as the function owner (bypasses RLS)
-- while still reading auth.uid() from the caller's JWT.
-- Caller must be authenticated — unauthenticated calls raise an exception.

-- Ensure uuid generation is available
create extension if not exists "uuid-ossp";

create or replace function public.create_organisation_with_owner(
  p_org_name     text,
  p_business_type text default null,
  p_site_name    text default null,
  p_site_city    text default null,
  p_asset_name   text default null,
  p_asset_type   text default 'fridge'
)
returns table (
  organisation_id uuid,
  site_id         uuid,
  asset_id        uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_user_email text;
  v_full_name  text;
  v_org_id     uuid;
  v_site_id    uuid;
  v_asset_id   uuid;
  v_qr_code    text;
  v_min_temp   numeric;
  v_max_temp   numeric;
begin
  -- Must be authenticated
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Business name is required
  if p_org_name is null or length(trim(p_org_name)) < 1 then
    raise exception 'Business name is required';
  end if;

  -- Extract JWT claims
  v_user_email := auth.jwt() ->> 'email';
  v_full_name  := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    auth.jwt() ->> 'email'
  );

  -- Upsert profile so it always exists
  insert into public.profiles (id, email, full_name)
  values (v_user_id, v_user_email, v_full_name)
  on conflict (id) do update
    set email     = coalesce(public.profiles.email,     excluded.email),
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  -- Create the organisation
  insert into public.organisations (name, business_type, country)
  values (
    trim(p_org_name),
    nullif(trim(coalesce(p_business_type, '')), ''),
    'Ireland'
  )
  returning id into v_org_id;

  -- Create the owner membership row
  -- This is safe here because the function owns the org just created above
  insert into public.organisation_members (organisation_id, user_id, role)
  values (v_org_id, v_user_id, 'owner');

  -- Optionally create the first kitchen/site
  if p_site_name is not null and length(trim(p_site_name)) > 0 then
    insert into public.sites (organisation_id, name, city)
    values (
      v_org_id,
      trim(p_site_name),
      nullif(trim(coalesce(p_site_city, '')), '')
    )
    returning id into v_site_id;
  end if;

  -- Optionally create the first cold storage unit
  if v_site_id is not null and p_asset_name is not null and length(trim(p_asset_name)) > 0 then

    -- Set default temperature thresholds by asset type
    case p_asset_type
      when 'fridge', 'cold_room', 'chill_display' then
        v_min_temp := 0;
        v_max_temp := 5;
      when 'freezer' then
        v_min_temp := null;
        v_max_temp := -18;
      when 'hot_hold' then
        v_min_temp := 63;
        v_max_temp := null;
      else
        v_min_temp := null;
        v_max_temp := null;
    end case;

    -- Generate a unique QR code
    v_qr_code := 'FP-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 10));

    insert into public.assets (
      organisation_id,
      site_id,
      name,
      asset_type,
      qr_code,
      min_temp,
      max_temp,
      active
    )
    values (
      v_org_id,
      v_site_id,
      trim(p_asset_name),
      p_asset_type,
      v_qr_code,
      v_min_temp,
      v_max_temp,
      true
    )
    returning id into v_asset_id;
  end if;

  -- Audit log (best-effort — do not fail the whole function if this errors)
  begin
    insert into public.audit_log (
      organisation_id,
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata
    )
    values (
      v_org_id,
      v_user_id,
      'organisation.created',
      'organisation',
      v_org_id,
      jsonb_build_object(
        'source',        'onboarding_rpc',
        'business_type', p_business_type,
        'site_name',     p_site_name,
        'asset_name',    p_asset_name
      )
    );
  exception when others then
    -- Audit log failure must not block onboarding
    null;
  end;

  return query select v_org_id, v_site_id, v_asset_id;
end;
$$;

-- Lock down permissions: only authenticated users may call this function
revoke all on function public.create_organisation_with_owner(
  text, text, text, text, text, text
) from public;

grant execute on function public.create_organisation_with_owner(
  text, text, text, text, text, text
) to authenticated;
