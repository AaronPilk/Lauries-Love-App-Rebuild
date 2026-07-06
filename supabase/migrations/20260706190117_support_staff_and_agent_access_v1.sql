-- Agent access model for the internal ticket dashboard. Support staff (an
-- explicit allow-list) can read + triage ALL tickets; regular users keep
-- owner-only access. Gating is 100% RLS — the dashboard uses only the
-- publishable key and an agent's own login, never a service-role secret.

create table public.support_staff (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.support_staff enable row level security;

-- SECURITY DEFINER so it can be used inside policies without recursive RLS.
create or replace function public.is_support_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.support_staff where profile_id = auth.uid());
$$;
revoke execute on function public.is_support_staff() from anon, public;
grant execute on function public.is_support_staff() to authenticated;

-- Staff can see who else is staff (assignee dropdown); nobody self-enrolls
-- (writes happen via service role / SQL only — no insert policy).
create policy support_staff_select on public.support_staff for select to authenticated
  using (public.is_support_staff());

-- Assignment target.
alter table public.support_tickets
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null;
create index if not exists idx_support_tickets_assignee on public.support_tickets (assigned_to, status);

-- Staff read every ticket (in addition to owners reading their own).
create policy support_tickets_staff_select on public.support_tickets for select to authenticated
  using (public.is_support_staff());

-- Staff may triage (status / assignment). RLS gates WHO can update; the
-- dashboard controls WHICH columns.
create policy support_tickets_staff_update on public.support_tickets for update to authenticated
  using (public.is_support_staff())
  with check (public.is_support_staff());

-- A support agent legitimately needs to identify/contact the reporter, so let
-- staff read reporter PII (email/phone). Regular users still see only their own.
create policy pp_select_staff on public.profiles_private for select to authenticated
  using (public.is_support_staff());

-- Seed the owner(s) as staff.
insert into public.support_staff (profile_id) values
  ('d0ba6189-006c-4089-a9af-de898be9e5f2'),
  ('b40f318f-ae04-4d3f-9324-c65a448b870c')
on conflict do nothing;
