-- Fiscal audit tables: only the server (service role / SECURITY DEFINER RPC)
-- may write. Before this, INSERT `with check (true)` and UPDATE `using (true)`
-- policies for {public} let anyone holding the public anon key add or change
-- any organisation's fiscal receipt attempts and command log (2026-11-12 audit).
--
-- The only writer in the app is public.record_fiscal_receipt_attempt
-- (SECURITY DEFINER, owner postgres = table owner, EXECUTE granted to
-- service_role only), which is unaffected. Org members keep SELECT.
--
-- Undo (restores the old, open behaviour):
--   create policy "service role can insert fiscal receipt attempts" on public.fiscal_receipt_attempts for insert with check (true);
--   create policy "service role can update fiscal receipt attempts" on public.fiscal_receipt_attempts for update using (true);
--   create policy "service role insert fiscal command log" on public.fiscal_command_log for insert with check (true);
--   create policy "service role update fiscal command log" on public.fiscal_command_log for update using (true);
--   grant insert, update, delete, truncate on public.fiscal_receipt_attempts, public.fiscal_command_log to anon, authenticated;

drop policy if exists "service role can insert fiscal receipt attempts" on public.fiscal_receipt_attempts;
drop policy if exists "service role can update fiscal receipt attempts" on public.fiscal_receipt_attempts;
drop policy if exists "service role insert fiscal command log" on public.fiscal_command_log;
drop policy if exists "service role update fiscal command log" on public.fiscal_command_log;

drop policy if exists "service role writes fiscal receipt attempts" on public.fiscal_receipt_attempts;
create policy "service role writes fiscal receipt attempts"
  on public.fiscal_receipt_attempts for all to service_role
  using (true) with check (true);

-- fiscal_command_log already has "service role full access fiscal_command_log".

revoke insert, update, delete, truncate on public.fiscal_receipt_attempts from anon, authenticated;
revoke insert, update, delete, truncate on public.fiscal_command_log from anon, authenticated;
