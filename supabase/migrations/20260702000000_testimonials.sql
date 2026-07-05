-- ============================================================
-- 20260702000000_testimonials.sql
-- P3/P4: Customer feedback -> moderated testimonial carousel
-- Additive only. Backwards-compatible.
-- ============================================================

create table if not exists public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  submitted_by    uuid references public.profiles(id) on delete set null,
  quote           text not null,
  rating          integer,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  constraint testimonials_rating_range check (rating is null or (rating between 1 and 5))
);

alter table public.testimonials enable row level security;

-- Any active org member can submit feedback for their own org
drop policy if exists "org_members_insert_testimonial" on public.testimonials;
create policy "org_members_insert_testimonial"
  on public.testimonials for insert
  with check (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and (status is null or status = 'active')
    )
  );

-- Org members can view their own org's submissions (any status)
drop policy if exists "org_members_view_own_testimonials" on public.testimonials;
create policy "org_members_view_own_testimonials"
  on public.testimonials for select
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and (status is null or status = 'active')
    )
  );

-- Public/anon can read only approved testimonials (marketing carousel)
drop policy if exists "public_read_approved_testimonials" on public.testimonials;
create policy "public_read_approved_testimonials"
  on public.testimonials for select
  to anon
  using (status = 'approved');

-- Owner/manager can update status (approve/reject) for their own org
drop policy if exists "owner_manager_update_testimonial_status" on public.testimonials;
create policy "owner_manager_update_testimonial_status"
  on public.testimonials for update
  using (
    organisation_id in (
      select organisation_id from public.organisation_members
      where user_id = auth.uid()
        and role in ('owner','manager')
        and (status is null or status = 'active')
    )
  );

create index if not exists idx_testimonials_org_status
  on public.testimonials (organisation_id, status);

create index if not exists idx_testimonials_approved
  on public.testimonials (created_at desc)
  where status = 'approved';
