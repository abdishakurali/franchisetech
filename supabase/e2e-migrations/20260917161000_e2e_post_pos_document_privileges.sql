revoke execute on function public.post_pos_document(uuid, uuid, jsonb) from anon, authenticated;
grant execute on function public.post_pos_document(uuid, uuid, jsonb) to service_role;
