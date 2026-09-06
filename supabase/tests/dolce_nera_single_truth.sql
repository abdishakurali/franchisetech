begin;
select plan(12);

select has_table('public', 'payment_events', 'payment events exist');
select has_table('public', 'pos_returns', 'returns exist');
select has_table('public', 'pos_return_items', 'line returns exist');
select has_table('public', 'repair_batches', 'repair batches exist');
select has_table('public', 'repair_actions', 'repair actions exist');
select has_column('public', 'products', 'vat_status', 'VAT status is explicit');
select has_column('public', 'recipes', 'is_active', 'recipe lifecycle exists');
select has_column('public', 'pos_transaction_items', 'recipe_id', 'sale snapshots recipe');
select has_function('public', 'post_pos_document', array['uuid', 'uuid', 'jsonb'], 'atomic POS RPC exists');
select has_function('public', 'post_pos_return', array['uuid', 'uuid', 'jsonb'], 'atomic return RPC exists');
select has_view('public', 'canonical_sales_lines', 'canonical sales view exists');
select has_view('public', 'canonical_stock_balances', 'canonical stock view exists');

select * from finish();
rollback;
