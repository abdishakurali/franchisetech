-- Fiscal receipt: "send again" for unconfirmed sales + an "unconfirmed" state.
--
-- Why (production, Dolce Nera, 2026-10-27..2026-11-12): 8 sales have no
-- confirmed fiscal receipt. 6 are `failed`, 2 are stuck `api_pending` forever
-- because the till page reloaded while the browser was still waiting for
-- FiscalNet. Nothing in the app could send such a receipt again, and nothing
-- ever moved a stuck `api_pending` row, so reports never showed them.
--
-- FiscalNet has NO idempotency key (driverfiscal.ro docs: an
-- X-FiscalNet-External-Id is "correlation, not idempotency"; a second POST
-- prints again). So the guard against a second fiscal receipt lives here and
-- in the UI: one resend at a time per sale (row lock + `printing` state + a
-- `pending` attempt row written BEFORE the browser calls the printer), only
-- for sales whose receipt is not confirmed, and only after the cashier
-- confirms they checked the printer.
--
-- All changes are additive:
--   1. `unconfirmed` is added to the allowed pos_transactions.fiscal_receipt_status
--      values (superset of the old list; old code never writes it, and the old
--      replay logic only re-prints for api_pending/pending, so it never
--      re-prints an `unconfirmed` sale).
--   2. Three new SECURITY DEFINER functions, EXECUTE for service_role only.
-- No existing function, column, row or policy is changed.
--
-- Undo (run in this order; restores the exact previous state):
--   update public.pos_transactions set fiscal_receipt_status = 'api_pending' where fiscal_receipt_status = 'unconfirmed';
--   drop function if exists public.begin_fiscal_receipt_resend(uuid, uuid, uuid, uuid, integer);
--   drop function if exists public.finish_fiscal_receipt_resend(uuid, uuid, text, text, text, text, text);
--   drop function if exists public.sweep_unconfirmed_fiscal_receipts(integer);
--   alter table public.pos_transactions drop constraint pos_transactions_fiscal_receipt_status_check;
--   alter table public.pos_transactions add constraint pos_transactions_fiscal_receipt_status_check
--     check (fiscal_receipt_status = any (array['not_required','pending','printing','success','failed','skipped','ambiguous','timeout','api_pending']));
-- (Resend attempt rows stay in fiscal_receipt_attempts; they are valid under
-- the old schema and are the audit trail of what was sent.)

-- 1. Allow the `unconfirmed` state ------------------------------------------

alter table public.pos_transactions
  drop constraint if exists pos_transactions_fiscal_receipt_status_check;

alter table public.pos_transactions
  add constraint pos_transactions_fiscal_receipt_status_check
  check (fiscal_receipt_status = any (array[
    'not_required', 'pending', 'printing', 'success', 'failed', 'skipped',
    'ambiguous', 'timeout', 'api_pending', 'unconfirmed'
  ])) not valid;

alter table public.pos_transactions
  validate constraint pos_transactions_fiscal_receipt_status_check;

-- 2. Begin a resend ----------------------------------------------------------
--
-- Locks the sale, checks it may be sent again, writes a `pending` attempt row
-- with the next attempt number and moves the sale to `printing`. Only then may
-- the browser call FiscalNet. A second caller (other tab, double click) finds
-- the sale in `printing` and is refused, so two resends can never be in
-- flight for one sale.
--
-- p_required_session_id: when not null (cashier/staff), the sale must belong
-- to that till session. Owners/managers pass null.

create or replace function public.begin_fiscal_receipt_resend(
  p_org_id uuid,
  p_transaction_id uuid,
  p_performed_by uuid,
  p_required_session_id uuid,
  p_stuck_minutes integer default 5
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx record;
  v_attempt_number integer;
  v_attempt_id uuid;
begin
  select id, status, session_id, sold_at, fiscal_receipt_status
    into v_tx
  from public.pos_transactions
  where id = p_transaction_id and organisation_id = p_org_id
  for update;

  if not found then
    raise exception 'RESEND_TRANSACTION_NOT_FOUND';
  end if;

  if coalesce(v_tx.status, 'completed') <> 'completed' then
    raise exception 'RESEND_NOT_ELIGIBLE: sale is %', v_tx.status;
  end if;

  if p_required_session_id is not null
     and v_tx.session_id is distinct from p_required_session_id then
    raise exception 'RESEND_NOT_SAME_SESSION';
  end if;

  if v_tx.fiscal_receipt_status = 'printing' then
    raise exception 'RESEND_IN_PROGRESS';
  end if;

  if not (
    v_tx.fiscal_receipt_status in ('failed', 'timeout', 'unconfirmed')
    or (
      v_tx.fiscal_receipt_status = 'api_pending'
      and v_tx.sold_at < now() - make_interval(mins => greatest(p_stuck_minutes, 1))
    )
  ) then
    raise exception 'RESEND_NOT_ELIGIBLE: fiscal status is %', v_tx.fiscal_receipt_status;
  end if;

  select coalesce(max(attempt_number), 0) + 1 into v_attempt_number
  from public.fiscal_receipt_attempts
  where transaction_id = p_transaction_id;

  insert into public.fiscal_receipt_attempts (
    organisation_id, transaction_id, attempt_number, status, mock_mode,
    error_info, performed_by, attempted_at
  ) values (
    p_org_id, p_transaction_id, v_attempt_number, 'pending', false,
    'resend: printer checked by staff before sending', p_performed_by, now()
  )
  returning id into v_attempt_id;

  update public.pos_transactions
  set fiscal_receipt_status = 'printing',
      fiscal_receipt_attempt_id = v_attempt_id
  where id = p_transaction_id and organisation_id = p_org_id;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'attempt_number', v_attempt_number,
    'previous_status', v_tx.fiscal_receipt_status
  );
end;
$$;

-- 3. Finish a resend ---------------------------------------------------------
--
-- Records the answer the browser got from FiscalNet on the `pending` attempt
-- row and sets the sale's status. Idempotent: a second call for an attempt
-- that is no longer `pending` changes nothing. The sale status is only moved
-- while this attempt is still the sale's current one and the sale is still
-- `printing` (or was swept to `unconfirmed` while the answer was slow).

create or replace function public.finish_fiscal_receipt_resend(
  p_org_id uuid,
  p_attempt_id uuid,
  p_status text,
  p_response_content text,
  p_receipt_number text,
  p_error_code text,
  p_error_info text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx_id uuid;
  v_attempt_status text;
  v_tx_status text;
begin
  if p_status not in ('success', 'failed', 'timeout', 'ambiguous', 'mock_success') then
    raise exception 'INVALID_FISCAL_ATTEMPT_STATUS: %', p_status;
  end if;

  select transaction_id, status into v_tx_id, v_attempt_status
  from public.fiscal_receipt_attempts
  where id = p_attempt_id and organisation_id = p_org_id;

  if v_tx_id is null then
    raise exception 'RESEND_ATTEMPT_NOT_FOUND';
  end if;

  perform 1 from public.pos_transactions
  where id = v_tx_id and organisation_id = p_org_id
  for update;

  if v_attempt_status <> 'pending' then
    return jsonb_build_object('attempt_id', p_attempt_id, 'idempotent', true);
  end if;

  update public.fiscal_receipt_attempts
  set status = p_status,
      mock_mode = (p_status = 'mock_success'),
      response_content = p_response_content,
      receipt_number = p_receipt_number,
      error_code = p_error_code,
      error_info = coalesce(p_error_info, error_info),
      resolved_at = now()
  where id = p_attempt_id and organisation_id = p_org_id;

  v_tx_status := case when p_status = 'mock_success' then 'success' else p_status end;

  update public.pos_transactions
  set fiscal_receipt_status = v_tx_status,
      fiscal_receipt_number = coalesce(p_receipt_number, fiscal_receipt_number)
  where id = v_tx_id
    and organisation_id = p_org_id
    and fiscal_receipt_attempt_id = p_attempt_id
    and fiscal_receipt_status in ('printing', 'unconfirmed');

  return jsonb_build_object('attempt_id', p_attempt_id, 'idempotent', false, 'transaction_status', v_tx_status);
end;
$$;

-- 4. Sweep: stuck receipts become `unconfirmed` ------------------------------
--
-- `api_pending` older than p_older_than_minutes (the browser never reported
-- an answer), and `printing` whose current attempt is still `pending` that
-- long (a resend whose page closed mid-print). `unconfirmed` is NOT `failed`:
-- the receipt may well have printed; only the printer journal can say.

create or replace function public.sweep_unconfirmed_fiscal_receipts(
  p_older_than_minutes integer default 30
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cutoff timestamptz := now() - make_interval(mins => greatest(p_older_than_minutes, 5));
  v_pending integer;
  v_printing integer;
begin
  update public.pos_transactions
  set fiscal_receipt_status = 'unconfirmed'
  where fiscal_receipt_status = 'api_pending'
    and sold_at < v_cutoff;
  get diagnostics v_pending = row_count;

  update public.pos_transactions t
  set fiscal_receipt_status = 'unconfirmed'
  from public.fiscal_receipt_attempts a
  where t.fiscal_receipt_status = 'printing'
    and a.id = t.fiscal_receipt_attempt_id
    and a.status = 'pending'
    and a.attempted_at < v_cutoff;
  get diagnostics v_printing = row_count;

  return jsonb_build_object('api_pending', v_pending, 'printing', v_printing, 'cutoff', v_cutoff);
end;
$$;

revoke all on function public.begin_fiscal_receipt_resend(uuid, uuid, uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.finish_fiscal_receipt_resend(uuid, uuid, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.sweep_unconfirmed_fiscal_receipts(integer) from public, anon, authenticated;
grant execute on function public.begin_fiscal_receipt_resend(uuid, uuid, uuid, uuid, integer) to service_role;
grant execute on function public.finish_fiscal_receipt_resend(uuid, uuid, text, text, text, text, text) to service_role;
grant execute on function public.sweep_unconfirmed_fiscal_receipts(integer) to service_role;
