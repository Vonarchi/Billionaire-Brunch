-- Sample catalogue for local Supabase.
-- Run with `supabase db reset` after the migration.
-- Profiles are created when people sign up. Promote the first administrator with:
--
--   update public.profiles
--   set role = 'admin', membership_status = 'approved'
--   where id = (select id from auth.users where email = 'you@example.com');

insert into public.companies (id, slug, name, description, industry, stage, services, website, visibility, status, is_featured)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'meridian-hold',
    'Meridian Hold',
    'A real-estate platform acquiring and operating multifamily and mixed-use assets across the Sun Belt.',
    'Real estate',
    'Operating',
    array['Acquisition', 'Development', 'Asset management'],
    'https://example.com/meridian',
    'public',
    'approved',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'alloy-circuit',
    'Alloy Circuit',
    'Applied technology for operators who own physical assets and regulated workflows.',
    'Technology',
    'Growth',
    array['Product', 'Internal tools', 'Data systems'],
    'https://example.com/alloy',
    'public',
    'approved',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'northline-media',
    'Northline Media',
    'A media agency with an owned audience. Partnerships prefer equity over campaign fees.',
    'Media agency',
    'Operating',
    array['Publishing', 'Partnerships', 'Audience'],
    'https://example.com/northline',
    'public',
    'approved',
    true
  )
on conflict (slug) do nothing;

insert into public.company_metrics (company_id, label, value, sort_order)
select id, metric.label, metric.value, metric.sort_order
from public.companies c
join (
  values
    ('meridian-hold', 'Years operating', '11', 1),
    ('meridian-hold', 'Properties', '18', 2),
    ('meridian-hold', 'Markets', '4', 3),
    ('alloy-circuit', 'Projects', '30', 1),
    ('alloy-circuit', 'Ventures', '4', 2),
    ('northline-media', 'Audience', '1.2M', 1)
) as metric(slug, label, value, sort_order) on metric.slug = c.slug
where not exists (
  select 1 from public.company_metrics existing
  where existing.company_id = c.id and existing.label = metric.label
);

insert into public.opportunities (
  slug, title, summary, description, opportunity_type, visibility, status, company_id, is_featured, location
)
select
  'operating-partner-east-corridor',
  'Operating partner for the East Corridor assemblage',
  'Meridian controls the land. The seat is for an operator who can deliver the mixed-use program.',
  'Four parcels are under control. The collective is looking for a strategic operating partner.',
  'strategic_partner',
  'public',
  'approved',
  id,
  true,
  'Atlanta'
from public.companies
where slug = 'meridian-hold'
on conflict (slug) do nothing;

insert into public.events (
  slug, series, title, description, starts_at, location, capacity, invite_only, requires_approval, visibility, status, is_featured
)
values (
  'the-capital-table-autumn',
  'The Capital Table',
  'Autumn Session',
  'A private dinner for principals. Twenty-four seats. Attendance is approved.',
  '2026-11-12 18:30:00-05',
  'Atlanta — address shared upon approval',
  24,
  true,
  true,
  'public',
  'published',
  true
)
on conflict (slug) do nothing;

insert into public.partners (name, description, website, tier, is_featured, sort_order)
select 'Halden Family Office', 'Patient capital for operators who keep their companies.', 'https://example.com/halden', 'Capital', true, 1
where not exists (select 1 from public.partners where name = 'Halden Family Office');

insert into public.posts (slug, title, excerpt, body, visibility, status, is_featured, published_at)
values (
  'ownership-is-an-operating-system',
  'Ownership is an operating system',
  'Equity, audience, and real assets only compound when the structure is as serious as the ambition.',
  E'The collective is not a feed of introductions.\n\nOwnership is the operating system.',
  'public',
  'published',
  true,
  '2026-09-02 09:00:00-05'
)
on conflict (slug) do nothing;

insert into public.resources (title, summary, category, visibility, status)
select
  'How to write an opportunity',
  'State what you have, what you need, and who should not apply.',
  'Practice',
  'members',
  'published'
where not exists (select 1 from public.resources where title = 'How to write an opportunity');
