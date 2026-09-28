alter table organisations
  add column if not exists admin_notes text null;

comment on column organisations.admin_notes is
  'Internal notes set via /admin dashboard. Never render to the organisation''s own users.';
