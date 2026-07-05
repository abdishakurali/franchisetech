-- Table tab bill request audit (ANAF notă de plată workflow)
alter table table_tabs
  add column if not exists bill_requested_at timestamptz,
  add column if not exists bill_requested_by uuid references profiles(id) on delete set null;

create index if not exists table_tabs_bill_requested_idx
  on table_tabs (organisation_id, bill_requested_at)
  where status = 'bill_requested';
