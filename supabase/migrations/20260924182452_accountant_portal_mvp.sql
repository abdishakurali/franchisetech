-- Accountant portal MVP: free external, read-only multi-organisation access.
alter table public.organisation_members
  drop constraint if exists organisation_members_role_check;

alter table public.organisation_members
  add constraint organisation_members_role_check
  check (role in ('owner', 'manager', 'staff', 'auditor', 'cashier', 'kitchen', 'accountant'));

alter table public.organisation_members
  add column if not exists accountant_permissions text[] not null
  default array['sales','cash','stock','purchases','documents']::text[];

alter table public.organisation_members
  drop constraint if exists organisation_members_accountant_permissions_check;

alter table public.organisation_members
  add constraint organisation_members_accountant_permissions_check
  check (accountant_permissions <@ array['sales','cash','stock','purchases','documents']::text[]);

-- Restrictive policies are AND-ed with every permissive policy. This closes
-- broad legacy/member_access policies without changing employee behaviour.
do $$
declare
  tbl text;
  org_expression text;
begin
  foreach tbl in array array[
    'organisations','organisation_members','sites','product_categories','units_of_measure','vat_rates',
    'payment_methods','products','pos_sessions','pos_transactions',
    'pos_transaction_items','sale_payments','pos_cash_movements','pos_daily_close',
    'purchases','purchase_items','stock_movements','recipes','recipe_items',
    'suppliers','invoices','invoice_items','staff_members'
  ] loop
    if to_regclass('public.' || tbl) is not null and (
      tbl = 'organisations' or exists (
        select 1 from information_schema.columns c
        where c.table_schema = 'public' and c.table_name = tbl and c.column_name = 'organisation_id'
      )
    ) then
      org_expression := case when tbl = 'organisations' then 'id' else 'organisation_id' end;
      execute format('drop policy if exists accountant_deny_insert on public.%I', tbl);
      execute format('drop policy if exists accountant_deny_update on public.%I', tbl);
      execute format('drop policy if exists accountant_deny_delete on public.%I', tbl);
      execute format(
        'create policy accountant_deny_insert on public.%I as restrictive for insert to authenticated with check (coalesce(public.get_org_role(%s), '''') <> ''accountant'')',
        tbl, org_expression
      );
      execute format(
        'create policy accountant_deny_update on public.%I as restrictive for update to authenticated using (coalesce(public.get_org_role(%s), '''') <> ''accountant'') with check (coalesce(public.get_org_role(%s), '''') <> ''accountant'')',
        tbl, org_expression, org_expression
      );
      execute format(
        'create policy accountant_deny_delete on public.%I as restrictive for delete to authenticated using (coalesce(public.get_org_role(%s), '''') <> ''accountant'')',
        tbl, org_expression
      );
    end if;
  end loop;
end $$;

-- Employee/customer datasets are outside the accountant portal's purpose.
-- Existing staff roles keep their current access.
do $$
declare
  tbl text;
begin
  foreach tbl in array array['staff_members','customers','customer_visits'] loop
    if to_regclass('public.' || tbl) is not null and exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = tbl and c.column_name = 'organisation_id'
    ) then
      execute format('drop policy if exists accountant_hide_private_data on public.%I', tbl);
      execute format(
        'create policy accountant_hide_private_data on public.%I as restrictive for select to authenticated using (coalesce(public.get_org_role(organisation_id), '''') <> ''accountant'')',
        tbl
      );
    end if;
  end loop;
end $$;

create index if not exists organisation_members_accountant_clients_idx
  on public.organisation_members(user_id, organisation_id)
  where role = 'accountant' and status = 'active';
