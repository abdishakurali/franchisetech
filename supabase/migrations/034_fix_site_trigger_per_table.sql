-- ============================================================
-- 034 — Fix ensure_record_site trigger: per-table functions
-- ============================================================
-- Root cause: the shared ensure_record_site() function references
-- new.session_id in an elsif branch. PostgreSQL validates ALL NEW.field
-- accesses against the triggering table's row type at plan time.
-- pos_sessions has no session_id column → every INSERT into pos_sessions
-- threw "record 'new' has no field 'session_id'" → Open Till always failed.
-- Fix: replace one shared function with dedicated per-table functions that
-- only reference columns that actually exist on each table.
-- ============================================================

-- ── Drop shared trigger from all tables ──────────────────────────────────────
drop trigger if exists trg_pos_sessions_site          on public.pos_sessions;
drop trigger if exists trg_pos_transactions_site      on public.pos_transactions;
drop trigger if exists trg_pos_transaction_items_site on public.pos_transaction_items;
drop trigger if exists trg_sale_payments_site         on public.sale_payments;
drop trigger if exists trg_pos_cash_movements_site    on public.pos_cash_movements;
drop trigger if exists trg_kitchen_orders_site        on public.kitchen_orders;

-- Drop the broken shared function
drop function if exists public.ensure_record_site();

-- ── pos_sessions ─────────────────────────────────────────────────────────────
-- pos_sessions has: id, organisation_id, site_id, opened_by, ...
-- No session_id or sale_id — so we just resolve via default_site_id.
create or replace function public.ensure_pos_sessions_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations (pos_sessions)';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation (pos_sessions)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pos_sessions_site on public.pos_sessions;
create trigger trg_pos_sessions_site
before insert or update of site_id, organisation_id on public.pos_sessions
for each row execute function public.ensure_pos_sessions_site();

-- ── pos_transactions ─────────────────────────────────────────────────────────
-- has: organisation_id, site_id, session_id
create or replace function public.ensure_pos_transactions_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id uuid;
begin
  if new.site_id is null and new.session_id is not null then
    select site_id into v_site_id
      from public.pos_sessions
     where id = new.session_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  end if;

  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations (pos_transactions)';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation (pos_transactions)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pos_transactions_site on public.pos_transactions;
create trigger trg_pos_transactions_site
before insert or update of site_id, organisation_id, session_id on public.pos_transactions
for each row execute function public.ensure_pos_transactions_site();

-- ── pos_transaction_items ─────────────────────────────────────────────────────
-- has: organisation_id, site_id, transaction_id
create or replace function public.ensure_pos_transaction_items_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id uuid;
begin
  if new.site_id is null and new.transaction_id is not null then
    select site_id into v_site_id
      from public.pos_transactions
     where id = new.transaction_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  end if;

  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations (pos_transaction_items)';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation (pos_transaction_items)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pos_transaction_items_site on public.pos_transaction_items;
create trigger trg_pos_transaction_items_site
before insert or update of site_id, organisation_id, transaction_id on public.pos_transaction_items
for each row execute function public.ensure_pos_transaction_items_site();

-- ── sale_payments ─────────────────────────────────────────────────────────────
-- has: organisation_id, site_id, sale_id
create or replace function public.ensure_sale_payments_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id uuid;
begin
  if new.site_id is null and new.sale_id is not null then
    select site_id into v_site_id
      from public.pos_transactions
     where id = new.sale_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  end if;

  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations (sale_payments)';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation (sale_payments)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sale_payments_site on public.sale_payments;
create trigger trg_sale_payments_site
before insert or update of site_id, organisation_id, sale_id on public.sale_payments
for each row execute function public.ensure_sale_payments_site();

-- ── pos_cash_movements ────────────────────────────────────────────────────────
-- has: organisation_id, site_id, session_id
create or replace function public.ensure_pos_cash_movements_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id uuid;
begin
  if new.site_id is null and new.session_id is not null then
    select site_id into v_site_id
      from public.pos_sessions
     where id = new.session_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  end if;

  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations (pos_cash_movements)';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation (pos_cash_movements)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pos_cash_movements_site on public.pos_cash_movements;
create trigger trg_pos_cash_movements_site
before insert or update of site_id, organisation_id, session_id on public.pos_cash_movements
for each row execute function public.ensure_pos_cash_movements_site();

-- ── kitchen_orders ────────────────────────────────────────────────────────────
-- has: organisation_id, site_id, sale_id
create or replace function public.ensure_kitchen_orders_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_id uuid;
begin
  if new.site_id is null and new.sale_id is not null then
    select site_id into v_site_id
      from public.pos_transactions
     where id = new.sale_id and organisation_id = new.organisation_id;
    new.site_id := v_site_id;
  end if;

  if new.site_id is null then
    new.site_id := public.default_site_id(new.organisation_id);
  end if;

  if new.site_id is null then
    raise exception 'site_id is required for multi-site organisations (kitchen_orders)';
  end if;

  if not exists (
    select 1 from public.sites s
    where s.id = new.site_id and s.organisation_id = new.organisation_id
  ) then
    raise exception 'site_id does not belong to organisation (kitchen_orders)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_kitchen_orders_site on public.kitchen_orders;
create trigger trg_kitchen_orders_site
before insert or update of site_id, organisation_id, sale_id on public.kitchen_orders
for each row execute function public.ensure_kitchen_orders_site();

-- ── Grant execute to authenticated ───────────────────────────────────────────
revoke all on function public.ensure_pos_sessions_site()          from public, anon;
revoke all on function public.ensure_pos_transactions_site()      from public, anon;
revoke all on function public.ensure_pos_transaction_items_site() from public, anon;
revoke all on function public.ensure_sale_payments_site()         from public, anon;
revoke all on function public.ensure_pos_cash_movements_site()    from public, anon;
revoke all on function public.ensure_kitchen_orders_site()        from public, anon;
