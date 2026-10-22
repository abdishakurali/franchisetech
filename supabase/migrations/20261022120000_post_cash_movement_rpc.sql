-- Atomic, idempotent manual cash in/out (Registrul de Casă).
--
-- Replaces the app-side "insert movement, then read expected_cash, then write
-- expected_cash back" sequence, which (a) could record the same cash-in twice
-- on a double click/retry and (b) could overwrite a concurrent sale's
-- expected_cash increment from post_pos_document (lost update).
--
-- Additive only: new function, no table/column/policy changes. Uses the
-- existing partial unique index pos_cash_movements_org_idempotency_key_uidx.
-- Old app code never calls it, so an app rollback is safe with it in place.

create or replace function public.post_cash_movement(
  p_org_id uuid,
  p_actor_id uuid,
  p_document jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := nullif(trim(coalesce(p_document->>'idempotency_key', '')), '');
  v_session_id uuid := nullif(p_document->>'session_id', '')::uuid;
  v_type text := p_document->>'movement_type';
  v_amount numeric := round(abs(coalesce((p_document->>'amount')::numeric, 0)), 2);
  v_reason text := nullif(trim(coalesce(p_document->>'reason', '')), '');
  v_delta numeric;
  v_session public.pos_sessions;
  v_existing public.pos_cash_movements;
  v_movement_id uuid;
begin
  if v_key is null then raise exception 'CASH_MOVEMENT_IDEMPOTENCY_REQUIRED'; end if;
  if v_type not in ('cash_in', 'cash_out') then raise exception 'CASH_MOVEMENT_TYPE_INVALID'; end if;
  if v_amount <= 0 then raise exception 'CASH_MOVEMENT_AMOUNT_INVALID'; end if;
  if v_reason is null then raise exception 'CASH_MOVEMENT_REASON_REQUIRED'; end if;
  if v_session_id is null then raise exception 'OPEN_SESSION_NOT_FOUND'; end if;

  select * into v_existing from public.pos_cash_movements
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('movement_id', v_existing.id, 'idempotent', true);
  end if;

  -- Same lock target as the sale path's expected_cash update, so cash in/out
  -- and sales on one till serialise instead of overwriting each other.
  select * into v_session from public.pos_sessions
  where id = v_session_id and organisation_id = p_org_id and status = 'open'
  for update;
  if not found then raise exception 'OPEN_SESSION_NOT_FOUND'; end if;

  v_delta := case when v_type = 'cash_in' then v_amount else -v_amount end;

  insert into public.pos_cash_movements (
    organisation_id, site_id, session_id, movement_type, amount, reason, performed_by, idempotency_key
  ) values (
    p_org_id, v_session.site_id, v_session_id, v_type, v_delta, v_reason, p_actor_id, v_key
  ) returning id into v_movement_id;

  update public.pos_sessions
  set expected_cash = round(coalesce(expected_cash, 0) + v_delta, 2)
  where id = v_session_id and organisation_id = p_org_id;

  return jsonb_build_object('movement_id', v_movement_id, 'idempotent', false);
exception when unique_violation then
  select * into v_existing from public.pos_cash_movements
  where organisation_id = p_org_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('movement_id', v_existing.id, 'idempotent', true);
  end if;
  raise;
end;
$$;

revoke all on function public.post_cash_movement(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_cash_movement(uuid, uuid, jsonb) to service_role;
