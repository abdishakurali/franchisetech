do $$
declare
  u1 uuid := gen_random_uuid();
  u2 uuid := gen_random_uuid();
  org_id uuid;
  site_id uuid;
  asset_id uuid;
  r_pass uuid;
  r_fail uuid;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  )
  values
    (
      u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'codex-smoke-1@example.com', now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Codex Smoke 1"}'
    ),
    (
      u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'codex-smoke-2@example.com', now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Codex Smoke 2"}'
    );

  perform set_config('request.jwt.claim.sub', u1::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  set local role authenticated;

  select organisation_id, create_organisation_with_owner.site_id, create_organisation_with_owner.asset_id
  into org_id, site_id, asset_id
  from public.create_organisation_with_owner(
    'Codex Test Bistro', 'Restaurant', 'Main Kitchen', null, 'Dublin', 'D02 X285',
    'Walk-in Cold Room', 'cold_room', null
  );

  insert into public.temperature_readings (
    organisation_id, site_id, asset_id, value_c, source, taken_by, status, notes
  )
  values (org_id, site_id, asset_id, 4.1, 'manual', u1, 'pass', 'Smoke pass')
  returning id into r_pass;

  insert into public.temperature_readings (
    organisation_id, site_id, asset_id, value_c, source, taken_by, status, notes
  )
  values (org_id, site_id, asset_id, 8.2, 'manual', u1, 'fail', 'Smoke fail')
  returning id into r_fail;

  insert into public.corrective_actions (
    organisation_id, site_id, asset_id, reading_id, action_type, description, completed_by
  )
  values (
    org_id, site_id, asset_id, r_fail, 'moved_stock',
    'Moved stock to backup fridge and scheduled recheck.', u1
  );

  reset role;
end $$;

select o.id, o.name, om.role, s.name site, a.name asset, a.asset_type, a.min_temp, a.max_temp
from organisations o
join organisation_members om on om.organisation_id = o.id
join sites s on s.organisation_id = o.id
join assets a on a.site_id = s.id
where o.name = 'Codex Test Bistro'
order by o.created_at desc
limit 1;

select tr.value_c, tr.status, ca.action_type
from temperature_readings tr
left join corrective_actions ca on ca.reading_id = tr.id
join organisations o on o.id = tr.organisation_id
where o.name = 'Codex Test Bistro'
order by tr.created_at desc
limit 5;
