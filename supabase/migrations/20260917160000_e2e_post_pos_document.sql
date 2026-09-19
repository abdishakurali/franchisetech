-- Atomic POS posting contract used by completeSaleReturn in isolated E2E.
create table if not exists public.pos_transaction_payments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  transaction_id uuid not null references public.pos_transactions(id) on delete cascade,
  payment_method_id uuid references public.payment_methods(id),
  method text not null,
  amount numeric not null,
  reference text,
  note text
);
alter table public.pos_transaction_payments enable row level security;
create policy pos_payment_member_access on public.pos_transaction_payments for all to authenticated
  using (public.is_org_member(organisation_id)) with check (public.is_org_member(organisation_id));

create or replace function public.post_pos_document(
  p_org_id uuid,
  p_actor_id uuid,
  p_document jsonb
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_tx public.pos_transactions;
  v_item jsonb;
  v_payment jsonb;
begin
  select * into v_tx from public.pos_transactions
    where organisation_id = p_org_id
      and idempotency_key = p_document->>'idempotency_key'
    limit 1;
  if found then
    return jsonb_build_object('transaction_id', v_tx.id, 'transaction_number', v_tx.transaction_number, 'idempotent', true);
  end if;

  insert into public.pos_transactions (
    organisation_id, site_id, session_id, transaction_number, sold_by, sold_at,
    subtotal, subtotal_net, tax_total, total, status, idempotency_key
  ) values (
    p_org_id,
    nullif(p_document->>'site_id', '')::uuid,
    nullif(p_document->>'session_id', '')::uuid,
    p_document->>'transaction_number', p_actor_id, now(),
    coalesce((p_document->>'subtotal')::numeric, 0),
    coalesce((p_document->>'subtotal_net')::numeric, 0),
    coalesce((p_document->>'tax_total')::numeric, 0),
    coalesce((p_document->>'total')::numeric, 0),
    'completed', p_document->>'idempotency_key'
  ) returning * into v_tx;

  for v_item in select value from jsonb_array_elements(coalesce(p_document->'items', '[]'::jsonb)) loop
    insert into public.pos_transaction_items (
      organisation_id, transaction_id, product_id, product_name, quantity, unit_price,
      vat_rate, net_amount, vat_amount, gross_amount
    ) values (
      p_org_id, v_tx.id, nullif(v_item->>'product_id', '')::uuid,
      v_item->>'product_name', coalesce((v_item->>'quantity')::numeric, 0),
      coalesce((v_item->>'unit_price')::numeric, 0), coalesce((v_item->>'vat_rate')::numeric, 0),
      coalesce((v_item->>'net_amount')::numeric, 0), coalesce((v_item->>'vat_amount')::numeric, 0),
      coalesce((v_item->>'gross_amount')::numeric, 0)
    );
  end loop;

  for v_payment in select value from jsonb_array_elements(coalesce(p_document->'payments', '[]'::jsonb)) loop
    insert into public.pos_transaction_payments (organisation_id, transaction_id, payment_method_id, method, amount, reference, note)
    values (p_org_id, v_tx.id, nullif(v_payment->>'payment_method_id', '')::uuid,
      coalesce(v_payment->>'method', 'other'), coalesce((v_payment->>'amount')::numeric, 0),
      nullif(v_payment->>'reference', ''), nullif(v_payment->>'note', ''));
  end loop;

  return jsonb_build_object('transaction_id', v_tx.id, 'transaction_number', v_tx.transaction_number, 'idempotent', false);
end;
$$;

revoke all on function public.post_pos_document(uuid, uuid, jsonb) from public;
grant execute on function public.post_pos_document(uuid, uuid, jsonb) to service_role;
