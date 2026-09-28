-- ============================================================
-- 014_finish_full_ops_schema
-- Safe, idempotent schema completion for KitchenOps
--
-- Recovered verbatim from schema_migrations.statements during the full
-- migration provenance audit (2026-09-15) — this file was applied to
-- production but never committed. Most of the tables it creates
-- (suppliers, stock_movements, units_of_measure, pos_audit_events,
-- pos_daily_close) are ALSO created by 013_full_ops.sql, already in this
-- repo — both applied historically, and the IF NOT EXISTS guards throughout
-- make the overlap harmless.
--
-- pos_sessions and pos_cash_movements are the reason this file matters:
-- they are the till-session lifecycle tables — read and written constantly
-- by app/actions/kitchenops.ts, app/actions/onboarding.ts,
-- components/app/OpenTillForm.tsx, components/app/PosSessionPanel.tsx, and
-- the registru-de-casa reports — and until this commit, their schema
-- existed nowhere in git. A fresh database built from this repo's
-- migrations alone could not have opened a till.
-- ============================================================

-- ---- products: add missing columns ----
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode text NULL;

-- ---- purchases: add missing columns (keep existing supplier text + purchased_at) ----
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS invoice_number text NULL;

-- ---- purchase_items: add new columns alongside existing item_name ----
ALTER TABLE purchase_items ADD COLUMN IF NOT EXISTS product_id uuid NULL;
ALTER TABLE purchase_items ADD COLUMN IF NOT EXISTS product_name text NULL;
ALTER TABLE purchase_items ADD COLUMN IF NOT EXISTS unit_of_measure text NULL;

-- ---- pos_transactions: add missing column ----
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS subtotal_gross_before_discount numeric DEFAULT 0;

-- ============================================================
-- CREATE MISSING TABLES
-- ============================================================

-- units_of_measure
CREATE TABLE IF NOT EXISTS units_of_measure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NULL,
  name text NOT NULL,
  abbreviation text NULL,
  type text NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  name text NOT NULL,
  contact_name text NULL,
  phone text NULL,
  email text NULL,
  address text NULL,
  notes text NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  product_id uuid NULL,
  movement_type text NOT NULL,
  quantity_change numeric NOT NULL,
  unit_of_measure text NULL,
  reason text NULL,
  reference_type text NULL,
  reference_id uuid NULL,
  performed_by uuid NULL,
  performed_at timestamptz DEFAULT now()
);

-- pos_sessions
CREATE TABLE IF NOT EXISTS pos_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  opened_by uuid NULL,
  opened_at timestamptz DEFAULT now(),
  opening_cash numeric NOT NULL DEFAULT 0,
  closed_by uuid NULL,
  closed_at timestamptz NULL,
  counted_cash numeric NULL,
  expected_cash numeric NULL,
  cash_difference numeric NULL,
  notes text NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- pos_cash_movements
CREATE TABLE IF NOT EXISTS pos_cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  session_id uuid NULL,
  movement_type text NOT NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  performed_by uuid NULL,
  performed_at timestamptz DEFAULT now()
);

-- pos_audit_events
CREATE TABLE IF NOT EXISTS pos_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  transaction_id uuid NULL,
  event_type text NOT NULL,
  reason text NULL,
  before_data jsonb NULL,
  after_data jsonb NULL,
  performed_by uuid NULL,
  performed_at timestamptz DEFAULT now()
);

-- pos_daily_close
CREATE TABLE IF NOT EXISTS pos_daily_close (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  session_id uuid NULL,
  report_date date NOT NULL,
  expected_cash numeric DEFAULT 0,
  counted_cash numeric DEFAULT 0,
  cash_difference numeric DEFAULT 0,
  notes text NULL,
  closed_by uuid NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ENABLE RLS on new tables
-- ============================================================

ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_daily_close ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (only if they don't already exist)
-- ============================================================

DO $$
BEGIN

  -- units_of_measure: global readable, org members can manage
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'units_of_measure' AND policyname = 'units_select') THEN
    CREATE POLICY units_select ON units_of_measure FOR SELECT USING (
      organisation_id IS NULL OR
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'units_of_measure' AND policyname = 'units_insert') THEN
    CREATE POLICY units_insert ON units_of_measure FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'units_of_measure' AND policyname = 'units_update') THEN
    CREATE POLICY units_update ON units_of_measure FOR UPDATE USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- suppliers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'suppliers_select') THEN
    CREATE POLICY suppliers_select ON suppliers FOR SELECT USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'suppliers_insert') THEN
    CREATE POLICY suppliers_insert ON suppliers FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'suppliers_update') THEN
    CREATE POLICY suppliers_update ON suppliers FOR UPDATE USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'suppliers_delete') THEN
    CREATE POLICY suppliers_delete ON suppliers FOR DELETE USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- stock_movements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'stock_movements_select') THEN
    CREATE POLICY stock_movements_select ON stock_movements FOR SELECT USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'stock_movements_insert') THEN
    CREATE POLICY stock_movements_insert ON stock_movements FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- pos_sessions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_sessions' AND policyname = 'pos_sessions_select') THEN
    CREATE POLICY pos_sessions_select ON pos_sessions FOR SELECT USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_sessions' AND policyname = 'pos_sessions_insert') THEN
    CREATE POLICY pos_sessions_insert ON pos_sessions FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_sessions' AND policyname = 'pos_sessions_update') THEN
    CREATE POLICY pos_sessions_update ON pos_sessions FOR UPDATE USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- pos_cash_movements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_cash_movements' AND policyname = 'pos_cash_movements_select') THEN
    CREATE POLICY pos_cash_movements_select ON pos_cash_movements FOR SELECT USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_cash_movements' AND policyname = 'pos_cash_movements_insert') THEN
    CREATE POLICY pos_cash_movements_insert ON pos_cash_movements FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- pos_audit_events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_audit_events' AND policyname = 'pos_audit_events_select') THEN
    CREATE POLICY pos_audit_events_select ON pos_audit_events FOR SELECT USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_audit_events' AND policyname = 'pos_audit_events_insert') THEN
    CREATE POLICY pos_audit_events_insert ON pos_audit_events FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- pos_daily_close
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_daily_close' AND policyname = 'pos_daily_close_select') THEN
    CREATE POLICY pos_daily_close_select ON pos_daily_close FOR SELECT USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_daily_close' AND policyname = 'pos_daily_close_insert') THEN
    CREATE POLICY pos_daily_close_insert ON pos_daily_close FOR INSERT WITH CHECK (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pos_daily_close' AND policyname = 'pos_daily_close_update') THEN
    CREATE POLICY pos_daily_close_update ON pos_daily_close FOR UPDATE USING (
      organisation_id IN (
        SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
      )
    );
  END IF;

END $$;

-- ============================================================
-- SAFE INDEXES (only on confirmed-existing columns)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON suppliers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_org ON stock_movements(organisation_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_org ON pos_sessions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pos_cash_movements_session ON pos_cash_movements(session_id);
CREATE INDEX IF NOT EXISTS idx_pos_audit_events_org ON pos_audit_events(organisation_id);
CREATE INDEX IF NOT EXISTS idx_pos_daily_close_org ON pos_daily_close(organisation_id);
CREATE INDEX IF NOT EXISTS idx_pos_daily_close_session ON pos_daily_close(session_id);
