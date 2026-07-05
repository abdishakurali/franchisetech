-- ============================================================
-- 20260704140000_vendor_logo_background.sql
-- Some vendor logos are white-on-transparent, designed for a dark
-- navbar, and render invisibly on the directory's white card
-- background (found in practice: Conti Grup, Side Grup). Rather than
-- special-case those vendors in code, add an explicit field so any
-- future vendor's card can request a dark container to render its
-- logo against.
-- Additive: single check-constrained column, default 'light' (today's
-- existing behavior for every already-published vendor), backwards
-- compatible with every existing row and query.
-- ============================================================

alter table vendors
  add column if not exists logo_background text not null default 'light'
    check (logo_background in ('light', 'dark'));

comment on column vendors.logo_background is
  'Card background the logo should render against. Most logos are '
  'full-color and work on the default white/light card background. '
  'Set to ''dark'' only when the logo itself is white-on-transparent '
  'or otherwise designed for a dark background and would render '
  'invisibly on light — verified by actually loading the image, not '
  'assumed from file type.';
