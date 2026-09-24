-- Restore the relationship used by PostgREST embeds on transaction and
-- reporting pages. Production already has this constraint; isolated restore
-- targets may not, so keep the migration idempotent.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pos_transactions_payment_method_id_fkey'
      and conrelid = 'public.pos_transactions'::regclass
  ) then
    alter table public.pos_transactions
      add constraint pos_transactions_payment_method_id_fkey
      foreign key (payment_method_id)
      references public.payment_methods(id)
      on delete set null;
  end if;
end
$$;
