-- ============================================================
-- 027 FISCALNET RELIABILITY
-- ============================================================
-- Adds missing organisation columns (referenced by code but
-- absent from migration 025), widens status check constraints,
-- creates fiscal_command_log for non-sale audit, and adds
-- Z-report / opening-balance tracking to pos_sessions.
-- ============================================================

-- ── 1. Missing fiscalnet columns on organisations ─────────────────────────
alter table organisations
  add column if not exists fiscalnet_connection_mode text default 'api'
    check (fiscalnet_connection_mode in ('api', 'file')),
  add column if not exists fiscalnet_api_host        text default 'http://localhost:65400',
  add column if not exists fiscalnet_vat_groups      jsonb,
  add column if not exists fiscalnet_payment_type_map jsonb;

-- ── 2. Widen pos_transactions.fiscal_receipt_status ──────────────────────
alter table pos_transactions
  drop constraint if exists pos_transactions_fiscal_receipt_status_check;

alter table pos_transactions
  add constraint pos_transactions_fiscal_receipt_status_check
  check (fiscal_receipt_status in (
    'not_required','pending','printing','success','failed',
    'skipped','ambiguous','timeout','api_pending'
  ));

-- ── 3. fiscal_command_log — audit of every non-sale fiscal command ────────
create table if not exists fiscal_command_log (
  id               uuid primary key default uuid_generate_v4(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  session_id       uuid,
  command_type     text not null,
  status           text not null default 'pending'
    check (status in ('pending','success','failed','timeout','ambiguous','mock_success')),
  mock_mode        boolean not null default false,
  amount_ron       numeric,
  command_content  text,
  response_content text,
  error_code       text,
  error_info       text,
  performed_by     uuid references auth.users(id),
  attempted_at     timestamptz not null default now(),
  resolved_at      timestamptz
);

create index if not exists fiscal_command_log_org_idx     on fiscal_command_log(organisation_id);
create index if not exists fiscal_command_log_session_idx on fiscal_command_log(session_id);

alter table fiscal_command_log enable row level security;

create policy "org members view fiscal command log"
  on fiscal_command_log for select
  using (
    organisation_id in (
      select organisation_id from organisation_members where user_id = auth.uid()
    )
  );

create policy "service role insert fiscal command log"
  on fiscal_command_log for insert with check (true);

create policy "service role update fiscal command log"
  on fiscal_command_log for update using (true);

-- ── 4. Z-report and opening-balance tracking on pos_sessions ─────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'pos_sessions'
  ) then
    alter table pos_sessions
      add column if not exists fiscal_z_report_done        boolean     default false,
      add column if not exists fiscal_z_report_at          timestamptz,
      add column if not exists fiscal_z_report_log_id      uuid,
      add column if not exists fiscal_opening_balance_done boolean     default false,
      add column if not exists fiscal_opening_balance_at   timestamptz;
  end if;
end$$;
