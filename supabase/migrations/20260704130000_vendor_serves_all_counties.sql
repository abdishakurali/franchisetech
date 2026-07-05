-- ============================================================
-- 20260704130000_vendor_serves_all_counties.sql
-- Adds a self-reported "serves all counties" flag to vendors.
-- Additive: single nullable-safe boolean column, default false,
-- backwards-compatible with every existing row and query.
-- ============================================================

alter table vendors
  add column if not exists serves_all_counties boolean not null default false;

comment on column vendors.serves_all_counties is
  'Self-reported "delivers nationally" claim from the vendor''s own marketing '
  'copy — NOT the same as a verified per-county listing in vendor_regions. '
  'Kept as a distinct, clearly-labeled flag on purpose: an unverified '
  '"we deliver everywhere" claim should not carry the same weight in the '
  'schema as a county we have actually confirmed. When true, the vendor '
  'is treated as matching every county filter in getPublicVendors() and '
  'counts toward every county''s qualifying total in '
  'getQualifyingCategoryCounties() (lib/vendors/queries.ts), independent '
  'of any rows it may or may not also have in vendor_regions.';
