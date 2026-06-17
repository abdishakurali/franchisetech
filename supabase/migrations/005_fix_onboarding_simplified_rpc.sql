-- FridgeProof: Simplified onboarding RPC — fixes uuid_generate_v4() + site_id NOT NULL
-- Drops all previous overloads and replaces with a clean 4-parameter version.
--
-- Root causes fixed:
--   1. uuid_generate_v4() does not exist → replaced with gen_random_uuid() (PG13+ built-in)
--   2. assets.site_id is NOT NULL → "Main Kitchen" site always auto-created
--   3. asset_type normalised (spaces → underscores) to match DB CHECK constraint
--
-- Applied to production via Supabase MCP on 2026-06-03.

drop function if exists public.create_organisation_with_owner(text, text, text, text, text, text);
drop function if exists public.create_organisation_with_owner(text, text, text, text);

create or replace function public.create_organisation_with_owner(
  p_org_name      text,
  p_business_type text default null,
  p_asset_name    text default null,
  p_asset_type    text default 'fridge'
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
  v_asset_type text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_org_name is null or length(trim(p_org_name)) < 1 then
    raise exception 'Business name is required';
  end if;

  v_asset_type := lower(trim(coalesce(p_asset_type, 'fridge')));
  v_asset_type := replace(v_asset_type, ' ', '_');
  case v_asset_type
    when 'cold_room'     then v_asset_type := 'cold_room';
    when 'chill_display' then v_asset_type := 'chill_display';
    when 'hot_hold'      then v_asset_type := 'hot_hold';
    when 'freezer'       then v_asset_type := 'freezer';
    when 'fridge'        then v_asset_type := 'fridge';
    else                      v_asset_type := 'fridge';
  end case;

  v_user_email := auth.jwt() ->> 'email';
  v_full_name  := coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() ->> 'email');

  insert into public.profiles (id, email, full_name)
  values (v_user_id, v_user_email, v_full_name)
  on conflict (id) do update
    set email     = coalesce(public.profiles.email,     excluded.email),
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into public.organisations (name, business_type, country)
  values (trim(p_org_name), nullif(trim(coalesce(p_business_type, '')), ''), 'Ireland')
  returning id into v_org_id;

  insert into public.organisation_members (organisation_id, user_id, role)
  values (v_org_id, v_user_id, 'owner');

  insert into public.sites (organisation_id, name)
  values (v_org_id, 'Main Kitchen')
  returning id into v_site_id;

  if p_asset_name is not null and length(trim(p_asset_name)) > 0 then
    case v_asset_type
      when 'fridge', 'cold_room', 'chill_display' then v_min_temp := 0;  v_max_temp := 5;
      when 'freezer'                              then v_min_temp := null; v_max_temp := -18;
      when 'hot_hold'                             then v_min_temp := 63;  v_max_temp := null;
      else                                             v_min_temp := null; v_max_temp := null;
    end case;

    v_qr_code := 'FP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

    insert into public.assets (
      organisation_id, site_id, name, asset_type, qr_code, min_temp, max_temp, active
    )
    values (v_org_id, v_site_id, trim(p_asset_name), v_asset_type, v_qr_code, v_min_temp, v_max_temp, true)
    returning id into v_asset_id;
  end if;

  begin
    insert into public.audit_log (organisation_id, actor_id, action, entity_type, entity_id, metadata)
    values (v_org_id, v_user_id, 'organisation.created', 'organisation', v_org_id,
      jsonb_build_object('source', 'onboarding_rpc', 'business_type', p_business_type,
                         'asset_name', p_asset_name, 'asset_type', v_asset_type));
  exception when others then null;
  end;

  return query select v_org_id, v_site_id, v_asset_id;
end;
$$;

revoke all on function public.create_organisation_with_owner(text, text, text, text) from public;
revoke all on function public.create_organisation_with_owner(text, text, text, text) from anon;
grant execute on function public.create_organisation_with_owner(text, text, text, text) to authenticated;
