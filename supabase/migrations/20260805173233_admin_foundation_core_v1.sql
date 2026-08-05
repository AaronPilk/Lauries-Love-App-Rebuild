-- Admin / licensing foundation (applied 2026-08-05, reconciled to Jeremy's
-- support_staff table). NOTE: this depends on support_staff (owner|agent)
-- which was created by Jeremy's migrations that are NOT yet in this repo —
-- see supabase/migrations/README.md "Repo↔DB divergence". A fresh deploy from
-- this repo will NOT succeed until Jeremy's support_staff/support_tickets
-- migrations are pulled in and the whole sequence is validated on staging.
--
-- End-state this produces (staff_roles was created then dropped in the live
-- history; this clean version skips that detour):
--   * organizations (licensing seam, seeds Laurie's Love)
--   * is_staff()/is_admin() read support_staff (role owner = admin, any = staff)
--   * platform_features (feature-toggle / licensing layer)
--   * moderation_queue (AI moderation, human-in-the-loop)

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);
insert into public.organizations (name, slug)
  values ('Laurie''s Love', 'lauries-love') on conflict (slug) do nothing;

-- Admin helpers read the shared support_staff table (single source of truth).
create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.support_staff where profile_id = auth.uid());
$$;
revoke execute on function public.is_staff() from anon, public;
grant execute on function public.is_staff() to authenticated;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.support_staff where profile_id = auth.uid() and role = 'owner');
$$;
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.platform_features (
  org_id uuid references public.organizations(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  label text,
  updated_at timestamptz not null default now(),
  primary key (org_id, feature_key)
);
alter table public.platform_features enable row level security;
create policy platform_features_select on public.platform_features for select to authenticated using (true);
create policy platform_features_admin_write on public.platform_features for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.platform_features (org_id, feature_key, enabled, label)
select o.id, f.key, true, f.label
from public.organizations o
cross join (values
  ('community_wall','Community Wall'),('groups','Groups'),('messaging','Messaging'),
  ('community_map','Community Map'),('donations','Donations'),('sponsorships','Sponsorships'),
  ('notifications','Notifications'),('ai_moderation','AI Moderation'),
  ('support_center','Support Center'),('friends','Friends'),('media_library','Media & Documents')
) as f(key,label)
where o.slug='lauries-love'
on conflict (org_id, feature_key) do nothing;

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('post','comment')),
  entity_id uuid not null,
  author_id uuid references public.profiles(id) on delete set null,
  reason text, score numeric,
  flagged_by text not null default 'ai' check (flagged_by in ('ai','user')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists idx_modqueue_status on public.moderation_queue (status, created_at desc);
alter table public.moderation_queue enable row level security;
create policy modqueue_staff_all on public.moderation_queue for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
