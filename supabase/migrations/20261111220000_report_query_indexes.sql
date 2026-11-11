-- Indexes for the paged report reads (keyset on performed_at/id, per-product
-- ledger sums, purchases by date). Applied to production on 2026-11-11 with
-- CREATE INDEX CONCURRENTLY via the SQL connector; this file records them so
-- the repo matches the database. IF NOT EXISTS makes it a no-op where they
-- already exist. Indexes only: no data or behaviour change.
--
-- Not added: pos_transactions (organisation_id, sold_at, id) -- the existing
-- idx_pos_transactions_org_sold_at already serves that scan.

create index if not exists idx_stock_movements_org_product_performed
  on public.stock_movements (organisation_id, product_id, performed_at);

create index if not exists idx_stock_movements_org_performed_id
  on public.stock_movements (organisation_id, performed_at, id);

create index if not exists idx_stock_movement_reconciliations_org_performed
  on public.stock_movement_reconciliations (organisation_id, performed_at);

create index if not exists idx_pos_cash_movements_org_performed_id
  on public.pos_cash_movements (organisation_id, performed_at, id);

create index if not exists idx_pos_sessions_org_closed
  on public.pos_sessions (organisation_id, closed_at);

create index if not exists idx_purchases_org_purchase_date_id
  on public.purchases (organisation_id, purchase_date, id);

create index if not exists idx_purchase_items_org_product
  on public.purchase_items (organisation_id, product_id);

create index if not exists idx_fiscal_receipt_attempts_org_status_mock
  on public.fiscal_receipt_attempts (organisation_id, status, mock_mode);
