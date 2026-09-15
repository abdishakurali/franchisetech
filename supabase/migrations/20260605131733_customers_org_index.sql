-- Recovered during the full migration provenance audit (2026-09-15).
-- The original 20260605131733_019_customers_table migration's CREATE TABLE
-- for customers is superseded by 20260713090100_customers_and_customer_id_documentation.sql
-- (already in this repo, and the version production actually runs). Only
-- this index — never carried forward by the later migration — was missing.
CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(organisation_id);
