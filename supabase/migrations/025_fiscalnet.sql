-- ============================================================
-- 025 FISCALNET — Romanian fiscal receipt integration
-- ============================================================
-- Adds country_code to organisations, FiscalNet configuration
-- columns, fiscal receipt fields on pos_transactions, and the
-- fiscal_receipt_attempts audit table.
--
-- Safety: all columns default to 'off'/'false'/null so that
-- existing Irish and other non-Romanian businesses are entirely
-- unaffected. FiscalNet features only activate when:
--   country_code = 'RO' AND fiscalnet_enabled = true
-- ============================================================

-- ── 1. country_code on organisations ─────────────────────────
alter table organisations
  add column if not exists country_code text default 'IE';

-- Backfill from existing 'country' text column
update organisations
  set country_code = case
    when lower(country) like '%romania%'                       then 'RO'
    when lower(country) in ('ireland', 'republic of ireland')  then 'IE'
    when lower(country) like '%united kingdom%'
      or lower(country) like '%england%'
      or lower(country) like '%scotland%'
      or lower(country) like '%wales%'                         then 'GB'
    else 'IE'
  end
  where country_code = 'IE';   -- only rows not yet set

-- ── 2. FiscalNet configuration on organisations ──────────────
alter table organisations
  add column if not exists fiscalnet_enabled          boolean  default false,
  add column if not exists fiscalnet_mock_mode        boolean  default true,
  add column if not exists fiscalnet_bonuri_path      text,
  add column if not exists fiscalnet_raspuns_path     text,
  add column if not exists fiscalnet_auto_print       boolean  default true,
  add column if not exists fiscalnet_ask_before_print boolean  default false,
  add column if not exists fiscalnet_manual_only      boolean  default false,
  add column if not exists fiscalnet_timeout_ms       integer  default 30000,
  add column if not exists fiscalnet_retry_count      integer  default 2,
  add column if not exists fiscalnet_cif              text,
  add column if not exists fiscalnet_operator_code    text;

-- ── 3. Fiscal receipt fields on pos_transactions ─────────────
alter table pos_transactions
  add column if not exists fiscal_receipt_required    boolean  default false,
  add column if not exists fiscal_receipt_status      text     default 'not_required'
    check (fiscal_receipt_status in (
      'not_required','pending','printing','success','failed','skipped','ambiguous'
    )),
  add column if not exists fiscal_receipt_number      text,
  add column if not exists fiscal_receipt_attempt_id  uuid;

-- ── 4. fiscal_receipt_attempts table ─────────────────────────
create table if not exists fiscal_receipt_attempts (
  id               uuid primary key default uuid_generate_v4(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  transaction_id   uuid references pos_transactions(id) on delete set null,
  attempt_number   integer not null default 1,
  status           text not null default 'pending'
    check (status in ('pending','success','failed','timeout','ambiguous','mock_success')),
  mock_mode        boolean not null default true,
  command_file     text,                          -- path written (for audit)
  command_content  text,                          -- full command text (for audit)
  response_content text,                          -- raw response text
  receipt_number   text,                          -- NRBON value on success
  error_code       text,                          -- ERRCODE on failure
  error_info       text,                          -- ERRINFO on failure
  performed_by     uuid references auth.users(id),
  attempted_at     timestamptz not null default now(),
  resolved_at      timestamptz
);

-- Index for looking up attempts by transaction
create index if not exists fiscal_receipt_attempts_transaction_id_idx
  on fiscal_receipt_attempts(transaction_id);

create index if not exists fiscal_receipt_attempts_org_id_idx
  on fiscal_receipt_attempts(organisation_id);

-- ── 5. RLS on fiscal_receipt_attempts ────────────────────────
alter table fiscal_receipt_attempts enable row level security;

-- Members of the organisation can view their own attempts
create policy "org members can view fiscal receipt attempts"
  on fiscal_receipt_attempts for select
  using (
    organisation_id in (
      select organisation_id from organisation_members
      where user_id = auth.uid()
    )
  );

-- Service role / server-side actions insert (no user JWT on server actions)
create policy "service role can insert fiscal receipt attempts"
  on fiscal_receipt_attempts for insert
  with check (true);

create policy "service role can update fiscal receipt attempts"
  on fiscal_receipt_attempts for update
  using (true);
