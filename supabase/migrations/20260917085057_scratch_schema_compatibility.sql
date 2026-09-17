-- Repair a restored/test database whose migration history includes the POS
-- migrations but whose physical core tables are absent. Every block is a no-op
-- when the matching production object exists.

DO $repair$
BEGIN
  IF to_regclass('public.stock_movements') IS NULL THEN
    CREATE TABLE public.stock_movements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id uuid NOT NULL,
      product_id uuid,
      movement_type text NOT NULL,
      quantity_change numeric NOT NULL,
      unit_of_measure text,
      reason text,
      reference_type text,
      reference_id uuid,
      performed_by uuid,
      performed_at timestamptz DEFAULT now(),
      unit_cost numeric
    );
    ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY stock_movements_select ON public.stock_movements FOR SELECT
      TO authenticated USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE POLICY stock_movements_insert ON public.stock_movements FOR INSERT
      TO authenticated WITH CHECK (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE INDEX idx_stock_movements_org ON public.stock_movements (organisation_id, performed_at DESC);
    CREATE INDEX idx_stock_movements_product ON public.stock_movements (product_id);
  END IF;

  IF to_regclass('public.pos_sessions') IS NULL THEN
    CREATE TABLE public.pos_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id uuid NOT NULL,
      opened_by uuid,
      opened_at timestamptz DEFAULT now(),
      opening_cash numeric NOT NULL DEFAULT 0,
      closed_by uuid,
      closed_at timestamptz,
      counted_cash numeric,
      expected_cash numeric,
      cash_difference numeric,
      notes text,
      status text NOT NULL DEFAULT 'open',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      fiscal_z_report_done boolean DEFAULT false,
      fiscal_z_report_at timestamptz,
      fiscal_z_report_log_id uuid,
      fiscal_opening_balance_done boolean DEFAULT false,
      fiscal_opening_balance_at timestamptz,
      site_id uuid,
      cash_breakdown jsonb
    );
    ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY pos_sessions_select_org ON public.pos_sessions FOR SELECT
      TO authenticated USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE POLICY pos_sessions_insert_org ON public.pos_sessions FOR INSERT
      TO authenticated WITH CHECK (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE POLICY pos_sessions_update_org ON public.pos_sessions FOR UPDATE
      TO authenticated USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())))
      WITH CHECK (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE INDEX idx_pos_sessions_org_status ON public.pos_sessions (organisation_id, status);
    CREATE UNIQUE INDEX pos_sessions_one_open_per_site_uidx ON public.pos_sessions (organisation_id, site_id) WHERE status = 'open' AND site_id IS NOT NULL;
  END IF;

  IF to_regclass('public.pos_cash_movements') IS NULL THEN
    CREATE TABLE public.pos_cash_movements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id uuid NOT NULL,
      session_id uuid,
      movement_type text NOT NULL,
      amount numeric NOT NULL,
      reason text NOT NULL,
      performed_by uuid,
      performed_at timestamptz DEFAULT now(),
      site_id uuid,
      idempotency_key text
    );
    ALTER TABLE public.pos_cash_movements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY pos_cash_movements_select_org ON public.pos_cash_movements FOR SELECT
      TO authenticated USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE POLICY pos_cash_movements_insert_org ON public.pos_cash_movements FOR INSERT
      TO authenticated WITH CHECK (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
  END IF;

  IF to_regclass('public.pos_daily_close') IS NULL THEN
    CREATE TABLE public.pos_daily_close (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id uuid NOT NULL,
      session_id uuid,
      report_date date NOT NULL,
      expected_cash numeric DEFAULT 0,
      counted_cash numeric DEFAULT 0,
      cash_difference numeric DEFAULT 0,
      notes text,
      closed_by uuid,
      created_at timestamptz DEFAULT now(),
      cash_breakdown jsonb
    );
    ALTER TABLE public.pos_daily_close ENABLE ROW LEVEL SECURITY;
    CREATE POLICY pos_daily_close_select_org ON public.pos_daily_close FOR SELECT
      TO authenticated USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE POLICY pos_daily_close_insert_org ON public.pos_daily_close FOR INSERT
      TO authenticated WITH CHECK (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
    CREATE POLICY pos_daily_close_update_org ON public.pos_daily_close FOR UPDATE
      TO authenticated USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())))
      WITH CHECK (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = (SELECT auth.uid())));
  END IF;
END
$repair$;

-- The restore also lost the onboarding RPC despite recording its migration.
-- This is the current production definition, created only when absent.
DO $repair$
BEGIN
  IF to_regprocedure('public.create_organisation_with_owner(text,text,text,text)') IS NULL THEN
    EXECUTE $fn$
      CREATE FUNCTION public.create_organisation_with_owner(p_org_name text, p_business_type text DEFAULT NULL, p_asset_name text DEFAULT NULL, p_asset_type text DEFAULT 'fridge')
      RETURNS TABLE(organisation_id uuid, site_id uuid, asset_id uuid)
      LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
      AS $body$
      DECLARE v_user_id uuid := auth.uid(); v_user_email text; v_full_name text; v_org_id uuid; v_site_id uuid;
      BEGIN
        IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
        PERFORM pg_advisory_xact_lock(hashtext(v_user_id::text));
        SELECT organisation_id INTO v_org_id FROM public.organisation_members WHERE user_id = v_user_id AND (status IS NULL OR status = 'active') ORDER BY created_at ASC LIMIT 1;
        IF v_org_id IS NOT NULL THEN SELECT id INTO v_site_id FROM public.sites WHERE organisation_id = v_org_id ORDER BY created_at ASC LIMIT 1; RETURN QUERY SELECT v_org_id, v_site_id, NULL::uuid; RETURN; END IF;
        IF p_org_name IS NULL OR length(trim(p_org_name)) < 1 THEN RAISE EXCEPTION 'Business name is required'; END IF;
        v_user_email := auth.jwt() ->> 'email'; v_full_name := coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() ->> 'email');
        INSERT INTO public.profiles (id, email, full_name) VALUES (v_user_id, v_user_email, v_full_name) ON CONFLICT (id) DO UPDATE SET email = coalesce(public.profiles.email, excluded.email), full_name = coalesce(public.profiles.full_name, excluded.full_name);
        INSERT INTO public.organisations (name, business_type, country) VALUES (trim(p_org_name), nullif(trim(coalesce(p_business_type, '')), ''), 'Ireland') RETURNING id INTO v_org_id;
        INSERT INTO public.organisation_members (organisation_id, user_id, role) VALUES (v_org_id, v_user_id, 'owner');
        INSERT INTO public.sites (organisation_id, name) VALUES (v_org_id, 'Main Kitchen') RETURNING id INTO v_site_id;
        RETURN QUERY SELECT v_org_id, v_site_id, NULL::uuid;
      END;
      $body$
    $fn$;
  END IF;
END
$repair$;

REVOKE ALL ON FUNCTION public.create_organisation_with_owner(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organisation_with_owner(text, text, text, text) TO authenticated;
