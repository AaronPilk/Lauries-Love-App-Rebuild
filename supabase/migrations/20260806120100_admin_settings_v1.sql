-- Admin settings layer: custom profile fields, branding + platform config,
-- and owner-gated group management. Additive + idempotent only — no existing
-- object is dropped or renamed. Builds on admin_foundation_core_v1
-- (organizations, platform_features, is_support_owner/is_support_staff).
--
-- Org scoping: there is a single org today (Laurie's Love). default_org_id()
-- resolves it so client inserts don't have to carry org_id, and column DEFAULTs
-- can't use subqueries directly.

-- ------------------------------------------------------------------
-- Helper: the current (single) org id.
-- ------------------------------------------------------------------
create or replace function public.default_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.organizations where slug = 'lauries-love' limit 1;
$$;
grant execute on function public.default_org_id() to anon, authenticated;

-- ------------------------------------------------------------------
-- Custom profile fields (admin-defined) + per-member values.
-- ------------------------------------------------------------------
create table if not exists public.custom_profile_fields (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null default public.default_org_id() references public.organizations(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null default 'text'
    check (field_type in ('text','textarea','number','select','boolean','date')),
  options jsonb not null default '[]'::jsonb,   -- choices for field_type = select
  position int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, field_key)
);
create index if not exists idx_custom_profile_fields_org
  on public.custom_profile_fields (org_id, position);

alter table public.custom_profile_fields enable row level security;

-- Members see enabled fields; owners see all (to manage disabled ones too).
drop policy if exists cpf_select on public.custom_profile_fields;
create policy cpf_select on public.custom_profile_fields for select to authenticated
  using (enabled or public.is_support_owner());
-- Only support owners define / edit field definitions.
drop policy if exists cpf_owner_write on public.custom_profile_fields;
create policy cpf_owner_write on public.custom_profile_fields for all to authenticated
  using (public.is_support_owner()) with check (public.is_support_owner());

create table if not exists public.profile_field_values (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  field_id uuid not null references public.custom_profile_fields(id) on delete cascade,
  value text,
  updated_at timestamptz not null default now(),
  primary key (profile_id, field_id)
);
create index if not exists idx_profile_field_values_field
  on public.profile_field_values (field_id);

alter table public.profile_field_values enable row level security;

-- Community-visible (same posture as public profile fields); each member only
-- writes their own values.
drop policy if exists pfv_select on public.profile_field_values;
create policy pfv_select on public.profile_field_values for select to authenticated
  using (true);
drop policy if exists pfv_insert on public.profile_field_values;
create policy pfv_insert on public.profile_field_values for insert to authenticated
  with check (profile_id = auth.uid());
drop policy if exists pfv_update on public.profile_field_values;
create policy pfv_update on public.profile_field_values for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists pfv_delete on public.profile_field_values;
create policy pfv_delete on public.profile_field_values for delete to authenticated
  using (profile_id = auth.uid());

-- ------------------------------------------------------------------
-- Branding settings (one row per org). Public read so the login screen and
-- unauthenticated surfaces can theme; owner-only write.
-- ------------------------------------------------------------------
create table if not exists public.branding_settings (
  org_id uuid primary key default public.default_org_id()
    references public.organizations(id) on delete cascade,
  app_name text,
  tagline text,
  primary_color text,
  secondary_color text,
  logo_url text,
  support_email text,
  updated_at timestamptz not null default now()
);

insert into public.branding_settings (org_id, app_name, tagline, primary_color, secondary_color, support_email)
select public.default_org_id(), 'Laurie''s Love',
       'Support cancer patients and their families',
       '#a5257e', '#d84a9a', 'info@laurieslove.org'
where public.default_org_id() is not null
on conflict (org_id) do nothing;

alter table public.branding_settings enable row level security;

drop policy if exists branding_public_read on public.branding_settings;
create policy branding_public_read on public.branding_settings for select
  to anon, authenticated using (true);
drop policy if exists branding_owner_write on public.branding_settings;
create policy branding_owner_write on public.branding_settings for all to authenticated
  using (public.is_support_owner()) with check (public.is_support_owner());

-- ------------------------------------------------------------------
-- Generic platform config (key/value). Read by any signed-in member (e.g. the
-- sponsorship tiers / contact email); owner-only write.
-- ------------------------------------------------------------------
create table if not exists public.org_settings (
  org_id uuid not null default public.default_org_id()
    references public.organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (org_id, key)
);

alter table public.org_settings enable row level security;

drop policy if exists org_settings_read on public.org_settings;
create policy org_settings_read on public.org_settings for select to authenticated
  using (true);
drop policy if exists org_settings_owner_write on public.org_settings;
create policy org_settings_owner_write on public.org_settings for all to authenticated
  using (public.is_support_owner()) with check (public.is_support_owner());

-- Seed the sponsorship tiers + contact so Sponsorships.tsx is admin-editable.
insert into public.org_settings (org_id, key, value)
select public.default_org_id(), 'sponsorship', jsonb_build_object(
  'contact_email', 'sponsors@laurieslove.org',
  'tiers', jsonb_build_array(
    jsonb_build_object('name','Community Friend','price','$500 / year',
      'perks', jsonb_build_array('Logo on the sponsors page','Thank-you post to the community')),
    jsonb_build_object('name','Community Partner','price','$2,500 / year','featured', true,
      'perks', jsonb_build_array('Everything in Friend','Featured placement on the sponsors page','Quarterly community shout-out')),
    jsonb_build_object('name','Community Champion','price','$10,000 / year',
      'perks', jsonb_build_array('Everything in Partner','Homepage recognition','Named support for a community program'))
  )
)
where public.default_org_id() is not null
on conflict (org_id, key) do nothing;

-- ------------------------------------------------------------------
-- platform_features: make sure the 9 SOW modules exist (match existing table
-- columns exactly). admin_foundation already seeded these + friends +
-- media_library; on conflict do nothing keeps this a no-op there.
-- ------------------------------------------------------------------
insert into public.platform_features (org_id, feature_key, enabled, label)
select public.default_org_id(), f.key, true, f.label
from (values
  ('community_map','Community Map'),
  ('donations','Donations'),
  ('messaging','Messaging'),
  ('community_wall','Community Wall'),
  ('groups','Groups'),
  ('sponsorships','Sponsorships'),
  ('notifications','Notifications'),
  ('ai_moderation','AI Moderation'),
  ('support_center','Support Center')
) as f(key,label)
where public.default_org_id() is not null
on conflict (org_id, feature_key) do nothing;

-- ------------------------------------------------------------------
-- Group management: let support OWNERS write groups. The base schema only has
-- groups_select (read-all) — no write policy — so admins currently can't manage
-- groups. Add owner insert/update/delete without touching existing policies.
-- ------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'groups' and policyname = 'groups_owner_insert'
  ) then
    create policy groups_owner_insert on public.groups for insert to authenticated
      with check (public.is_support_owner());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'groups' and policyname = 'groups_owner_update'
  ) then
    create policy groups_owner_update on public.groups for update to authenticated
      using (public.is_support_owner()) with check (public.is_support_owner());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'groups' and policyname = 'groups_owner_delete'
  ) then
    create policy groups_owner_delete on public.groups for delete to authenticated
      using (public.is_support_owner());
  end if;
end $$;
