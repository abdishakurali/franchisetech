-- 033_site_access_foundation.sql
-- Stage 1 foundation for site-scoped access. No UI enablement.

-- Ensure every organisation has at least one site for single-location continuity.
insert into public.sites (organisation_id, name)
select o.id, 'Main site'
from public.organisations o
where not exists (
  select 1 from public.sites s where s.organisation_id = o.id
);

-- Site assignments for organisation members.
create table if not exists public.member_site_access (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  member_id uuid not null references public.organisation_members(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (member_id, site_id)
);

create index if not exists idx_member_site_access_org on public.member_site_access(organisation_id);
create index if not exists idx_member_site_access_member on public.member_site_access(member_id);
create index if not exists idx_member_site_access_site on public.member_site_access(site_id);
create unique index if not exists idx_sites_id_org on public.sites(id, organisation_id);

alter table public.member_site_access enable row level security;

-- Add site_id columns. They remain nullable until every write path is proven.
alter table public.pos_sessions add column if not exists site_id uuid;
alter table public.pos_transactions add column if not exists site_id uuid;
alter table public.pos_transaction_items add column if not exists site_id uuid;
alter table public.sale_payments add column if not exists site_id uuid;
alter table public.pos_cash_movements add column if not exists site_id uuid;
alter table public.kitchen_orders add column if not exists site_id uuid;

-- Composite FKs ensure the chosen site belongs to the same organisation.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pos_sessions_site_org_fkey') then
    alter table public.pos_sessions
      add constraint pos_sessions_site_org_fkey
      foreign key (site_id, organisation_id) references public.sites(id, organisation_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pos_transactions_site_org_fkey') then
    alter table public.pos_transactions
      add constraint pos_transactions_site_org_fkey
      foreign key (site_id, organisation_id) references public.sites(id, organisation_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pos_transaction_items_site_org_fkey') then
    alter table public.pos_transaction_items
      add constraint pos_transaction_items_site_org_fkey
      foreign key (site_id, organisation_id) references public.sites(id, organisation_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sale_payments_site_org_fkey') then
    alter table public.sale_payments
      add constraint sale_payments_site_org_fkey
      foreign key (site_id, organisation_id) references public.sites(id, organisation_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pos_cash_movements_site_org_fkey') then
    alter table public.pos_cash_movements
      add constraint pos_cash_movements_site_org_fkey
      foreign key (site_id, organisation_id) references public.sites(id, organisation_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'kitchen_orders_site_org_fkey') then
    alter table public.kitchen_orders
      add constraint kitchen_orders_site_org_fkey
      foreign key (site_id, organisation_id) references public.sites(id, organisation_id);
  end if;
end $$;

create index if not exists idx_pos_sessions_org_site_opened on public.pos_sessions(organisation_id, site_id, opened_at desc);
create index if not exists idx_pos_transactions_org_site_created on public.pos_transactions(organisation_id, site_id, created_at desc);
create index if not exists idx_pos_transaction_items_org_site on public.pos_transaction_items(organisation_id, site_id);
create index if not exists idx_sale_payments_org_site_created on public.sale_payments(organisation_id, site_id, created_at desc);
create index if not exists idx_pos_cash_movements_org_site_performed on public.pos_cash_movements(organisation_id, site_id, performed_at desc);
create index if not exists idx_kitchen_orders_org_site_created on public.kitchen_orders(organisation_id, site_id, created_at desc);

-- Active-membership helper functions.
create or replace function public.current_member_id(org_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id
  from public.organisation_members
  where organisation_id = org_id
    and user_id = auth.uid()
    and coalesce(status, 'active') = 'active'
  limit 1
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_member_id(org_id) is not null
$$;

create or replace function public.get_org_role(org_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role
  from public.organisation_members
  where organisation_id = org_id
    and user_id = auth.uid()
    and coalesce(status, 'active') = 'active'
  limit 1
$$;

create or replace function public.is_org_owner(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_org_role(org_id) = 'owner'
$$;

create or replace function public.is_org_owner_or_manager(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_org_role(org_id) in ('owner', 'manager')
$$;

create or replace function public.default_site_id(org_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select case when count(*) = 1 then (array_agg(id order by created_at, id::text))[1] else null end
  from public.sites
  where organisation_id = org_id
$$;

create or replace function public.can_access_site(p_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.sites s
    join public.organisation_members om
      on om.organisation_id = s.organisation_id
     and om.user_id = auth.uid()
     and coalesce(om.status, 'active') = 'active'
    where s.id = p_site_id
      and (
        om.role = 'owner'
        or exists (
          select 1
          from public.member_site_access msa
          where msa.member_id = om.id
            and msa.site_id = s.id
        )
      )
  )
$$;

create or replace function public.can_manage_billing(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_org_role(org_id) = 'owner'
$$;

create or replace function public.can_manage_team(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_org_role(org_id) = 'owner'
$$;

create or replace function public.can_use_pos(p_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.can_access_site(p_site_id)
    and public.get_org_role((select organisation_id from public.sites where id = p_site_id)) in ('owner', 'manager', 'staff', 'cashier')
$$;

create or replace function public.can_view_reports(p_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.can_access_site(p_site_id)
    and public.get_org_role((select organisation_id from public.sites where id = p_site_id)) in ('owner', 'manager', 'auditor')
$$;

create or replace function public.can_update_kitchen(p_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.can_access_site(p_site_id)
    and public.get_org_role((select organisation_id from public.sites where id = p_site_id)) in ('owner', 'manager', 'kitchen')
$$;

revoke all on function public.current_member_id(uuid) from public, anon;
revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.get_org_role(uuid) from public, anon;
revoke all on function public.is_org_owner(uuid) from public, anon;
revoke all on function public.is_org_owner_or_manager(uuid) from public, anon;
revoke all on function public.default_site_id(uuid) from public, anon;
revoke all on function public.can_access_site(uuid) from public, anon;
revoke all on function public.can_manage_billing(uuid) from public, anon;
revoke all on function public.can_manage_team(uuid) from public, anon;
revoke all on function public.can_use_pos(uuid) from public, anon;
revoke all on function public.can_view_reports(uuid) from public, anon;
revoke all on function public.can_update_kitchen(uuid) from public, anon;

grant execute on function public.current_member_id(uuid) to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.get_org_role(uuid) to authenticated;
grant execute on function public.is_org_owner(uuid) to authenticated;
grant execute on function public.is_org_owner_or_manager(uuid) to authenticated;
grant execute on function public.default_site_id(uuid) to authenticated;
grant execute on function public.can_access_site(uuid) to authenticated;
grant execute on function public.can_manage_billing(uuid) to authenticated;
grant execute on function public.can_manage_team(uuid) to authenticated;
grant execute on function public.can_use_pos(uuid) to authenticated;
grant execute on function public.can_view_reports(uuid) to authenticated;
grant execute on function public.can_update_kitchen(uuid) to authenticated;

-- Backfill site assignments.
insert into public.member_site_access (organisation_id, member_id, site_id)
select om.organisation_id, om.id, s.id
from public.organisation_members om
join public.sites s on s.organisation_id = om.organisation_id
where coalesce(om.status, 'active') = 'active'
  and om.role = 'owner'
on conflict (member_id, site_id) do nothing;

insert into public.member_site_access (organisation_id, member_id, site_id)
select om.organisation_id, om.id, s.id
from public.organisation_members om
join (
  select organisation_id, (array_agg(id order by created_at, id::text))[1] as id
  from public.sites
  group by organisation_id
  having count(*) = 1
) s on s.organisation_id = om.organisation_id
where coalesce(om.status, 'active') = 'active'
  and om.role <> 'owner'
on conflict (member_id, site_id) do nothing;

-- Backfill operational rows only where the organisation has exactly one site.
with one_site as (
  select organisation_id, (array_agg(id order by created_at, id::text))[1] as site_id
  from public.sites
  group by organisation_id
  having count(*) = 1
)
update public.pos_sessions ps
set site_id = os.site_id
from one_site os
where ps.site_id is null and ps.organisation_id = os.organisation_id;

update public.pos_transactions pt
set site_id = coalesce(ps.site_id, os.site_id)
from (
  select organisation_id, (array_agg(id order by created_at, id::text))[1] as site_id
  from public.sites
  group by organisation_id
  having count(*) = 1
) os
left join public.pos_sessions ps on ps.organisation_id = os.organisation_id
where pt.site_id is null
  and pt.organisation_id = os.organisation_id
  and (pt.session_id is null or pt.session_id = ps.id);

update public.pos_transaction_items pti
set site_id = pt.site_id
from public.pos_transactions pt
where pti.site_id is null
  and pti.transaction_id = pt.id
  and pti.organisation_id = pt.organisation_id
  and pt.site_id is not null;

update public.sale_payments sp
set site_id = pt.site_id
from public.pos_transactions pt
where sp.site_id is null
  and sp.sale_id = pt.id
  and sp.organisation_id = pt.organisation_id
  and pt.site_id is not null;

update public.pos_cash_movements pcm
set site_id = ps.site_id
from public.pos_sessions ps
where pcm.site_id is null
  and pcm.session_id = ps.id
  and pcm.organisation_id = ps.organisation_id
  and ps.site_id is not null;

update public.kitchen_orders ko
set site_id = coalesce(pt.site_id, os.site_id)
from (
  select organisation_id, (array_agg(id order by created_at, id::text))[1] as site_id
  from public.sites
  group by organisation_id
  having count(*) = 1
) os
left join public.pos_transactions pt on pt.organisation_id = os.organisation_id
where ko.site_id is null
  and ko.organisation_id = os.organisation_id
  and (ko.sale_id is null or ko.sale_id = pt.id);

-- Populate site_id on future single-site inserts and reject ambiguous writes.
create or replace function public.ensure_record_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id uuid;
begin
  if TG_TABLE_NAME = 'pos_transactions' and new.site_id is null and new.session_id is not null then
    select site_id into v_site_id from public.pos_sessions where id = new.session_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  elsif TG_TABLE_NAME = 'pos_transaction_items' and new.site_id is null and new.transaction_id is not null then
    select site_id into v_site_id from public.pos_transactions where id = new.transaction_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  elsif TG_TABLE_NAME = 'sale_payments' and new.site_id is null and new.sale_id is not null then
    select site_id into v_site_id from public.pos_transactions where id = new.sale_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  elsif TG_TABLE_NAME = 'pos_cash_movements' and new.site_id is null and new.session_id is not null then
    select site_id into v_site_id from public.pos_sessions where id = new.session_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  elsif TG_TABLE_NAME = 'kitchen_orders' and new.site_id is null and new.sale_id is not null then
    select site_id into v_site_id from public.pos_transactions where id = new.sale_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  end if;

  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pos_sessions_site on public.pos_sessions;
create trigger trg_pos_sessions_site
before insert or update of site_id, organisation_id on public.pos_sessions
for each row execute function public.ensure_record_site();

drop trigger if exists trg_pos_transactions_site on public.pos_transactions;
create trigger trg_pos_transactions_site
before insert or update of site_id, organisation_id, session_id on public.pos_transactions
for each row execute function public.ensure_record_site();

drop trigger if exists trg_pos_transaction_items_site on public.pos_transaction_items;
create trigger trg_pos_transaction_items_site
before insert or update of site_id, organisation_id, transaction_id on public.pos_transaction_items
for each row execute function public.ensure_record_site();

drop trigger if exists trg_sale_payments_site on public.sale_payments;
create trigger trg_sale_payments_site
before insert or update of site_id, organisation_id, sale_id on public.sale_payments
for each row execute function public.ensure_record_site();

drop trigger if exists trg_pos_cash_movements_site on public.pos_cash_movements;
create trigger trg_pos_cash_movements_site
before insert or update of site_id, organisation_id, session_id on public.pos_cash_movements
for each row execute function public.ensure_record_site();

drop trigger if exists trg_kitchen_orders_site on public.kitchen_orders;
create trigger trg_kitchen_orders_site
before insert or update of site_id, organisation_id, sale_id on public.kitchen_orders
for each row execute function public.ensure_record_site();

-- RLS tightening. Active membership and site assignment are now enforced.
drop policy if exists member_site_access_select on public.member_site_access;
create policy member_site_access_select on public.member_site_access
  for select using (public.is_org_owner(organisation_id) or member_id = public.current_member_id(organisation_id));

drop policy if exists member_site_access_owner_manage on public.member_site_access;
create policy member_site_access_owner_manage on public.member_site_access
  for all using (public.is_org_owner(organisation_id))
  with check (public.is_org_owner(organisation_id));

drop policy if exists "sites_select_member" on public.sites;
drop policy if exists sites_select_member on public.sites;
create policy sites_select_accessible on public.sites
  for select using (public.can_access_site(id));

drop policy if exists "sites_insert_owner_manager" on public.sites;
drop policy if exists sites_insert_owner_manager on public.sites;
create policy sites_insert_owner on public.sites
  for insert with check (public.is_org_owner(organisation_id));

drop policy if exists "sites_update_owner_manager" on public.sites;
drop policy if exists sites_update_owner_manager on public.sites;
create policy sites_update_owner on public.sites
  for update using (public.is_org_owner(organisation_id))
  with check (public.is_org_owner(organisation_id));

drop policy if exists pos_sessions_select on public.pos_sessions;
create policy pos_sessions_select_site on public.pos_sessions
  for select using (public.can_access_site(site_id));

drop policy if exists pos_sessions_insert on public.pos_sessions;
create policy pos_sessions_insert_site on public.pos_sessions
  for insert with check (public.can_use_pos(site_id));

drop policy if exists pos_sessions_update on public.pos_sessions;
create policy pos_sessions_update_site on public.pos_sessions
  for update using (public.can_use_pos(site_id))
  with check (public.can_use_pos(site_id));

drop policy if exists pos_transactions_select_org_members on public.pos_transactions;
create policy pos_transactions_select_site on public.pos_transactions
  for select using (public.can_access_site(site_id));

drop policy if exists pos_transactions_insert_staff on public.pos_transactions;
create policy pos_transactions_insert_site on public.pos_transactions
  for insert with check (public.can_use_pos(site_id));

drop policy if exists pos_transactions_update_owner_manager on public.pos_transactions;
create policy pos_transactions_update_owner_manager_site on public.pos_transactions
  for update using (public.can_access_site(site_id) and public.get_org_role(organisation_id) in ('owner', 'manager'))
  with check (public.can_access_site(site_id) and public.get_org_role(organisation_id) in ('owner', 'manager'));

drop policy if exists pos_transaction_items_select_org_members on public.pos_transaction_items;
create policy pos_transaction_items_select_site on public.pos_transaction_items
  for select using (public.can_access_site(site_id));

drop policy if exists pos_transaction_items_insert_staff on public.pos_transaction_items;
create policy pos_transaction_items_insert_site on public.pos_transaction_items
  for insert with check (public.can_use_pos(site_id));

drop policy if exists sale_payments_select_org_members on public.sale_payments;
create policy sale_payments_select_site on public.sale_payments
  for select using (public.can_access_site(site_id));

drop policy if exists sale_payments_insert_pos_staff on public.sale_payments;
create policy sale_payments_insert_site on public.sale_payments
  for insert with check (public.can_use_pos(site_id));

drop policy if exists pos_cash_movements_select on public.pos_cash_movements;
create policy pos_cash_movements_select_site on public.pos_cash_movements
  for select using (public.can_access_site(site_id));

drop policy if exists pos_cash_movements_insert on public.pos_cash_movements;
create policy pos_cash_movements_insert_site on public.pos_cash_movements
  for insert with check (public.can_use_pos(site_id));

drop policy if exists kitchen_orders_select_members on public.kitchen_orders;
create policy kitchen_orders_select_site on public.kitchen_orders
  for select using (public.can_access_site(site_id));

drop policy if exists kitchen_orders_insert_pos_staff on public.kitchen_orders;
create policy kitchen_orders_insert_site on public.kitchen_orders
  for insert with check (public.can_use_pos(site_id));

drop policy if exists kitchen_orders_update_kitchen on public.kitchen_orders;
create policy kitchen_orders_update_site on public.kitchen_orders
  for update using (public.can_update_kitchen(site_id))
  with check (public.can_update_kitchen(site_id));

drop policy if exists kitchen_order_items_select_members on public.kitchen_order_items;
create policy kitchen_order_items_select_site on public.kitchen_order_items
  for select using (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and public.can_access_site(ko.site_id)
    )
  );

drop policy if exists kitchen_order_items_insert_pos_staff on public.kitchen_order_items;
create policy kitchen_order_items_insert_site on public.kitchen_order_items
  for insert with check (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and public.can_use_pos(ko.site_id)
    )
  );

drop policy if exists kitchen_order_items_update_kitchen on public.kitchen_order_items;
create policy kitchen_order_items_update_site on public.kitchen_order_items
  for update using (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and public.can_update_kitchen(ko.site_id)
    )
  )
  with check (
    exists (
      select 1 from public.kitchen_orders ko
      where ko.id = kitchen_order_items.kitchen_order_id
        and public.can_update_kitchen(ko.site_id)
    )
  );

drop policy if exists "billing_select_org_members" on public.billing_subscriptions;
create policy billing_select_owner on public.billing_subscriptions
  for select using (public.can_manage_billing(organisation_id));
