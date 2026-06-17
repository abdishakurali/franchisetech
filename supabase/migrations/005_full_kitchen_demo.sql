create table if not exists public.delivery_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  supplier_name text not null,
  product_name text not null,
  batch_lot text,
  use_by_date date,
  storage_type text check (storage_type in ('chilled', 'frozen', 'dry', 'hot', 'ambient')),
  allergens text,
  quantity text,
  status text not null default 'needs_review' check (status in ('accepted', 'rejected', 'needs_review')),
  photo_url text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.cleaning_checks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  checklist_name text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'incomplete' check (status in ('completed', 'incomplete', 'needs_action')),
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz default now(),
  notes text
);

create table if not exists public.food_process_checks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  check_type text not null check (check_type in ('cooking', 'cooling', 'hot_hold', 'reheating')),
  food_item text not null,
  temperature_c numeric,
  start_temperature_c numeric,
  end_temperature_c numeric,
  status text not null check (status in ('pass', 'warning', 'fail')),
  action_taken text,
  checked_by uuid references public.profiles(id) on delete set null,
  checked_at timestamptz default now(),
  notes text
);

create table if not exists public.haccp_flows (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null default 'Default kitchen HACCP flow',
  flow jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique (organisation_id, name)
);

alter table public.delivery_records enable row level security;
alter table public.cleaning_checks enable row level security;
alter table public.food_process_checks enable row level security;
alter table public.haccp_flows enable row level security;

drop policy if exists "delivery_select_member" on public.delivery_records;
create policy "delivery_select_member" on public.delivery_records for select to authenticated using (is_org_member(organisation_id));
drop policy if exists "delivery_insert_member" on public.delivery_records;
create policy "delivery_insert_member" on public.delivery_records for insert to authenticated with check (is_org_member(organisation_id));
drop policy if exists "delivery_update_owner_manager" on public.delivery_records;
create policy "delivery_update_owner_manager" on public.delivery_records for update to authenticated using (is_org_owner_or_manager(organisation_id));
drop policy if exists "delivery_delete_owner_manager" on public.delivery_records;
create policy "delivery_delete_owner_manager" on public.delivery_records for delete to authenticated using (is_org_owner_or_manager(organisation_id));

drop policy if exists "cleaning_select_member" on public.cleaning_checks;
create policy "cleaning_select_member" on public.cleaning_checks for select to authenticated using (is_org_member(organisation_id));
drop policy if exists "cleaning_insert_member" on public.cleaning_checks;
create policy "cleaning_insert_member" on public.cleaning_checks for insert to authenticated with check (is_org_member(organisation_id));
drop policy if exists "cleaning_update_owner_manager" on public.cleaning_checks;
create policy "cleaning_update_owner_manager" on public.cleaning_checks for update to authenticated using (is_org_owner_or_manager(organisation_id));
drop policy if exists "cleaning_delete_owner_manager" on public.cleaning_checks;
create policy "cleaning_delete_owner_manager" on public.cleaning_checks for delete to authenticated using (is_org_owner_or_manager(organisation_id));

drop policy if exists "process_select_member" on public.food_process_checks;
create policy "process_select_member" on public.food_process_checks for select to authenticated using (is_org_member(organisation_id));
drop policy if exists "process_insert_member" on public.food_process_checks;
create policy "process_insert_member" on public.food_process_checks for insert to authenticated with check (is_org_member(organisation_id));
drop policy if exists "process_update_owner_manager" on public.food_process_checks;
create policy "process_update_owner_manager" on public.food_process_checks for update to authenticated using (is_org_owner_or_manager(organisation_id));
drop policy if exists "process_delete_owner_manager" on public.food_process_checks;
create policy "process_delete_owner_manager" on public.food_process_checks for delete to authenticated using (is_org_owner_or_manager(organisation_id));

drop policy if exists "haccp_select_member" on public.haccp_flows;
create policy "haccp_select_member" on public.haccp_flows for select to authenticated using (is_org_member(organisation_id));
drop policy if exists "haccp_insert_member" on public.haccp_flows;
create policy "haccp_insert_member" on public.haccp_flows for insert to authenticated with check (is_org_member(organisation_id));
drop policy if exists "haccp_update_owner_manager" on public.haccp_flows;
create policy "haccp_update_owner_manager" on public.haccp_flows for update to authenticated using (is_org_owner_or_manager(organisation_id));
drop policy if exists "haccp_delete_owner_manager" on public.haccp_flows;
create policy "haccp_delete_owner_manager" on public.haccp_flows for delete to authenticated using (is_org_owner_or_manager(organisation_id));
