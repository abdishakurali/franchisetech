-- Migration 024: Audit events new columns for simulation/diagnostic mode support

-- Add connector_run_mode and suggestion to cash_drawer_events
alter table public.cash_drawer_events
  add column if not exists connector_run_mode text,
  add column if not exists suggestion text;

-- Extend the result check constraint to include new codes
-- (Drop old constraint if it exists, add expanded one)
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'cash_drawer_events'
      and constraint_type = 'CHECK'
      and constraint_name like '%result%'
  ) then
    alter table public.cash_drawer_events drop constraint if exists cash_drawer_events_result_check;
  end if;
end
$$;

alter table public.cash_drawer_events
  add constraint cash_drawer_events_result_check check (
    result in (
      'skipped', 'manual_required', 'command_sent', 'failed',
      'not_configured', 'rate_limited', 'invalid_token', 'missing_token',
      'origin_rejected', 'connector_unavailable', 'timeout',
      'hardware_verified', 'paired', 'pairing_failed', 'setup_completed',
      'simulation_success', 'simulation_only',
      'diagnostic_passed', 'diagnostic_warning', 'diagnostic_failed', 'diagnostic_only',
      'not_paired', 'printer_not_configured', 'printer_ip_missing',
      'printer_unreachable', 'printer_port_blocked',
      'printer_connection_timeout', 'printer_connection_refused', 'printer_write_failed',
      'hardware_not_verified', 'browser_blocked'
    )
  );

-- Connector_run_mode constraint
alter table public.cash_drawer_events
  add constraint cash_drawer_events_connector_run_mode_check check (
    connector_run_mode is null or connector_run_mode in ('simulation', 'diagnostic', 'live')
  );
