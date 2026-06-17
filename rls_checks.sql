select 'rpc_grants' as check, array_agg(r.rolname order by r.rolname)::text as result
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
left join aclexplode(p.proacl) a on true
left join pg_roles r on r.oid = a.grantee
where n.nspname = 'public' and p.proname = 'create_organisation_with_owner';

do $$
begin
  set local role anon;
  begin
    insert into public.organisations(name) values ('Should Fail');
    raise notice 'anon_insert_result=unexpected_success';
  exception when others then
    raise notice 'anon_insert_result=failed:%', sqlstate;
  end;
  reset role;
end $$;

select set_config(
  'request.jwt.claim.sub',
  (select id::text from auth.users where email = 'codex-smoke-2@example.com' order by created_at desc limit 1),
  false
);
set role authenticated;
select 'second_user_org_read_count' as check, count(*)::text as result
from public.organisations
where name = 'Codex Test Bistro';
reset role;
