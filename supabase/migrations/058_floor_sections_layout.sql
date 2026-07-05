-- Floor sections + table layout for restaurant floor plan canvas

create table if not exists restaurant_floor_sections (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references organisations(id) on delete cascade,
  site_id           uuid references sites(id) on delete set null,
  name              text not null,
  sort_order        smallint not null default 0,
  background_preset text not null default 'wood',
  background_url    text,
  created_at        timestamptz not null default now()
);

create index if not exists restaurant_floor_sections_org_idx
  on restaurant_floor_sections (organisation_id, site_id, sort_order);

alter table restaurant_floor_sections enable row level security;

create policy "rfs_select_org_member" on restaurant_floor_sections
  for select using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = restaurant_floor_sections.organisation_id
        and om.user_id = auth.uid()
        and (om.status is null or om.status = 'active')
    )
  );

create policy "rfs_write_manager" on restaurant_floor_sections
  for all using (
    exists (
      select 1 from organisation_members om
      where om.organisation_id = restaurant_floor_sections.organisation_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'manager')
        and (om.status is null or om.status = 'active')
    )
  );

alter table restaurant_tables
  add column if not exists section_id uuid references restaurant_floor_sections(id) on delete set null,
  add column if not exists icon_url text,
  add column if not exists layout_x numeric,
  add column if not exists layout_y numeric,
  add column if not exists layout_w numeric default 80,
  add column if not exists layout_h numeric default 80;

alter table restaurant_tables
  add column if not exists shape text default 'square';

update restaurant_tables set shape = 'square' where shape is null;

alter table restaurant_tables
  alter column shape set default 'square',
  alter column shape set not null;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurant_tables_shape_check'
  ) THEN
    ALTER TABLE restaurant_tables
      ADD CONSTRAINT restaurant_tables_shape_check
      CHECK (shape in ('square', 'rectangle', 'round'));
  END IF;
END $$;

insert into restaurant_floor_sections (organisation_id, site_id, name, sort_order, background_preset)
select distinct
  rt.organisation_id,
  rt.site_id,
  coalesce(nullif(trim(rt.section), ''), 'Sală'),
  0,
  'wood'
from restaurant_tables rt
where not exists (
  select 1 from restaurant_floor_sections rfs
  where rfs.organisation_id = rt.organisation_id
    and rfs.site_id is not distinct from rt.site_id
    and rfs.name = coalesce(nullif(trim(rt.section), ''), 'Sală')
);

update restaurant_tables rt
set section_id = rfs.id
from restaurant_floor_sections rfs
where rt.section_id is null
  and rfs.organisation_id = rt.organisation_id
  and rfs.site_id is not distinct from rt.site_id
  and rfs.name = coalesce(nullif(trim(rt.section), ''), 'Sală');

with numbered as (
  select
    id,
    row_number() over (
      partition by organisation_id, coalesce(site_id::text, ''), coalesce(section_id::text, '')
      order by sort_order, name
    ) - 1 as rn
  from restaurant_tables
  where layout_x is null
)
update restaurant_tables rt
set
  layout_x = 40 + (numbered.rn % 6) * 120,
  layout_y = 40 + floor(numbered.rn / 6.0) * 120,
  layout_w = case when coalesce(rt.shape, 'square') = 'rectangle' then 120 else 80 end,
  layout_h = 80
from numbered
where rt.id = numbered.id;

insert into restaurant_floor_sections (organisation_id, site_id, name, sort_order, background_preset)
select distinct rt.organisation_id, rt.site_id, 'Sală', 0, 'wood'
from restaurant_tables rt
where rt.section_id is null
  and not exists (
    select 1 from restaurant_floor_sections rfs
    where rfs.organisation_id = rt.organisation_id
      and rfs.site_id is not distinct from rt.site_id
      and rfs.name = 'Sală'
  );

update restaurant_tables rt
set section_id = rfs.id
from restaurant_floor_sections rfs
where rt.section_id is null
  and rfs.organisation_id = rt.organisation_id
  and rfs.site_id is not distinct from rt.site_id
  and rfs.name = 'Sală';
