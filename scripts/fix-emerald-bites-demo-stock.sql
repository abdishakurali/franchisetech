-- One-time demo data fix for Emerald Bites Café only.
-- Org: b362146d-57e9-4ced-9f0d-660b4c3ffe96
-- Run manually via Supabase SQL editor or MCP execute_sql (service role).

BEGIN;

-- 1. Remove stock movements pointing at deleted products
DELETE FROM stock_movements sm
WHERE sm.organisation_id = 'b362146d-57e9-4ced-9f0d-660b4c3ffe96'
  AND sm.product_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = sm.product_id AND p.organisation_id = sm.organisation_id
  );

-- 2. Ensure cost prices on demo ingredients
UPDATE products
SET cost_price = 2.10
WHERE id = '7d8c2b60-eaa3-4fb7-acb8-8196b5ad2d58'
  AND organisation_id = 'b362146d-57e9-4ced-9f0d-660b4c3ffe96';

UPDATE products
SET cost_price = 5.50
WHERE id = 'e4f673ed-f900-4d8f-bddb-c38271d0fb4c'
  AND organisation_id = 'b362146d-57e9-4ced-9f0d-660b4c3ffe96';

-- 3. Draft NIR to cover historical consumption (Apples 50kg, Falafel 30kg)
DO $$
DECLARE
  v_purchase_id uuid := gen_random_uuid();
  v_org_id uuid := 'b362146d-57e9-4ced-9f0d-660b4c3ffe96';
  v_actor_id uuid := 'b1c29782-28aa-4a12-b916-d9b18b897ae5';
  v_apples_qty numeric := 50;
  v_falafel_qty numeric := 30;
  v_apples_cost numeric := 2.10;
  v_falafel_cost numeric := 5.50;
  v_subtotal numeric;
BEGIN
  v_subtotal := (v_apples_qty * v_apples_cost) + (v_falafel_qty * v_falafel_cost);

  INSERT INTO purchases (
    id,
    organisation_id,
    supplier,
    purchased_at,
    purchase_date,
    nir_date,
    status,
    invoice_number,
    subtotal_amount,
    tax_total,
    total_amount,
    total_cost,
    created_by,
    notes
  ) VALUES (
    v_purchase_id,
    v_org_id,
    'Demo Supplier',
    now(),
    current_date,
    current_date,
    'draft',
    'DEMO-NIR-2026-06',
    v_subtotal,
    0,
    v_subtotal,
    v_subtotal,
    v_actor_id,
    'Demo opening stock — auto-generated for report balance'
  );

  INSERT INTO purchase_items (
    organisation_id,
    purchase_id,
    product_id,
    product_name,
    item_name,
    quantity,
    unit_cost,
    total_cost,
    unit_of_measure,
    tax_rate,
    tax_amount
  ) VALUES
    (v_org_id, v_purchase_id, '7d8c2b60-eaa3-4fb7-acb8-8196b5ad2d58', 'Apples', 'Apples', v_apples_qty, v_apples_cost, v_apples_qty * v_apples_cost, 'kg', 9, 0),
    (v_org_id, v_purchase_id, 'e4f673ed-f900-4d8f-bddb-c38271d0fb4c', 'Falafel', 'Falafel', v_falafel_qty, v_falafel_cost, v_falafel_qty * v_falafel_cost, 'kg', 9, 0);

  PERFORM public.post_nir_purchase(v_purchase_id, v_org_id, v_actor_id);
END $$;

COMMIT;
