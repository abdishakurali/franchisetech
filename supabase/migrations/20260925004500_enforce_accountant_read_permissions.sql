-- Enforce accountant category permissions at the database boundary.
do $$
declare
  rule record;
begin
  for rule in select * from (values
    ('pos_transactions', array['sales']::text[]),
    ('pos_transaction_items', array['sales']::text[]),
    ('sale_payments', array['sales']::text[]),
    ('payment_methods', array['sales','cash']::text[]),
    ('pos_sessions', array['cash']::text[]),
    ('pos_cash_movements', array['cash']::text[]),
    ('pos_daily_close', array['cash']::text[]),
    ('products', array['sales','stock']::text[]),
    ('product_categories', array['sales','stock']::text[]),
    ('units_of_measure', array['sales','stock']::text[]),
    ('vat_rates', array['sales']::text[]),
    ('stock_movements', array['stock']::text[]),
    ('recipes', array['stock']::text[]),
    ('recipe_items', array['stock']::text[]),
    ('purchases', array['purchases','documents']::text[]),
    ('purchase_items', array['purchases','documents']::text[]),
    ('suppliers', array['purchases','documents']::text[]),
    ('invoices', array['documents']::text[]),
    ('invoice_items', array['documents']::text[])
  ) as permissions(table_name, required)
  loop
    if to_regclass('public.' || rule.table_name) is not null and exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = rule.table_name and c.column_name = 'organisation_id'
    ) then
      execute format('drop policy if exists accountant_category_read on public.%I', rule.table_name);
      execute format(
        'create policy accountant_category_read on public.%I as restrictive for select to authenticated using (coalesce(public.get_org_role(organisation_id), '''') <> ''accountant'' or exists (select 1 from public.organisation_members m where m.organisation_id = public.%I.organisation_id and m.user_id = (select auth.uid()) and m.role = ''accountant'' and coalesce(m.status, ''active'') = ''active'' and m.accountant_permissions && %L::text[]))',
        rule.table_name,
        rule.table_name,
        rule.required
      );
    end if;
  end loop;
end $$;
