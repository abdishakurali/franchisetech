begin;
select plan(6);

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

select * from finish();
rollback;
