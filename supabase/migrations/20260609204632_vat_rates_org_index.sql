-- Recovered during the full migration provenance audit (2026-09-15).
-- The original 20260609204632_create_vat_rates_table migration's CREATE
-- TABLE for vat_rates is superseded by 038_vat_rates.sql (already in this
-- repo, and the version production actually runs). Only this index — never
-- carried forward by the later migration — was missing.
CREATE INDEX IF NOT EXISTS vat_rates_org_idx ON vat_rates(organisation_id);
