-- Migration 023: Cash drawer hardware verifications table
-- Records explicit human confirmation that a cash drawer opened during setup/testing

create table if not exists public.cash_drawer_hardware_verifications (
  id                     uuid primary key default gen_random_uuid(),
  organisation_id        uuid not null references public.organisations(id) on delete cascade,
  terminal_id            text,
  location_id            text,
  verified_by_user_id    uuid references auth.users(id) on delete set null,
  verified_at            timestamptz not null default now(),
  verification_source    text not null default 'human_setup_confirmation'
                         check (verification_source in ('human_setup_confirmation', 'periodic_recheck', 'support_override')),
  connector_version      text,
  printer_ip             text,
  notes                  text,
  created_at             timestamptz not null default now()
);

-- Indexes
create index if not exists cash_drawer_hw_verif_org_idx
  on public.cash_drawer_hardware_verifications (organisation_id, verified_at desc);

-- RLS
alter table public.cash_drawer_hardware_verifications enable row level security;

create policy Organisation members can view hardware verifications
  on public.cash_drawer_hardware_verifications for select
  using (
    exists (
      select 1 from public.organisation_members
      where organisation_members.organisation_id = cash_drawer_hardware_verifications.organisation_id
        and organisation_members.user_id = auth.uid()
    )
  );

-- Managers can insert via service-role API (route.ts uses admin client)
-- No direct insert policy needed for authenticated users
