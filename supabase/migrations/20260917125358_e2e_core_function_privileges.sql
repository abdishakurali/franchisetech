revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.create_organisation_with_owner(text, text, text, text) from public, anon;
grant execute on function public.create_organisation_with_owner(text, text, text, text) to authenticated;
revoke all on function public.is_org_member(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;
revoke all on function public.is_org_owner_or_manager(uuid) from public, anon;
grant execute on function public.is_org_owner_or_manager(uuid) to authenticated;
