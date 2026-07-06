-- Two-tier staff: 'owner' can manage the roster; 'agent' can only work tickets.
-- Prevents a compromised agent account from enrolling accomplices or removing
-- the owner. Roster writes are owner-only; the last owner can't be removed.

alter table public.support_staff
  add column if not exists role text not null default 'agent'
    check (role in ('owner','agent'));

-- Existing seeded accounts become owners.
update public.support_staff set role = 'owner'
 where profile_id in ('d0ba6189-006c-4089-a9af-de898be9e5f2',
                      'b40f318f-ae04-4d3f-9324-c65a448b870c');

create or replace function public.is_support_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.support_staff
    where profile_id = auth.uid() and role = 'owner'
  );
$$;
revoke execute on function public.is_support_owner() from anon, public;
grant execute on function public.is_support_owner() to authenticated;

-- Owner-only roster management (agents keep read via the existing select policy).
create policy support_staff_owner_insert on public.support_staff for insert to authenticated
  with check (public.is_support_owner());
create policy support_staff_owner_update on public.support_staff for update to authenticated
  using (public.is_support_owner()) with check (public.is_support_owner());
create policy support_staff_owner_delete on public.support_staff for delete to authenticated
  using (public.is_support_owner());

-- Guard: never leave the desk without an owner (blocks deleting or demoting
-- the last remaining owner).
create or replace function public.guard_last_support_owner()
returns trigger language plpgsql set search_path = public as $$
declare
  owners_left int;
begin
  if tg_op = 'DELETE' then
    if old.role <> 'owner' then return old; end if;
    select count(*) into owners_left from public.support_staff where role = 'owner' and profile_id <> old.profile_id;
    if owners_left = 0 then raise exception 'Cannot remove the last owner'; end if;
    return old;
  else -- UPDATE
    if old.role = 'owner' and new.role <> 'owner' then
      select count(*) into owners_left from public.support_staff where role = 'owner' and profile_id <> old.profile_id;
      if owners_left = 0 then raise exception 'Cannot demote the last owner'; end if;
    end if;
    return new;
  end if;
end $$;
revoke execute on function public.guard_last_support_owner() from anon, authenticated, public;

drop trigger if exists trg_guard_last_owner on public.support_staff;
create trigger trg_guard_last_owner
  before delete or update on public.support_staff
  for each row execute function public.guard_last_support_owner();
