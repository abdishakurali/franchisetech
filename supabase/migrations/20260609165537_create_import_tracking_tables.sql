-- Import run log: one row per import execution
CREATE TABLE IF NOT EXISTS public.import_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
  source_system   text NOT NULL,          -- e.g. 'odoo17'
  source_database text NOT NULL,          -- e.g. 'dolcenera.franchisetech.ro'
  status          text NOT NULL DEFAULT 'running',  -- running | completed | failed
  dry_run         boolean NOT NULL DEFAULT true,
  started_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz,
  created_by      text,
  summary         jsonb,
  error_message   text
);

-- Per-record import log: idempotency map from Odoo → FranchiseTech
CREATE TABLE IF NOT EXISTS public.import_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_run_id   uuid REFERENCES public.import_runs(id) ON DELETE CASCADE,
  business_id     uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
  source_system   text NOT NULL,          -- 'odoo17'
  source_model    text NOT NULL,          -- 'product.template', 'res.partner', 'pos.order', ...
  source_id       text NOT NULL,          -- Odoo integer ID as text
  target_table    text NOT NULL,          -- 'products', 'customers', 'pos_transactions', ...
  target_id       uuid,                   -- FranchiseTech UUID
  status          text NOT NULL DEFAULT 'created',  -- created | updated | skipped | failed
  action          text,                   -- created | updated | skipped | failed
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Enforce idempotency: same source record maps to exactly one target per business
  CONSTRAINT import_records_unique_source
    UNIQUE (business_id, source_system, source_model, source_id)
);

-- Indexes for fast lookups during re-runs
CREATE INDEX IF NOT EXISTS import_records_business_model_idx
  ON public.import_records (business_id, source_model);

CREATE INDEX IF NOT EXISTS import_records_target_idx
  ON public.import_records (target_table, target_id);

-- RLS: service role only (import script uses service role key)
ALTER TABLE public.import_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_import_runs"
  ON public.import_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_import_records"
  ON public.import_records FOR ALL TO service_role USING (true) WITH CHECK (true);
