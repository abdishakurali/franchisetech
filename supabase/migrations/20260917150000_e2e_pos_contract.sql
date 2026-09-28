-- Make the isolated core schema satisfy the POS catalogue queries.
alter table public.products
  add column if not exists pos_category_id uuid references public.product_categories(id) on delete set null;

update public.products
set pos_category_id = category_id
where pos_category_id is null;

alter table public.payment_methods
  add column if not exists created_at timestamptz not null default now();
