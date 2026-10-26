begin;
select plan(12);

select has_function('public', 'issue_sales_invoice', array['uuid', 'uuid', 'uuid'], 'invoice issue RPC exists');
select has_function('public', 'post_stock_free_issue', array['uuid', 'uuid', 'jsonb'], 'free issue RPC exists');
select has_table('public', 'stock_free_issues', 'free issue documents exist');
select throws_ok(
  $$ select public.issue_sales_invoice(gen_random_uuid(), null, gen_random_uuid()) $$,
  'INVOICE_NOT_FOUND', 'unknown invoice is rejected'
);
select throws_ok(
  $$ select public.post_stock_free_issue(gen_random_uuid(), null, '{"reason":"x","lines":[{"productId":"00000000-0000-0000-0000-000000000001","stockQty":1}]}'::jsonb) $$,
  'FREE_ISSUE_IDEMPOTENCY_REQUIRED', 'idempotency key is mandatory'
);
select throws_ok(
  $$ select public.post_stock_free_issue(gen_random_uuid(), null, '{"idempotency_key":"k","reason":"x","lines":[]}'::jsonb) $$,
  'FREE_ISSUE_LINES_REQUIRED', 'empty transfer is rejected'
);

insert into public.organisations (id, name, invoice_series, invoice_next_number)
values ('00000000-0000-4000-8000-000000000901', 'Invoice numbering regression', 'TEST-', 900);

insert into public.products (
  id, organisation_id, name, is_stock_tracked, current_stock_qty, unit_of_measure
) values (
  '00000000-0000-4000-8000-000000000902',
  '00000000-0000-4000-8000-000000000901',
  'Tracked test product', true, 10, 'each'
);

insert into public.efactura_invoices (
  id, organisation_id, invoice_number, issue_date, buyer_cif, buyer_name, line_items
) values (
  '00000000-0000-4000-8000-000000000903',
  '00000000-0000-4000-8000-000000000901',
  'CIORNA-REGRESSION', current_date, 'RO12345678', 'Regression buyer',
  '[{"productId":"00000000-0000-4000-8000-000000000902","stockQty":1,"quantity":1,"name":"Tracked test product","unitCode":"C62","unitPrice":1,"vatRate":0}]'::jsonb
);

create temporary table invoice_issue_result as
select public.issue_sales_invoice(
  '00000000-0000-4000-8000-000000000901', null,
  '00000000-0000-4000-8000-000000000903'
) as value;

select is((select value->>'invoice_number' from invoice_issue_result), 'TEST-900', 'issue allocates the configured final invoice number');
select is((select invoice_number from public.efactura_invoices where id = '00000000-0000-4000-8000-000000000903'), 'TEST-900', 'final invoice number is persisted');
select is((select invoice_next_number from public.organisations where id = '00000000-0000-4000-8000-000000000901'), 901::bigint, 'invoice counter advances once');
select is((select current_stock_qty from public.products where id = '00000000-0000-4000-8000-000000000902'), 9::numeric, 'issuing deducts tracked stock once');

create temporary table invoice_issue_retry as
select public.issue_sales_invoice(
  '00000000-0000-4000-8000-000000000901', null,
  '00000000-0000-4000-8000-000000000903'
) as value;

select is((select value->>'idempotent' from invoice_issue_retry), 'true', 'retry is reported as idempotent');
select is((select current_stock_qty from public.products where id = '00000000-0000-4000-8000-000000000902'), 9::numeric, 'retry does not deduct stock again');

select * from finish();
rollback;
