-- Close the last HIGH: profiles_select gates rows but not columns, so a hostile
-- client could GET /rest/v1/profiles?select=email,phone_number,push_token and
-- scrape member PII directly. Postgres has no column-level RLS, so we physically
-- move the sensitive columns into an owner-only table. The base profiles table
-- keeps only community-safe fields (name, avatar, city, diagnosis, coords), so
-- every existing select('*') and every embedded join simply can't return PII.

create table public.profiles_private (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email text,
  phone_number text,
  phone_number_location text,
  zip_code text,
  push_token text,
  push_active boolean not null default false,
  device_type text,
  updated_at timestamptz not null default now()
);
alter table public.profiles_private enable row level security;

-- Owner-only: you can only ever read or write your OWN private row.
create policy pp_select on public.profiles_private for select to authenticated
  using (profile_id = (select auth.uid()));
create policy pp_insert on public.profiles_private for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy pp_update on public.profiles_private for update to authenticated
  using (profile_id = (select auth.uid()));

create trigger trg_pp_updated before update on public.profiles_private
  for each row execute function public.set_updated_at();

-- Backfill from the existing columns.
insert into public.profiles_private
  (profile_id, email, phone_number, phone_number_location, zip_code, push_token, push_active, device_type)
select id, email, phone_number, phone_number_location, zip_code, push_token, push_active, device_type
from public.profiles
on conflict (profile_id) do nothing;

-- Signup trigger now creates BOTH rows (email lands in the private table).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.profiles_private (profile_id, email)
    values (new.id, coalesce(new.email, ''))
    on conflict (profile_id) do nothing;
  return new;
end $$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Drop the sensitive columns from the public table (index first).
drop index if exists public.idx_profiles_email;
alter table public.profiles
  drop column email,
  drop column phone_number,
  drop column phone_number_location,
  drop column zip_code,
  drop column push_token,
  drop column push_active,
  drop column device_type;
