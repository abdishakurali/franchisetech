CREATE OR REPLACE FUNCTION public.decrement_product_stock(
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
  SET current_stock_qty = COALESCE(current_stock_qty, 0) - p_qty
  WHERE id = p_product_id
    AND organisation_id = p_org_id
  RETURNING current_stock_qty INTO new_qty;

  RETURN new_qty;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_product_stock(uuid, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(uuid, uuid, numeric) TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS pos_sessions_one_open_per_site_uidx
  ON public.pos_sessions (organisation_id, site_id)
  WHERE status = 'open' AND site_id IS NOT NULL;
