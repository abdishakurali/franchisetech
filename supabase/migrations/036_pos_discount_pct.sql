-- P1.7: cart-wide discount % stored for reporting (amounts already in discount_total / discount_amount)

alter table pos_transactions
  add column if not exists discount_pct numeric default 0;

alter table pos_transaction_items
  add column if not exists discount_pct numeric default 0;

comment on column pos_transactions.discount_pct is 'Cart-wide discount percentage applied at sale time (0–100).';
comment on column pos_transaction_items.discount_pct is 'Cart-wide discount % applied to this line (same rate for all lines when set).';
