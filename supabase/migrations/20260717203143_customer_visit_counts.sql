CREATE OR REPLACE FUNCTION public.customer_visit_counts(p_org_id uuid)
RETURNS TABLE(customer_id uuid, visit_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT customer_id, COUNT(*)::bigint AS visit_count
  FROM pos_transactions
  WHERE organisation_id = p_org_id
    AND customer_id IS NOT NULL
    AND status IS DISTINCT FROM 'voided'
  GROUP BY customer_id;
$$;

GRANT EXECUTE ON FUNCTION public.customer_visit_counts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_visit_counts(uuid) TO service_role;
