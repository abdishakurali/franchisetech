alter table profiles
  add column if not exists role_title text,
  add column if not exists phone text;

drop policy if exists "orgs_update_owner" on organisations;
drop policy if exists "orgs_update_owner_manager" on organisations;
create policy "orgs_update_owner_manager" on organisations
  for update using (is_org_owner_or_manager(id));
