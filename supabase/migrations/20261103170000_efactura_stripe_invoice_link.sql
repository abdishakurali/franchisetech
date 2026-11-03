-- Our own subscription billing issues one e-Factura per paid Stripe invoice.
-- Additive only: a nullable column and a partial unique index. The index is
-- the idempotency guarantee — a replayed or concurrent webhook for the same
-- Stripe invoice can never create a second invoice.

alter table public.efactura_invoices
  add column if not exists stripe_invoice_id text;

create unique index if not exists efactura_invoices_stripe_invoice_uidx
  on public.efactura_invoices (organisation_id, stripe_invoice_id)
  where stripe_invoice_id is not null;
