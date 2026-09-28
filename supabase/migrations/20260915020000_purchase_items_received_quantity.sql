-- NIR (Notă de Intrare-Recepție) needs to record a received quantity that
-- can differ from the invoiced quantity — that difference is the entire
-- point of "și constatare de diferențe" ("and finding of differences") in
-- the document's own name. purchase_items previously had only one quantity
-- column, which cannot represent that distinction at all.
--
-- Nullable, no backfill: null means "not separately recorded", which is the
-- honest state of every existing row. It is not the same claim as "received
-- equals invoiced" — that would assert something no one actually checked at
-- the time. The NIR document and reception form read
-- coalesce(received_quantity, quantity) so existing data renders unchanged
-- until a real discrepancy is recorded.
--
-- Does NOT change post_nir_purchase (the stock-movement writer): stock
-- increases and the weighted-average cost recalculation there still sum
-- purchase_items.quantity (invoiced), not received_quantity. That's a real,
-- separate gap — flagged, not fixed here, since the stock-movement writer
-- is explicitly out of scope without its own authorization.

alter table public.purchase_items
  add column if not exists received_quantity numeric;

comment on column public.purchase_items.received_quantity is
  'Quantity actually received at reception, when recorded separately from the invoiced quantity (purchase_items.quantity). Null means not separately recorded, not "equal to invoiced". NIR renders coalesce(received_quantity, quantity).';
