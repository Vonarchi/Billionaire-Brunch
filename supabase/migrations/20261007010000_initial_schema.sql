-- Billionaire Brunch
-- Private venture collective schema.
--
-- Access model
--   anon            public, approved records only
--   authenticated   member-only records when the profile is approved
--   admin           management, including drafts, private records, and privileges
--
-- Application roles live on public.profiles. They are never read from
-- auth.users.raw_user_meta_data, which is user-editable.
--
-- Later modules (AI matching, deal rooms, investor portals, CRM, sponsorship)
-- should reference these tables by id rather than copying them.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique,
  full_name text not null,
  title text not null default '',
  bio text not null default '',
  photo_url text,
  city text,
  expertise text[] not null default '{}',
  industries text[] not null default '{}',
  i_have text not null default '',
  i_need text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  membership_status text not null default 'pending'
    check (membership_status in ('pending', 'approved', 'rejected', 'suspended')),
  role text not null default 'member'
    check (role in ('member', 'admin')),
  is_featured boolean not null default false,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.role is
  'Application role. Authorize from this column, never from user metadata.';

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  description text not null default '',
  industry text not null default '',
  stage text not null default '',
  services text[] not null default '{}',
  website text,
  visibility text not null default 'members'
    check (visibility in ('public', 'members', 'private')),
  status text not null default 'pending'
    check (status in ('draft', 'pending', 'approved', 'archived')),
  is_featured boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  member_role text not null default 'member'
    check (member_role in ('founder', 'executive', 'operator', 'advisor', 'member')),
  title text not null default '',
  is_founder boolean not null default false,
  created_at timestamptz not null default now(),
  unique (company_id, profile_id)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  year integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (company_id is not null or profile_id is not null)
);

create table public.company_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.company_metrics is
  'Flexible operating metrics. Revenue is intentionally not required. Use labels such as years operating, properties, customers, locations, audience, projects, ventures, employees, markets, or transactions.';

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  opportunity_type text not null
    check (opportunity_type in (
      'strategic_partner', 'capital', 'customer', 'distribution', 'real_estate',
      'acquisition', 'joint_venture', 'sponsorship', 'vendor', 'talent', 'other'
    )),
  visibility text not null default 'members'
    check (visibility in ('public', 'members', 'private')),
  status text not null default 'pending'
    check (status in ('draft', 'pending', 'approved', 'closed', 'archived')),
  company_id uuid references public.companies (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  is_featured boolean not null default false,
  location text,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.opportunities is
  'Shared opportunity record. Deal rooms, matching, and investor portals should attach here.';

create table public.opportunity_interest (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  guest_name text,
  guest_email text,
  guest_company text,
  message text not null default '',
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'connected', 'declined')),
  created_at timestamptz not null default now(),
  check (
    profile_id is not null
    or (guest_name is not null and guest_email is not null)
  )
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  series text,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null default '',
  capacity integer not null check (capacity > 0),
  invite_only boolean not null default false,
  requires_approval boolean not null default false,
  visibility text not null default 'members'
    check (visibility in ('public', 'members', 'private')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.events.series is
  'Event series name. The primary series is The Capital Table.';

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  guest_name text,
  guest_email text,
  guest_company text,
  guest_title text,
  referral_source text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'waitlisted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  check (
    profile_id is not null
    or (guest_name is not null and guest_email is not null)
  )
);

create unique index event_registrations_member_key
  on public.event_registrations (event_id, profile_id)
  where profile_id is not null;

create unique index event_registrations_guest_key
  on public.event_registrations (event_id, lower(guest_email))
  where guest_email is not null;

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  description text not null default '',
  website text,
  tier text not null default 'strategic',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.event_sponsors (
  event_id uuid not null references public.events (id) on delete cascade,
  partner_id uuid not null references public.partners (id) on delete cascade,
  primary key (event_id, partner_id)
);

comment on table public.event_sponsors is
  'Sponsor assignments. A fuller sponsorship module can extend this table.';

create table public.introductions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  message text not null default '',
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'declined', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> recipient_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  author_id uuid references public.profiles (id) on delete set null,
  visibility text not null default 'public'
    check (visibility in ('public', 'members', 'private')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  file_path text not null unique,
  visibility text not null default 'members'
    check (visibility in ('public', 'members', 'private')),
  company_id uuid references public.companies (id) on delete set null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  url text,
  category text not null default 'general',
  visibility text not null default 'members'
    check (visibility in ('public', 'members', 'private')),
  status text not null default 'published'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization text not null default '',
  interest text not null default '',
  message text not null default '',
  created_at timestamptz not null default now(),
  check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

create index profiles_membership_idx on public.profiles (membership_status);
create index profiles_featured_idx on public.profiles (is_featured) where is_featured;
create index companies_listing_idx on public.companies (status, visibility);
create index companies_featured_idx on public.companies (is_featured) where is_featured;
create index company_members_company_idx on public.company_members (company_id);
create index company_members_profile_idx on public.company_members (profile_id);
create index achievements_company_idx on public.achievements (company_id);
create index achievements_profile_idx on public.achievements (profile_id);
create index company_metrics_company_idx on public.company_metrics (company_id, sort_order);
create index opportunities_listing_idx on public.opportunities (status, visibility, opportunity_type);
create index opportunities_company_idx on public.opportunities (company_id);
create index opportunity_interest_opportunity_idx on public.opportunity_interest (opportunity_id);
create index events_starts_idx on public.events (starts_at);
create index events_listing_idx on public.events (status, visibility);
create index event_registrations_event_idx on public.event_registrations (event_id, status);
create index introductions_requester_idx on public.introductions (requester_id);
create index introductions_recipient_idx on public.introductions (recipient_id);
create index posts_listing_idx on public.posts (status, visibility, published_at desc);
create index documents_visibility_idx on public.documents (visibility);
create index resources_listing_idx on public.resources (status, visibility);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger companies_updated_at
  before update on public.companies
  for each row execute function private.set_updated_at();

create trigger opportunities_updated_at
  before update on public.opportunities
  for each row execute function private.set_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function private.set_updated_at();

create trigger introductions_updated_at
  before update on public.introductions
  for each row execute function private.set_updated_at();

create trigger posts_updated_at
  before update on public.posts
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- Security definer, private schema, fixed search_path. Policies call these
-- so table policies do not recurse through one another.
-- ---------------------------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and membership_status = 'approved'
  );
$$;

create or replace function private.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and membership_status = 'approved'
  );
$$;

create or replace function private.can_view_profile(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target
      and (
        p.id = (select auth.uid())
        or private.is_admin()
        or (
          p.membership_status = 'approved'
          and (
            p.is_public
            or private.is_approved_member()
          )
        )
      )
  );
$$;

create or replace function private.can_manage_company(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = target
      and (
        private.is_admin()
        or c.created_by = (select auth.uid())
        or exists (
          select 1
          from public.company_members cm
          where cm.company_id = c.id
            and cm.profile_id = (select auth.uid())
            and cm.member_role in ('founder', 'executive')
        )
      )
  );
$$;

create or replace function private.is_company_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members
    where company_id = target
      and profile_id = (select auth.uid())
  );
$$;

create or replace function private.can_view_company(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = target
      and (
        private.is_admin()
        or c.created_by = (select auth.uid())
        or private.is_company_member(c.id)
        or (
          c.status = 'approved'
          and (
            c.visibility = 'public'
            or (c.visibility = 'members' and private.is_approved_member())
          )
        )
      )
  );
$$;

create or replace function private.can_view_opportunity(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.opportunities o
    where o.id = target
      and (
        private.is_admin()
        or o.created_by = (select auth.uid())
        or (
          o.company_id is not null
          and private.can_manage_company(o.company_id)
        )
        or (
          o.status = 'approved'
          and (
            o.visibility = 'public'
            or (o.visibility = 'members' and private.is_approved_member())
            or (
              o.visibility = 'private'
              and o.company_id is not null
              and private.is_company_member(o.company_id)
            )
          )
        )
      )
  );
$$;

create or replace function private.can_view_event(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target
      and (
        private.is_admin()
        or (
          e.status = 'published'
          and (
            e.visibility = 'public'
            or (e.visibility = 'members' and private.is_approved_member())
          )
        )
      )
  );
$$;

create or replace function private.can_view_post(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = target
      and (
        private.is_admin()
        or p.author_id = (select auth.uid())
        or (
          p.status = 'published'
          and (
            p.visibility = 'public'
            or (p.visibility = 'members' and private.is_approved_member())
          )
        )
      )
  );
$$;

create or replace function private.company_id_from_path(object_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folder text := (storage.foldername(object_name))[1];
begin
  if folder is null or folder !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;
  return folder::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function private.can_read_document_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.documents d
    where d.file_path = object_name
      and (
        private.is_admin()
        or d.uploaded_by = (select auth.uid())
        or d.visibility = 'public'
        or (d.visibility = 'members' and private.is_approved_member())
      )
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_approved_member() from public;
revoke all on function private.can_view_profile(uuid) from public;
revoke all on function private.can_manage_company(uuid) from public;
revoke all on function private.is_company_member(uuid) from public;
revoke all on function private.can_view_company(uuid) from public;
revoke all on function private.can_view_opportunity(uuid) from public;
revoke all on function private.can_view_event(uuid) from public;
revoke all on function private.can_view_post(uuid) from public;
revoke all on function private.company_id_from_path(text) from public;
revoke all on function private.can_read_document_path(text) from public;

grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.is_approved_member() to anon, authenticated, service_role;
grant execute on function private.can_view_profile(uuid) to anon, authenticated, service_role;
grant execute on function private.can_manage_company(uuid) to anon, authenticated, service_role;
grant execute on function private.is_company_member(uuid) to anon, authenticated, service_role;
grant execute on function private.can_view_company(uuid) to anon, authenticated, service_role;
grant execute on function private.can_view_opportunity(uuid) to anon, authenticated, service_role;
grant execute on function private.can_view_event(uuid) to anon, authenticated, service_role;
grant execute on function private.can_view_post(uuid) to anon, authenticated, service_role;
grant execute on function private.company_id_from_path(text) to anon, authenticated, service_role;
grant execute on function private.can_read_document_path(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Privilege locks
-- Members may edit their own content. Status, role, featuring, and public
-- visibility changes stay with administrators.
-- ---------------------------------------------------------------------------

create or replace function private.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and not private.is_admin() then
    new.role = old.role;
    new.membership_status = old.membership_status;
    new.is_featured = old.is_featured;
    new.id = old.id;
  end if;
  return new;
end;
$$;

create or replace function private.guard_company_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or private.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status = 'pending';
    new.is_featured = false;
    new.created_by = (select auth.uid());
  else
    new.status = old.status;
    new.is_featured = old.is_featured;
    new.visibility = old.visibility;
    new.created_by = old.created_by;
    new.slug = old.slug;
  end if;
  return new;
end;
$$;

create or replace function private.guard_opportunity_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or private.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status = 'pending';
    new.is_featured = false;
    new.created_by = (select auth.uid());
  else
    new.status = old.status;
    new.is_featured = old.is_featured;
    new.visibility = old.visibility;
    new.created_by = old.created_by;
    new.slug = old.slug;
  end if;
  return new;
end;
$$;

create or replace function private.guard_document_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or private.is_admin() then
    return new;
  end if;
  new.uploaded_by = (select auth.uid());
  if new.visibility = 'public' then
    new.visibility = 'members';
  end if;
  return new;
end;
$$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function private.guard_profile_privileges();

create trigger companies_guard
  before insert or update on public.companies
  for each row execute function private.guard_company_privileges();

create trigger opportunities_guard
  before insert or update on public.opportunities
  for each row execute function private.guard_opportunity_privileges();

create trigger documents_guard
  before insert or update on public.documents
  for each row execute function private.guard_document_privileges();

revoke all on function private.guard_profile_privileges() from public, anon, authenticated;
revoke all on function private.guard_company_privileges() from public, anon, authenticated;
revoke all on function private.guard_opportunity_privileges() from public, anon, authenticated;
revoke all on function private.guard_document_privileges() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- New member profile
-- ---------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, slug)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'New member'),
    'member-' || substr(replace(new.id::text, '-', ''), 1, 12)
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    grant usage on schema private to supabase_auth_admin;
    grant execute on function private.handle_new_user() to supabase_auth_admin;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Event registration
-- Counts approved seats with definer rights so guests cannot read the list.
-- ---------------------------------------------------------------------------

create or replace function private.register_for_event(
  p_event_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_company text,
  p_guest_title text,
  p_referral_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_uid uuid := (select auth.uid());
  v_status text;
  v_taken integer;
  v_id uuid;
  v_email text := nullif(lower(trim(coalesce(p_guest_email, ''))), '');
begin
  select * into v_event from public.events where id = p_event_id;
  if not found or not private.can_view_event(p_event_id) then
    raise exception 'This event is not open for registration';
  end if;

  if v_event.status <> 'published' then
    raise exception 'This event is not open for registration';
  end if;

  if v_uid is not null and exists (
    select 1 from public.event_registrations
    where event_id = p_event_id and profile_id = v_uid and status <> 'cancelled'
  ) then
    raise exception 'You are already registered for this event';
  end if;

  if v_uid is null and (v_email is null or nullif(trim(coalesce(p_guest_name, '')), '') is null) then
    raise exception 'Name and email are required';
  end if;

  if v_email is not null and exists (
    select 1 from public.event_registrations
    where event_id = p_event_id
      and lower(guest_email) = v_email
      and status <> 'cancelled'
  ) then
    raise exception 'This email is already registered for this event';
  end if;

  select count(*) into v_taken
  from public.event_registrations
  where event_id = p_event_id
    and status = 'approved';

  if v_taken >= v_event.capacity then
    v_status := 'waitlisted';
  elsif v_event.invite_only or v_event.requires_approval then
    v_status := 'pending';
  else
    v_status := 'approved';
  end if;

  insert into public.event_registrations (
    event_id, profile_id, guest_name, guest_email, guest_company, guest_title,
    referral_source, status
  )
  values (
    p_event_id,
    v_uid,
    nullif(trim(coalesce(p_guest_name, '')), ''),
    v_email,
    nullif(trim(coalesce(p_guest_company, '')), ''),
    nullif(trim(coalesce(p_guest_title, '')), ''),
    nullif(trim(coalesce(p_referral_source, '')), ''),
    v_status
  )
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'status', v_status);
end;
$$;

revoke all on function private.register_for_event(uuid, text, text, text, text, text) from public;

create or replace function public.register_for_event(
  p_event_id uuid,
  p_guest_name text default null,
  p_guest_email text default null,
  p_guest_company text default null,
  p_guest_title text default null,
  p_referral_source text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.register_for_event(
    p_event_id,
    p_guest_name,
    p_guest_email,
    p_guest_company,
    p_guest_title,
    p_referral_source
  );
$$;

revoke all on function public.register_for_event(uuid, text, text, text, text, text) from public;
grant execute on function public.register_for_event(uuid, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function private.register_for_event(uuid, text, text, text, text, text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.achievements enable row level security;
alter table public.company_metrics enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_interest enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.partners enable row level security;
alter table public.event_sponsors enable row level security;
alter table public.introductions enable row level security;
alter table public.posts enable row level security;
alter table public.documents enable row level security;
alter table public.resources enable row level security;
alter table public.inquiries enable row level security;

create policy profiles_select on public.profiles
  for select to anon, authenticated
  using ((select private.can_view_profile(id)));

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

create policy profiles_delete on public.profiles
  for delete to authenticated
  using ((select private.is_admin()));

create policy companies_select on public.companies
  for select to anon, authenticated
  using ((select private.can_view_company(id)));

create policy companies_insert on public.companies
  for insert to authenticated
  with check ((select private.is_approved_member()) or (select private.is_admin()));

create policy companies_update on public.companies
  for update to authenticated
  using ((select private.can_manage_company(id)))
  with check ((select private.can_manage_company(id)));

create policy companies_delete on public.companies
  for delete to authenticated
  using ((select private.is_admin()));

create policy company_members_select on public.company_members
  for select to anon, authenticated
  using ((select private.can_view_company(company_id)) or profile_id = (select auth.uid()));

create policy company_members_insert on public.company_members
  for insert to authenticated
  with check ((select private.can_manage_company(company_id)) or (select private.is_admin()));

create policy company_members_update on public.company_members
  for update to authenticated
  using ((select private.can_manage_company(company_id)))
  with check ((select private.can_manage_company(company_id)));

create policy company_members_delete on public.company_members
  for delete to authenticated
  using ((select private.can_manage_company(company_id)));

create policy achievements_select on public.achievements
  for select to anon, authenticated
  using (
    (company_id is not null and (select private.can_view_company(company_id)))
    or (profile_id is not null and (select private.can_view_profile(profile_id)))
  );

create policy achievements_write on public.achievements
  for all to authenticated
  using (
    (select private.is_admin())
    or (company_id is not null and (select private.can_manage_company(company_id)))
    or (profile_id = (select auth.uid()))
  )
  with check (
    (select private.is_admin())
    or (company_id is not null and (select private.can_manage_company(company_id)))
    or (profile_id = (select auth.uid()))
  );

create policy metrics_select on public.company_metrics
  for select to anon, authenticated
  using ((select private.can_view_company(company_id)));

create policy metrics_write on public.company_metrics
  for all to authenticated
  using ((select private.can_manage_company(company_id)))
  with check ((select private.can_manage_company(company_id)));

create policy opportunities_select on public.opportunities
  for select to anon, authenticated
  using ((select private.can_view_opportunity(id)));

create policy opportunities_insert on public.opportunities
  for insert to authenticated
  with check ((select private.is_approved_member()) or (select private.is_admin()));

create policy opportunities_update on public.opportunities
  for update to authenticated
  using (
    (select private.is_admin())
    or created_by = (select auth.uid())
    or (company_id is not null and (select private.can_manage_company(company_id)))
  )
  with check (
    (select private.is_admin())
    or created_by = (select auth.uid())
    or (company_id is not null and (select private.can_manage_company(company_id)))
  );

create policy opportunities_delete on public.opportunities
  for delete to authenticated
  using ((select private.is_admin()) or created_by = (select auth.uid()));

create policy interest_select on public.opportunity_interest
  for select to authenticated
  using (
    (select private.is_admin())
    or profile_id = (select auth.uid())
    or (select private.can_view_opportunity(opportunity_id)) and (
      exists (
        select 1 from public.opportunities o
        where o.id = opportunity_id
          and (
            o.created_by = (select auth.uid())
            or (o.company_id is not null and (select private.can_manage_company(o.company_id)))
          )
      )
    )
  );

create policy interest_insert on public.opportunity_interest
  for insert to anon, authenticated
  with check (
    (select private.can_view_opportunity(opportunity_id))
    and (
      profile_id is null
      or profile_id = (select auth.uid())
    )
  );

create policy interest_update on public.opportunity_interest
  for update to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id
        and (
          o.created_by = (select auth.uid())
          or (o.company_id is not null and (select private.can_manage_company(o.company_id)))
        )
    )
  )
  with check (
    (select private.is_admin())
    or exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id
        and (
          o.created_by = (select auth.uid())
          or (o.company_id is not null and (select private.can_manage_company(o.company_id)))
        )
    )
  );

create policy events_select on public.events
  for select to anon, authenticated
  using ((select private.can_view_event(id)));

create policy events_write on public.events
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy registrations_select on public.event_registrations
  for select to authenticated
  using (
    (select private.is_admin())
    or profile_id = (select auth.uid())
  );

create policy registrations_update on public.event_registrations
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy partners_select on public.partners
  for select to anon, authenticated
  using (is_active or (select private.is_admin()));

create policy partners_write on public.partners
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy sponsors_select on public.event_sponsors
  for select to anon, authenticated
  using ((select private.can_view_event(event_id)) or (select private.is_admin()));

create policy sponsors_write on public.event_sponsors
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy introductions_select on public.introductions
  for select to authenticated
  using (
    (select private.is_admin())
    or requester_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

create policy introductions_insert on public.introductions
  for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and (select private.is_approved_member())
    and requester_id <> recipient_id
  );

create policy introductions_update on public.introductions
  for update to authenticated
  using (
    (select private.is_admin())
    or recipient_id = (select auth.uid())
    or requester_id = (select auth.uid())
  )
  with check (
    (select private.is_admin())
    or recipient_id = (select auth.uid())
    or requester_id = (select auth.uid())
  );

create policy posts_select on public.posts
  for select to anon, authenticated
  using ((select private.can_view_post(id)));

create policy posts_write on public.posts
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy documents_select on public.documents
  for select to anon, authenticated
  using ((select private.can_read_document_path(file_path)));

create policy documents_insert on public.documents
  for insert to authenticated
  with check ((select private.is_approved_member()) or (select private.is_admin()));

create policy documents_update on public.documents
  for update to authenticated
  using (uploaded_by = (select auth.uid()) or (select private.is_admin()))
  with check (uploaded_by = (select auth.uid()) or (select private.is_admin()));

create policy documents_delete on public.documents
  for delete to authenticated
  using (uploaded_by = (select auth.uid()) or (select private.is_admin()));

create policy resources_select on public.resources
  for select to anon, authenticated
  using (
    (select private.is_admin())
    or (
      status = 'published'
      and (
        visibility = 'public'
        or (visibility = 'members' and (select private.is_approved_member()))
      )
    )
  );

create policy resources_write on public.resources
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy inquiries_insert on public.inquiries
  for insert to anon, authenticated
  with check (char_length(name) > 1 and char_length(message) > 1);

create policy inquiries_select on public.inquiries
  for select to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Grants
-- RLS still decides which rows are visible.
-- ---------------------------------------------------------------------------

grant select on public.profiles, public.companies, public.company_members,
  public.achievements, public.company_metrics, public.opportunities,
  public.events, public.partners, public.event_sponsors, public.posts,
  public.documents, public.resources
to anon;

grant insert on public.opportunity_interest, public.inquiries to anon;

grant select, insert, update, delete on
  public.profiles, public.companies, public.company_members, public.achievements,
  public.company_metrics, public.opportunities, public.opportunity_interest,
  public.events, public.event_registrations, public.partners, public.event_sponsors,
  public.introductions, public.posts, public.documents, public.resources, public.inquiries
to authenticated;

grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('company-assets', 'company-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('documents', 'documents', false, 26214400, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy avatars_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy avatars_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy company_assets_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'company-assets');

create policy company_assets_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'company-assets'
    and (select private.can_manage_company((select private.company_id_from_path(name))))
  );

create policy company_assets_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'company-assets'
    and (select private.can_manage_company((select private.company_id_from_path(name))))
  )
  with check (
    bucket_id = 'company-assets'
    and (select private.can_manage_company((select private.company_id_from_path(name))))
  );

create policy company_assets_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'company-assets'
    and (select private.can_manage_company((select private.company_id_from_path(name))))
  );

create policy documents_storage_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'documents'
    and (select private.can_read_document_path(name))
  );

create policy documents_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (select private.is_approved_member())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy documents_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and (
      (select private.is_admin())
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  )
  with check (
    bucket_id = 'documents'
    and (
      (select private.is_admin())
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

create policy documents_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (
      (select private.is_admin())
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );
