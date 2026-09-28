-- Gate B: fiscal receipt logging fix.
--
-- Today: app/actions/kitchenops.ts's completeSaleReturn sets
-- pos_transactions.fiscal_receipt_status = 'api_pending' server-side right
-- after the sale posts, then returns to the client. The client calls
-- fiscalBrowserReceipt (lib/fiscalnet/browser.ts) to actually reach the
-- till's local FiscalNet agent -- correctly client-side, per CLAUDE.md's
-- "never call FiscalNet from the Next.js backend" rule -- but that function
-- does no DB writes at all. Nothing ever transitions the status away from
-- 'api_pending' for a real sale, and no row is ever inserted into
-- fiscal_receipt_attempts. The only code that DOES write that table
-- (printFiscalReceipt / its retryFiscalReceipt caller) is unreachable from
-- any UI -- confirmed zero importers -- and additionally calls FiscalNet
-- from the server in "api" mode, itself a violation of the same rule.
--
-- Fix: one RPC the client calls once, immediately after fiscalBrowserReceipt
-- resolves (success or failure -- both are attempts worth recording), that
-- atomically records the already-known outcome and updates the transaction's
-- status in a single write. Not insert-pending-then-update-later: by the
-- time this is called the outcome is already known, so there is only ever
-- one INSERT, and it is idempotent on (transaction_id, attempt_number) so a
-- client-side retry of the logging call itself can't double-write.
--
-- Mirrors post_pos_document's shape exactly: SECURITY DEFINER, search_path
-- pinned empty, the parent row locked FOR UPDATE to serialize concurrent
-- callers before the idempotency check, granted to service_role only.

alter table public.fiscal_receipt_attempts
  add constraint fiscal_receipt_attempts_tx_attempt_unique
  unique (transaction_id, attempt_number);

create or replace function public.record_fiscal_receipt_attempt(
  p_org_id uuid,
  p_transaction_id uuid,
  p_attempt_number integer,
  p_status text,
  p_mock_mode boolean,
  p_response_content text,
  p_receipt_number text,
  p_error_code text,
  p_error_info text,
  p_performed_by uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_id uuid;
  v_attempt_id uuid;
  v_was_idempotent boolean := false;
  v_tx_status text;
begin
  if p_status not in ('success', 'failed', 'timeout', 'ambiguous', 'mock_success') then
    raise exception 'INVALID_FISCAL_ATTEMPT_STATUS: %', p_status;
  end if;

  -- Lock the parent transaction so a concurrent duplicate call for the same
  -- (transaction_id, attempt_number) blocks here rather than racing the
  -- idempotency check below.
  perform 1 from public.pos_transactions
  where id = p_transaction_id and organisation_id = p_org_id
  for update;

  if not found then
    raise exception 'FISCAL_ATTEMPT_TRANSACTION_NOT_FOUND: %', p_transaction_id;
  end if;

  select id into v_existing_id
  from public.fiscal_receipt_attempts
  where transaction_id = p_transaction_id and attempt_number = p_attempt_number;

  if v_existing_id is not null then
    v_attempt_id := v_existing_id;
    v_was_idempotent := true;
  else
    insert into public.fiscal_receipt_attempts (
      organisation_id, transaction_id, attempt_number, status, mock_mode,
      response_content, receipt_number, error_code, error_info,
      performed_by, attempted_at, resolved_at
    ) values (
      p_org_id, p_transaction_id, p_attempt_number, p_status, p_mock_mode,
      p_response_content, p_receipt_number, p_error_code, p_error_info,
      p_performed_by, now(), now()
    )
    returning id into v_attempt_id;
  end if;

  -- pos_transactions.fiscal_receipt_status has no separate mock_success value
  -- (see printFiscalReceipt's same collapse in lib/fiscalnet/service.ts).
  v_tx_status := case when p_status = 'mock_success' then 'success' else p_status end;

  update public.pos_transactions
  set fiscal_receipt_status = v_tx_status,
      fiscal_receipt_number = coalesce(p_receipt_number, fiscal_receipt_number),
      fiscal_receipt_attempt_id = v_attempt_id
  where id = p_transaction_id and organisation_id = p_org_id;

  return jsonb_build_object('attempt_id', v_attempt_id, 'idempotent', v_was_idempotent);
end;
$$;

revoke all on function public.record_fiscal_receipt_attempt(uuid, uuid, integer, text, boolean, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.record_fiscal_receipt_attempt(uuid, uuid, integer, text, boolean, text, text, text, text, uuid) to service_role;
