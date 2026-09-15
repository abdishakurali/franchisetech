-- Atomic sale stock usage (qty + ledger), void restore, NIR duplicate-line aggregation.

CREATE OR REPLACE FUNCTION public.increment_product_stock(
  p_org_id uuid,
  p_product_id uuid,
  p_qty numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  new_qty numeric;
BEGIN
  IF p_qty IS NULL OR p_qty = 0 THEN
    RETURN NULL;
  END IF;

  UPDATE public.products
  SET current_stock_qty = COALESCE(current_stock_qty, 0) + p_qty
  WHERE id = p_product_id
    AND organisation_id = p_org_id
  RETURNING current_stock_qty INTO new_qty;

  RETURN new_qty;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_product_stock(uuid, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(uuid, uuid, numeric) TO service_role;

CREATE OR REPLACE FUNCTION public.record_sale_stock_usage(
  p_org_id uuid,
  p_product_id uuid,
  p_qty numeric,
  p_unit_of_measure text,
  p_transaction_id uuid,
  p_actor_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.stock_movements sm
    WHERE sm.organisation_id = p_org_id
      AND sm.product_id = p_product_id
      AND sm.reference_type = 'sale'
      AND sm.reference_id = p_transaction_id
      AND sm.movement_type = 'sale_used'
  ) THEN
    RETURN;
  END IF;

  UPDATE public.products
  SET current_stock_qty = COALESCE(current_stock_qty, 0) - p_qty
  WHERE id = p_product_id
    AND organisation_id = p_org_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;

  INSERT INTO public.stock_movements (
    organisation_id,
    product_id,
    movement_type,
    quantity_change,
    unit_of_measure,
    reference_type,
    reference_id,
    performed_by
  ) VALUES (
    p_org_id,
    p_product_id,
    'sale_used',
    -p_qty,
    COALESCE(NULLIF(TRIM(p_unit_of_measure), ''), 'buc'),
    'sale',
    p_transaction_id,
    p_actor_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_sale_stock_usage(uuid, uuid, numeric, text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_sale_stock_usage(uuid, uuid, numeric, text, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.restore_void_sale_stock(
  p_org_id uuid,
  p_transaction_id uuid,
  p_actor_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  mov record;
  restore_qty numeric;
  restored int := 0;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.stock_movements sm
    WHERE sm.organisation_id = p_org_id
      AND sm.reference_type = 'void'
      AND sm.reference_id = p_transaction_id
      AND sm.movement_type = 'return'
  ) THEN
    RETURN 0;
  END IF;

  FOR mov IN
    SELECT id, product_id, quantity_change, unit_of_measure, unit_cost
    FROM public.stock_movements
    WHERE organisation_id = p_org_id
      AND reference_type = 'sale'
      AND reference_id = p_transaction_id
      AND movement_type = 'sale_used'
      AND product_id IS NOT NULL
      AND quantity_change < 0
  LOOP
    restore_qty := ABS(mov.quantity_change);

    INSERT INTO public.stock_movements (
      organisation_id,
      product_id,
      movement_type,
      quantity_change,
      unit_of_measure,
      unit_cost,
      reference_type,
      reference_id,
      reason,
      performed_by
    ) VALUES (
      p_org_id,
      mov.product_id,
      'return',
      restore_qty,
      COALESCE(mov.unit_of_measure, 'buc'),
      mov.unit_cost,
      'void',
      p_transaction_id,
      LEFT(COALESCE(p_reason, 'Void restore'), 200),
      p_actor_id
    );

    UPDATE public.products
    SET current_stock_qty = COALESCE(current_stock_qty, 0) + restore_qty
    WHERE id = mov.product_id
      AND organisation_id = p_org_id;

    restored := restored + 1;
  END LOOP;

  RETURN restored;
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_void_sale_stock(uuid, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_void_sale_stock(uuid, uuid, uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.post_nir_purchase(
  p_purchase_id uuid,
  p_org_id      uuid,
  p_actor_id    uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase      public.purchases%ROWTYPE;
  v_year          int;
  v_seq           int;
  v_nir_number    text;
  v_posted_at     timestamptz := now();
  v_item          record;
  v_item_count    int := 0;
  v_old_qty       numeric;
  v_old_cost      numeric;
  v_new_cmp       numeric;
BEGIN
  SELECT * INTO v_purchase FROM public.purchases WHERE id = p_purchase_id AND organisation_id = p_org_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PURCHASE_NOT_FOUND'; END IF;
  IF v_purchase.status = 'cancelled' THEN RAISE EXCEPTION 'PURCHASE_CANCELLED'; END IF;
  IF v_purchase.status IN ('posted', 'received') OR v_purchase.posted_at IS NOT NULL OR v_purchase.nir_number IS NOT NULL THEN RAISE EXCEPTION 'ALREADY_POSTED'; END IF;
  IF v_purchase.status <> 'draft' THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;

  SELECT COUNT(*)::int INTO v_item_count FROM public.purchase_items pi WHERE pi.purchase_id = p_purchase_id AND pi.organisation_id = p_org_id AND pi.product_id IS NOT NULL AND pi.quantity > 0;
  IF v_item_count = 0 THEN RAISE EXCEPTION 'NO_ITEMS'; END IF;

  v_year := EXTRACT(YEAR FROM COALESCE(v_purchase.nir_date, v_purchase.purchase_date, CURRENT_DATE))::int;
  v_seq := public.next_nir_number(p_org_id, v_year);
  v_nir_number := 'NIR-' || v_year::text || '-' || LPAD(v_seq::text, 6, '0');

  UPDATE public.purchases SET status = 'posted', nir_number = v_nir_number, nir_date = COALESCE(nir_date, purchase_date, CURRENT_DATE), posted_at = v_posted_at, posted_by = p_actor_id, received_by_user_id = COALESCE(received_by_user_id, p_actor_id) WHERE id = p_purchase_id AND organisation_id = p_org_id;

  FOR v_item IN
    SELECT pi.product_id, SUM(pi.quantity)::numeric AS quantity, (SUM(pi.quantity * pi.unit_cost) / NULLIF(SUM(pi.quantity), 0))::numeric AS unit_cost, MAX(pi.unit_of_measure) AS unit_of_measure
    FROM public.purchase_items pi
    WHERE pi.purchase_id = p_purchase_id AND pi.organisation_id = p_org_id AND pi.product_id IS NOT NULL AND pi.quantity > 0
    GROUP BY pi.product_id
  LOOP
    IF EXISTS (SELECT 1 FROM public.stock_movements sm WHERE sm.reference_id = p_purchase_id AND sm.reference_type = 'purchase' AND sm.movement_type = 'purchase_received' AND sm.product_id = v_item.product_id) THEN CONTINUE; END IF;

    SELECT COALESCE(current_stock_qty, 0), COALESCE(cost_price, v_item.unit_cost) INTO v_old_qty, v_old_cost FROM public.products WHERE id = v_item.product_id AND organisation_id = p_org_id FOR UPDATE;

    IF v_old_qty <= 0 THEN v_new_cmp := v_item.unit_cost;
    ELSE v_new_cmp := (v_old_qty * v_old_cost + v_item.quantity * v_item.unit_cost) / (v_old_qty + v_item.quantity);
    END IF;

    UPDATE public.products SET current_stock_qty = v_old_qty + v_item.quantity, cost_price = v_new_cmp WHERE id = v_item.product_id AND organisation_id = p_org_id;

    INSERT INTO public.stock_movements (organisation_id, product_id, movement_type, quantity_change, unit_cost, unit_of_measure, reference_id, reference_type, performed_by, performed_at)
    VALUES (p_org_id, v_item.product_id, 'purchase_received', v_item.quantity, v_item.unit_cost, COALESCE(v_item.unit_of_measure, 'each'), p_purchase_id, 'purchase', p_actor_id, v_posted_at);
  END LOOP;

  RETURN jsonb_build_object('purchase_id', p_purchase_id, 'nir_number', v_nir_number, 'posted_at', v_posted_at);
END;
$$;
