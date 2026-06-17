-- Migration 030: Kitchen Stations
-- Adds kitchen_station to products and kitchen_order_items
-- Enables routing POS items to specific kitchen monitors (Bar, Mains, Starters, etc.)

alter table public.products
  add column if not exists kitchen_station text;

alter table public.kitchen_order_items
  add column if not exists kitchen_station text;

create index if not exists idx_products_kitchen_station
  on public.products(organisation_id, kitchen_station)
  where kitchen_station is not null;

create index if not exists idx_kitchen_order_items_station
  on public.kitchen_order_items(kitchen_order_id, kitchen_station);

comment on column public.products.kitchen_station is
  'Optional station where this product is prepared (e.g. bar, starters, mains, desserts). NULL = appears on all KDS views.';

comment on column public.kitchen_order_items.kitchen_station is
  'Copied from the product at order creation time. NULL = appears on all KDS views.';
