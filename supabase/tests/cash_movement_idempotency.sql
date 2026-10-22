begin;
select plan(5);

select has_function('public', 'post_cash_movement', array['uuid', 'uuid', 'jsonb'], 'atomic cash movement RPC exists');
select throws_ok(
  $$ select public.post_cash_movement(gen_random_uuid(), null, '{"movement_type":"cash_in","amount":10,"reason":"x","session_id":"00000000-0000-0000-0000-000000000001"}'::jsonb) $$,
  'CASH_MOVEMENT_IDEMPOTENCY_REQUIRED', 'idempotency key is mandatory'
);
select throws_ok(
  $$ select public.post_cash_movement(gen_random_uuid(), null, '{"idempotency_key":"k","movement_type":"sale","amount":10,"reason":"x","session_id":"00000000-0000-0000-0000-000000000001"}'::jsonb) $$,
  'CASH_MOVEMENT_TYPE_INVALID', 'only cash_in/cash_out are accepted'
);
select throws_ok(
  $$ select public.post_cash_movement(gen_random_uuid(), null, '{"idempotency_key":"k","movement_type":"cash_out","amount":0,"reason":"x","session_id":"00000000-0000-0000-0000-000000000001"}'::jsonb) $$,
  'CASH_MOVEMENT_AMOUNT_INVALID', 'zero amount is rejected'
);
select throws_ok(
  $$ select public.post_cash_movement(gen_random_uuid(), null, '{"idempotency_key":"k","movement_type":"cash_in","amount":5,"reason":"x","session_id":"00000000-0000-0000-0000-000000000001"}'::jsonb) $$,
  'OPEN_SESSION_NOT_FOUND', 'unknown or closed session is rejected'
);

select * from finish();
rollback;
