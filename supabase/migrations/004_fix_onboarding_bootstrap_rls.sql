-- Bootstrap first organisation/site/asset without weakening tenant RLS.

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.organisation_members enable row level security;
alter table public.sites enable row level security;
alter table public.assets enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "orgs_insert_authenticated" on public.organisations;

create or replace function public.create_organisation_with_owner(
  p_org_name text,
  p_business_type text default null,
  p_site_name text default null,
  p_site_address text default null,
  p_site_city text default null,
  p_site_eircode text default null,
  p_asset_name text default null,
  p_asset_type text default 'fridge',
  p_asset_location text default null
)
returns table (
  organisation_id uuid,
  site_id uuid,
  asset_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_site_id uuid;
  v_asset_id uuid;
  v_qr_code text;
  v_min_temp numeric;
  v_max_temp numeric;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_org_name is null or length(trim(p_org_name)) < 2 then
    raise exception 'Organisation name is required';
  end if;

  if p_asset_type is not null and p_asset_type not in ('fridge', 'freezer', 'cold_room', 'chill_display', 'hot_hold', 'probe', 'other') then
    raise exception 'Invalid asset type';
  end if;

  insert into public.profiles (id, email, full_name)
  values (
    v_user_id,
    auth.jwt() ->> 'email',
    auth.jwt() -> 'user_metadata' ->> 'full_name'
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, profiles.email),
    full_name = coalesce(excluded.full_name, profiles.full_name);

  insert into public.organisations (name, business_type, country)
  values (trim(p_org_name), nullif(trim(coalesce(p_business_type, '')), ''), 'Ireland')
  returning id into v_org_id;

  insert into public.organisation_members (organisation_id, user_id, role)
  values (v_org_id, v_user_id, 'owner');

  if p_site_name is not null and length(trim(p_site_name)) > 0 then
    insert into public.sites (organisation_id, name, address, city, eircode)
    values (
      v_org_id,
      trim(p_site_name),
      nullif(trim(coalesce(p_site_address, '')), ''),
      nullif(trim(coalesce(p_site_city, '')), ''),
      nullif(trim(coalesce(p_site_eircode, '')), '')
    )
    returning id into v_site_id;
  end if;

  if v_site_id is not null and p_asset_name is not null and length(trim(p_asset_name)) > 0 then
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

    v_qr_code := 'FP-ASSET-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8));

    insert into public.assets (
      organisation_id, site_id, name, asset_type, location, qr_code, min_temp, max_temp, active
    )
    values (
      v_org_id,
      v_site_id,
      trim(p_asset_name),
      coalesce(p_asset_type, 'fridge'),
      nullif(trim(coalesce(p_asset_location, '')), ''),
      v_qr_code,
      v_min_temp,
      v_max_temp,
      true
    )
    returning id into v_asset_id;
  end if;

  insert into public.audit_log (organisation_id, actor_id, action, entity_type, entity_id, metadata)
  values (
    v_org_id,
    v_user_id,
    'organisation.created',
    'organisation',
    v_org_id,
    jsonb_build_object('source', 'onboarding_rpc')
  );

  return query select v_org_id, v_site_id, v_asset_id;
end;
$$;

revoke all on function public.create_organisation_with_owner(
  text, text, text, text, text, text, text, text, text
) from public;

revoke all on function public.create_organisation_with_owner(
  text, text, text, text, text, text, text, text, text
) from anon;

grant execute on function public.create_organisation_with_owner(
  text, text, text, text, text, text, text, text, text
) to authenticated;
