-- =====================================================================
-- STATUS: NOT YET APPLIED.  DO NOT RUN until the Supabase MCP connector /
-- CLI is pointed at the Laurie's Love project (iwbfsbriippzmdyrsmsu).
-- (As of 2026-07-29 the connector was connected to a DIFFERENT org.)
-- When applied, move this file into supabase/migrations/ with a final
-- timestamp and drop the "PENDING_" prefix.
-- =====================================================================
--
-- Admin / licensing foundation for the SOW (7/29): staff roles, the
-- feature-toggle system, the AI-moderation queue, and support tickets.
-- Designed to be read by EVERY surface (iOS, Android, Web) and gated in
-- the admin panel. Built forward-compatible with multi-org licensing
-- (org_id columns are present but nullable = "this deployment").

-- ---------------------------------------------------------------------
-- 0. Organizations (licensing seam). One row for Laurie's Love today;
--    future licensed deployments add rows. Everything below can scope by
--    org_id later without a schema rewrite.
-- ---------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);
-- Seed the primary org (idempotent).
insert into public.organizations (name, slug)
  values ('Laurie''s Love', 'lauries-love')
  on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 1. Staff roles. Separate table (not a column on profiles) so staff
--    membership is explicit and auditable. role: admin | moderator | support.
-- ---------------------------------------------------------------------
create table if not exists public.staff_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  role text not null check (role in ('admin','moderator','support')),
  created_at timestamptz not null default now(),
  primary key (profile_id, org_id, role)
);
create index if not exists idx_staff_roles_profile on public.staff_roles (profile_id);

-- Helpers (SECURITY DEFINER so policies can use them without recursion).
create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.staff_roles where profile_id = auth.uid());
$$;
revoke execute on function public.is_staff() from anon, public;
grant execute on function public.is_staff() to authenticated;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.staff_roles
    where profile_id = auth.uid() and role = 'admin'
  );
$$;
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

alter table public.staff_roles enable row level security;
-- Staff can see the staff list; only admins can grant/revoke roles.
create policy staff_roles_select on public.staff_roles for select to authenticated
  using (profile_id = auth.uid() or public.is_staff());
create policy staff_roles_admin_write on public.staff_roles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 2. Feature toggles (the licensing layer). Every major module can be
--    enabled/disabled per deployment. Read by all surfaces; admin-writable.
-- ---------------------------------------------------------------------
create table if not exists public.platform_features (
  org_id uuid references public.organizations(id) on delete cascade,
  feature_key text not null,     -- 'community_map','donations','messaging',
                                 -- 'community_wall','groups','sponsorships',
                                 -- 'notifications','ai_moderation','support_center', ...
  enabled boolean not null default true,
  label text,                    -- human label for the admin UI
  updated_at timestamptz not null default now(),
  primary key (org_id, feature_key)
);
alter table public.platform_features enable row level security;
-- Everyone signed in can READ flags (surfaces show/hide modules by them).
create policy platform_features_select on public.platform_features for select to authenticated
  using (true);
-- Only admins flip them.
create policy platform_features_admin_write on public.platform_features for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Seed the default feature set for the primary org (all ON).
insert into public.platform_features (org_id, feature_key, enabled, label)
select o.id, f.key, true, f.label
from public.organizations o
cross join (values
  ('community_wall','Community Wall'),
  ('groups','Groups'),
  ('messaging','Messaging'),
  ('community_map','Community Map'),
  ('donations','Donations'),
  ('sponsorships','Sponsorships'),
  ('notifications','Notifications'),
  ('ai_moderation','AI Moderation'),
  ('support_center','Support Center'),
  ('friends','Friends'),
  ('media_library','Media & Documents')
) as f(key, label)
where o.slug = 'lauries-love'
on conflict (org_id, feature_key) do nothing;

-- ---------------------------------------------------------------------
-- 3. AI-moderation queue. An edge function on post/comment insert flags
--    suspect content here; admins/moderators review before action. Human
--    in the loop is required (SOW).
-- ---------------------------------------------------------------------
create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('post','comment')),
  entity_id uuid not null,
  author_id uuid references public.profiles(id) on delete set null,
  reason text,                          -- model rationale / category
  score numeric,                        -- model confidence 0..1
  flagged_by text not null default 'ai' check (flagged_by in ('ai','user')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_modqueue_status on public.moderation_queue (status, created_at desc);
alter table public.moderation_queue enable row level security;
-- Staff only.
create policy modqueue_staff_all on public.moderation_queue for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------
-- 4. Support tickets (the "support center" — a ticketing model on top of
--    the existing support chat). Member creates + sees own; staff see all.
-- ---------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(subject) <= 200),
  status text not null default 'open' check (status in ('open','pending','closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tickets_member on public.support_tickets (member_id, created_at desc);
create index if not exists idx_tickets_status on public.support_tickets (status, updated_at desc);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now()
);
create index if not exists idx_ticket_msgs on public.support_ticket_messages (ticket_id, created_at);

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

create policy tickets_member_read on public.support_tickets for select to authenticated
  using (member_id = auth.uid() or public.is_staff());
create policy tickets_member_create on public.support_tickets for insert to authenticated
  with check (member_id = auth.uid());
create policy tickets_staff_update on public.support_tickets for update to authenticated
  using (public.is_staff() or member_id = auth.uid());

create policy ticketmsgs_read on public.support_ticket_messages for select to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.support_tickets t
               where t.id = ticket_id and t.member_id = auth.uid())
  );
create policy ticketmsgs_write on public.support_ticket_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      public.is_staff()
      or exists (select 1 from public.support_tickets t
                 where t.id = ticket_id and t.member_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------
-- 5. Welcome automation. Fire an in-app notification (from the support
--    account) to every newly-created member. Extends handle_new_user.
--    NOTE: leaves the existing profiles + profiles_private inserts intact;
--    only appends the welcome notification.
-- ---------------------------------------------------------------------
-- (Implement in the SAME migration that owns handle_new_user so we don't
--  fork the trigger. Placeholder here documents intent; wire it in when
--  applying, appending to the current handle_new_user body:
--
--    insert into public.notifications (recipient_id, sender_id, entity_type, content)
--    values (new.id, '<SUPPORT_PROFILE_ID>', 'WELCOME',
--            'Welcome to Laurie''s Love! Tap here if you need anything.');
--
--  Kept as a comment so this file stays non-destructive to review.)

-- =====================================================================
-- Admin-panel / surfaces will read: is_admin(), is_staff(),
-- platform_features (all surfaces gate modules on these),
-- moderation_queue + support_tickets (admin portal). Grant the first
-- 'admin' staff_roles row manually to the founder account after apply.
-- =====================================================================
