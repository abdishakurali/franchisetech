-- Accountants need a permissive SELECT policy in addition to the restrictive
-- category guard. Existing member policies intentionally exclude accountants.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'pos_transactions','pos_transaction_items','sale_payments','payment_methods',
    'pos_sessions','pos_cash_movements','pos_daily_close','products',
    'product_categories','units_of_measure','vat_rates','stock_movements',
    'recipes','recipe_items','purchases','purchase_items','suppliers',
    'invoices','invoice_items'
  ] loop
    if to_regclass('public.' || tbl) is not null and exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = tbl
        and c.column_name = 'organisation_id'
    ) then
      execute format('drop policy if exists accountant_org_read on public.%I', tbl);
      execute format(
        'create policy accountant_org_read on public.%I for select to authenticated using (exists (select 1 from public.organisation_members m where m.organisation_id = public.%I.organisation_id and m.user_id = (select auth.uid()) and m.role = ''accountant'' and coalesce(m.status, ''active'') = ''active''))',
        tbl,
        tbl
      );
    end if;
  end loop;
end $$;
